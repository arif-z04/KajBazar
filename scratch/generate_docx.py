#!/usr/bin/env python3
"""
Generate a professional A4 DOCX containing all 15 KajBazar system diagrams.
Each diagram gets its own page with optimal orientation (landscape/portrait).
"""

import os
import tempfile
import cairosvg
from docx import Document
from docx.shared import Inches, Pt, Cm, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.section import WD_ORIENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement
from PIL import Image
import io

# ── Configuration ──────────────────────────────────────────────────────────────

IMAGES_DIR = "/home/noir/Desktop/PROJECTS/Kajbazar/images"
OUTPUT_PATH = "/home/noir/Desktop/PROJECTS/Kajbazar/images/KajBazar_System_Diagrams.docx"

# A4 dimensions
A4_W_CM = 21.0  # portrait width
A4_H_CM = 29.7  # portrait height

# Margins (cm)
MARGIN_TOP = 1.5
MARGIN_BOTTOM = 1.5
MARGIN_LEFT = 1.8
MARGIN_RIGHT = 1.8

# Header area reserved for title (cm)
TITLE_AREA_CM = 2.2

# Diagrams in order: (filename, title, subtitle)
DIAGRAMS = [
    ("01_context_diagram.svg",
     "Figure 1: Context Diagram",
     "High-level system boundary showing external actors and data flows"),
    ("02_dfd_level_0.svg",
     "Figure 2: Level 0 Data Flow Diagram",
     "Interaction between actors, core process, and data stores"),
    ("03_dfd_level_1.svg",
     "Figure 3: Level 1 Data Flow Diagram",
     "Subsystem decomposition — Processes P1 through P5"),
    ("04_dfd_level_2.svg",
     "Figure 4: Level 2 Data Flow Diagram",
     "Detailed decomposition of Process 3.0 — Directory Search & Direct Contact"),
    ("05_use_case_diagram.svg",
     "Figure 5: Use Case Diagram",
     "Actor interactions — 4 actors, 16 use cases with «includes» relationships"),
    ("06_activity_registration.svg",
     "Figure 6: Activity Diagram — User Registration",
     "User registration & authentication workflow (BR-01, BR-13)"),
    ("07_activity_worker_verification.svg",
     "Figure 7: Activity Diagram — Worker Verification",
     "Worker profile creation & admin verification flow (BR-02, BR-03, BR-10)"),
    ("08_activity_search_contact.svg",
     "Figure 8: Activity Diagram — Search & Contact",
     "Worker search & direct contact workflow (BR-05, BR-06)"),
    ("09_activity_review.svg",
     "Figure 9: Activity Diagram — Review Submission",
     "Review & rating submission with automatic aggregation (BR-07, BR-08)"),
    ("10_activity_recommendation.svg",
     "Figure 10: Activity Diagram — Community Recommendation",
     "Offline worker recommendation & admin moderation (BR-09)"),
    ("11_class_diagram_domain.svg",
     "Figure 11: Class Diagram — Domain Model",
     "C# domain entities, value objects, enums, and entity relationships"),
    ("12_class_diagram_architecture.svg",
     "Figure 12: Class Diagram — Clean Architecture",
     "API Controllers, Service Interfaces, Repository Implementations & DbContext"),
    ("13_er_diagram_conceptual.svg",
     "Figure 13: ER Diagram — Conceptual",
     "High-level business concepts, entities, and relationships"),
    ("14_er_diagram_physical.svg",
     "Figure 14: ER Diagram — Physical Schema",
     "Complete PostgreSQL 12-table schema with column types, PKs, FKs & constraints"),
    ("15_sequence_diagram.svg",
     "Figure 15: Sequence Diagram",
     "Multi-criteria search & direct contact flow (BR-05, BR-06)"),
]


def get_svg_dimensions(svg_path):
    """Extract viewBox dimensions from SVG file."""
    import re
    with open(svg_path, 'r') as f:
        content = f.read(2000)  # Read first 2KB for the viewBox
    match = re.search(r'viewBox\s*=\s*"([^"]+)"', content)
    if match:
        parts = match.group(1).split()
        return float(parts[2]), float(parts[3])
    # Fallback: try width/height attributes
    w_match = re.search(r'width\s*=\s*"(\d+)"', content)
    h_match = re.search(r'height\s*=\s*"(\d+)"', content)
    if w_match and h_match:
        return float(w_match.group(1)), float(h_match.group(1))
    return 1400, 1000  # default fallback


def choose_orientation(svg_w, svg_h):
    """
    Choose page orientation based on diagram aspect ratio.
    Wide diagrams → landscape, tall/square diagrams → portrait.
    """
    aspect = svg_w / svg_h
    if aspect >= 1.25:
        return "landscape"
    elif aspect <= 0.85:
        return "portrait"
    else:
        # Near-square: landscape usually works better for diagrams
        return "landscape" if aspect >= 1.0 else "portrait"


def svg_to_png(svg_path, target_width_px=2400):
    """Convert SVG to high-resolution PNG bytes, maintaining aspect ratio."""
    svg_w, svg_h = get_svg_dimensions(svg_path)
    aspect = svg_w / svg_h
    target_height_px = int(target_width_px / aspect)

    png_data = cairosvg.svg2png(
        url=svg_path,
        output_width=target_width_px,
        output_height=target_height_px,
    )
    return png_data, target_width_px, target_height_px


def set_section_orientation(section, orientation):
    """Set page orientation and dimensions for a section."""
    if orientation == "landscape":
        section.orientation = WD_ORIENT.LANDSCAPE
        section.page_width = Cm(A4_H_CM)   # 29.7cm
        section.page_height = Cm(A4_W_CM)  # 21.0cm
    else:
        section.orientation = WD_ORIENT.PORTRAIT
        section.page_width = Cm(A4_W_CM)   # 21.0cm
        section.page_height = Cm(A4_H_CM)  # 29.7cm

    section.top_margin = Cm(MARGIN_TOP)
    section.bottom_margin = Cm(MARGIN_BOTTOM)
    section.left_margin = Cm(MARGIN_LEFT)
    section.right_margin = Cm(MARGIN_RIGHT)


def add_page_border(section):
    """Add a subtle page border to the section."""
    sectPr = section._sectPr
    pgBorders = OxmlElement('w:pgBorders')
    pgBorders.set(qn('w:offsetFrom'), 'page')

    for border_name in ['top', 'left', 'bottom', 'right']:
        border_el = OxmlElement(f'w:{border_name}')
        border_el.set(qn('w:val'), 'single')
        border_el.set(qn('w:sz'), '6')       # thin border
        border_el.set(qn('w:space'), '24')
        border_el.set(qn('w:color'), '1e3a8a')  # navy blue
        pgBorders.append(border_el)

    sectPr.append(pgBorders)


def add_cover_page(doc):
    """Add a professional cover/title page."""
    section = doc.sections[0]
    set_section_orientation(section, "portrait")
    add_page_border(section)

    # Spacer
    for _ in range(4):
        doc.add_paragraph("")

    # Main title
    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = title.add_run("🛠️ KajBazar")
    run.font.size = Pt(42)
    run.font.color.rgb = RGBColor(0x1e, 0x3a, 0x8a)
    run.font.bold = True

    # Subtitle
    sub = doc.add_paragraph()
    sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = sub.add_run("System Analysis & Design\nDiagram Document")
    run.font.size = Pt(24)
    run.font.color.rgb = RGBColor(0x37, 0x41, 0x51)

    doc.add_paragraph("")

    # Description
    desc = doc.add_paragraph()
    desc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = desc.add_run(
        "Community-Driven Service Provider Directory Platform\n"
        "A comprehensive collection of 15 system architecture diagrams"
    )
    run.font.size = Pt(14)
    run.font.color.rgb = RGBColor(0x6b, 0x72, 0x80)

    # Spacer
    for _ in range(4):
        doc.add_paragraph("")

    # Divider line
    div = doc.add_paragraph()
    div.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = div.add_run("━" * 50)
    run.font.color.rgb = RGBColor(0x05, 0x96, 0x69)
    run.font.size = Pt(12)

    doc.add_paragraph("")

    # Metadata
    meta_items = [
        ("Course", "CIT-222: System Analysis and Design Sessional"),
        ("Session", "2023-2024"),
        ("Institution", "PSTU — Faculty of Computer Science & Engineering"),
        ("Technology", ".NET 8 · React 18 · PostgreSQL 15+"),
    ]
    for label, value in meta_items:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run_label = p.add_run(f"{label}: ")
        run_label.font.size = Pt(12)
        run_label.font.bold = True
        run_label.font.color.rgb = RGBColor(0x1e, 0x3a, 0x8a)
        run_val = p.add_run(value)
        run_val.font.size = Pt(12)
        run_val.font.color.rgb = RGBColor(0x37, 0x41, 0x51)


def add_toc_page(doc):
    """Add a Table of Contents page."""
    doc.add_section()
    section = doc.sections[-1]
    set_section_orientation(section, "portrait")
    add_page_border(section)

    # TOC Header
    toc_title = doc.add_paragraph()
    toc_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = toc_title.add_run("📋 Table of Contents")
    run.font.size = Pt(24)
    run.font.bold = True
    run.font.color.rgb = RGBColor(0x1e, 0x3a, 0x8a)

    doc.add_paragraph("")

    # Group diagrams by category
    categories = [
        ("Data Flow Diagrams", DIAGRAMS[0:4]),
        ("Use Case Diagram", DIAGRAMS[4:5]),
        ("Activity Diagrams", DIAGRAMS[5:10]),
        ("Class Diagrams", DIAGRAMS[10:12]),
        ("Entity-Relationship Diagrams", DIAGRAMS[12:14]),
        ("Sequence Diagram", DIAGRAMS[14:15]),
    ]

    for cat_name, items in categories:
        # Category header
        cat_p = doc.add_paragraph()
        run = cat_p.add_run(f"▸ {cat_name}")
        run.font.size = Pt(14)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x05, 0x96, 0x69)

        # Items
        for _, title, subtitle in items:
            item_p = doc.add_paragraph()
            item_p.paragraph_format.left_indent = Cm(1.0)
            item_p.paragraph_format.space_after = Pt(2)
            run_t = item_p.add_run(f"  {title}")
            run_t.font.size = Pt(11)
            run_t.font.bold = True
            run_t.font.color.rgb = RGBColor(0x11, 0x18, 0x27)

            sub_p = doc.add_paragraph()
            sub_p.paragraph_format.left_indent = Cm(1.5)
            sub_p.paragraph_format.space_after = Pt(6)
            run_s = sub_p.add_run(subtitle)
            run_s.font.size = Pt(9)
            run_s.font.italic = True
            run_s.font.color.rgb = RGBColor(0x6b, 0x72, 0x80)

        doc.add_paragraph("").paragraph_format.space_after = Pt(4)


def add_diagram_page(doc, svg_filename, title, subtitle, is_first=False):
    """Add a page with a diagram image, properly oriented and fitted."""
    svg_path = os.path.join(IMAGES_DIR, svg_filename)
    if not os.path.exists(svg_path):
        print(f"  ⚠ Skipping {svg_filename} — file not found")
        return

    svg_w, svg_h = get_svg_dimensions(svg_path)
    orientation = choose_orientation(svg_w, svg_h)

    print(f"  📐 {svg_filename}: {svg_w}×{svg_h} → {orientation}")

    # Add new section with correct orientation
    doc.add_section()
    section = doc.sections[-1]
    set_section_orientation(section, orientation)
    add_page_border(section)

    # Calculate available content area
    if orientation == "landscape":
        content_w_cm = A4_H_CM - MARGIN_LEFT - MARGIN_RIGHT    # ~26.1cm
        content_h_cm = A4_W_CM - MARGIN_TOP - MARGIN_BOTTOM    # ~18.0cm
    else:
        content_w_cm = A4_W_CM - MARGIN_LEFT - MARGIN_RIGHT    # ~17.4cm
        content_h_cm = A4_H_CM - MARGIN_TOP - MARGIN_BOTTOM    # ~26.7cm

    # Reserve space for title + subtitle
    img_h_cm = content_h_cm - TITLE_AREA_CM

    # Calculate image dimensions to fit within available space
    img_aspect = svg_w / svg_h
    avail_aspect = content_w_cm / img_h_cm

    if img_aspect > avail_aspect:
        # Width-constrained
        final_w_cm = content_w_cm
        final_h_cm = content_w_cm / img_aspect
    else:
        # Height-constrained
        final_h_cm = img_h_cm
        final_w_cm = img_h_cm * img_aspect

    # Convert SVG to PNG at high resolution
    render_width = max(2400, int(final_w_cm * 120))  # ~120 DPI minimum
    png_data, _, _ = svg_to_png(svg_path, target_width_px=render_width)

    # Write PNG to temp file
    tmp = tempfile.NamedTemporaryFile(suffix='.png', delete=False)
    tmp.write(png_data)
    tmp.close()

    try:
        # Title
        title_p = doc.add_paragraph()
        title_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        title_p.paragraph_format.space_after = Pt(2)
        run = title_p.add_run(title)
        run.font.size = Pt(16)
        run.font.bold = True
        run.font.color.rgb = RGBColor(0x1e, 0x3a, 0x8a)

        # Subtitle
        sub_p = doc.add_paragraph()
        sub_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        sub_p.paragraph_format.space_after = Pt(8)
        run = sub_p.add_run(subtitle)
        run.font.size = Pt(10)
        run.font.italic = True
        run.font.color.rgb = RGBColor(0x6b, 0x72, 0x80)

        # Image
        img_p = doc.add_paragraph()
        img_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = img_p.add_run()
        run.add_picture(tmp.name, width=Cm(final_w_cm), height=Cm(final_h_cm))

    finally:
        os.unlink(tmp.name)


def main():
    print("=" * 60)
    print("  KajBazar System Diagrams — DOCX Generator")
    print("=" * 60)

    doc = Document()

    # Set default font
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Calibri'
    font.size = Pt(11)

    # ── Cover Page ──
    print("\n📄 Creating cover page...")
    add_cover_page(doc)

    # ── Table of Contents ──
    print("📋 Creating table of contents...")
    add_toc_page(doc)

    # ── Diagram Pages ──
    print("\n🖼️  Generating diagram pages:")
    for i, (filename, title, subtitle) in enumerate(DIAGRAMS):
        add_diagram_page(doc, filename, title, subtitle, is_first=(i == 0))

    # ── Save ──
    print(f"\n💾 Saving to: {OUTPUT_PATH}")
    doc.save(OUTPUT_PATH)
    file_size = os.path.getsize(OUTPUT_PATH)
    print(f"✅ Done! File size: {file_size / 1024:.0f} KB")
    print(f"   Total pages: {len(DIAGRAMS) + 2} (cover + TOC + {len(DIAGRAMS)} diagrams)")


if __name__ == "__main__":
    main()
