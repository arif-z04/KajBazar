# KajBazar - Master Developer Guide & System Handbook
## Complete Construction, Operation, Security, and Maintenance Manual
### Course: System Analysis and Design Sessional (CIT-222)
### Institution: Patuakhali Science and Technology University (PSTU)

---

## 🌟 Welcome to the KajBazar Master Guide!

> *"Explain it to me like I am five, step-by-step, with no skipped steps and no technical jargon left unexplained."*

If you are reading this, you are holding the **complete master blueprint** for **KajBazar: A Community-Driven Service Provider Directory Platform**. Whether you are a first-year computer science student, an experienced software engineer, a system administrator, or someone who has never written a line of code in C# or React before, **this guide was written specifically for you**.

Every single technical concept, architecture pattern, database query, API route, security check, and styling rule in this system is broken down into simple, intuitive, step-by-step language.

---

## 📚 Master Curriculum Map Across All 11 Volumes

All development documentation is organized into 11 structured, comprehensive volumes in this directory (`docs/development-guide/`):

| Volume | Title | File Path | Focus Area & Key Topics Covered |
| :---: | :--- | :--- | :--- |
| **00** | **Master Overview & System Map** | [`00-master-overview-and-table-of-contents.md`](00-master-overview-and-table-of-contents.md) | Platform overview, core problem statement, business objectives, curriculum tracks, and documentation index. |
| **01** | **Architecture & Build From Scratch** | [`01-complete-architecture-and-build-from-scratch.md`](01-complete-architecture-and-build-from-scratch.md) | Clean 3-tier architecture, building from zero on an empty computer, step-by-step creation of solution, projects, and files. |
| **02** | **Database Guide & Production Hardening** | [`02-database-guide-and-production-hardening.md`](02-database-guide-and-production-hardening.md) | PostgreSQL relational schema, all 12 tables, primary/foreign keys, B-Tree indexes, automated review rating triggers, and backup/restore. |
| **03** | **Backend ASP.NET Core 8 Guide** | [`03-backend-aspnet-core-developer-guide.md`](03-backend-aspnet-core-developer-guide.md) | ASP.NET Core 8 Web API, C# async/await, Entity Framework Core, JWT Bearer authentication, RBAC, controllers, and repositories. |
| **04** | **Frontend React.js & Vite Guide** | [`04-frontend-react-developer-guide.md`](04-frontend-react-developer-guide.md) | React 18 SPA, Vite build system, Context API global state, Axios interceptors, responsive components, and styling system. |
| **05** | **Testing Guide & Test Suites** | [`05-testing-guide-and-test-suites.md`](05-testing-guide-and-test-suites.md) | Complete testing manual: xUnit unit tests, in-memory repository tests, business rule audits (`BR-01` to `BR-15`), and automated CLI tests. |
| **06** | **Deployment & DevOps Guide** | [`06-deployment-and-devops-guide.md`](06-deployment-and-devops-guide.md) | Production deployment to Ubuntu Linux, Kestrel systemd background service, Nginx reverse proxy, Certbot SSL, and Docker containers. |
| **07** | **Troubleshooting & FAQ Guide** | [`07-troubleshooting-and-faq-guide.md`](07-troubleshooting-and-faq-guide.md) | 45+ real-world bugs, connection errors, CORS failures, token expiration issues, port conflicts, and their exact copy-paste fixes. |
| **08** | **Maintenance & Evolution Guide** | [`08-maintenance-and-evolution-guide.md`](08-maintenance-and-evolution-guide.md) | Day-to-day operations, zero-downtime database migrations, package upgrades, adding new features (Real-Time Chat, Appointments, SMS OTP). |
| **09** | **Security & Incident Response Guide** | [`09-security-and-incident-response-guide.md`](09-security-and-incident-response-guide.md) | OWASP Top 10 defenses, BCrypt password hashing, JWT secret management, SQL injection prevention, rate limiting, and emergency incident playbooks. |
| **10** | **Performance Optimization & Scaling** | [`10-performance-optimization-and-scaling-guide.md`](10-performance-optimization-and-scaling-guide.md) | Database query profiling with `EXPLAIN ANALYZE`, connection pooling, Redis caching, bundle minification, and load balancing. |

---

## 🎯 1. What is KajBazar? (The Plain-English Explanation)

Imagine you are at home in Dumki, Patuakhali, and suddenly a water pipe bursts under your kitchen sink, or your ceiling fan wiring burns out. What do most people in Bangladesh do today?
1. They walk out into the neighborhood bazaar asking shopkeepers: *"Do you know a good electrician?"*
2. Or they call three different relatives asking: *"Can you give me the phone number of that plumber who fixed your pump last month?"*

### The Real Problems in the Real World:
- **For Consumers**: Finding a reliable, qualified skilled worker in your specific upazila is frustrating, slow, and uncertain. You have no idea if the worker is skilled, what they charge, or if past customers had good experiences.
- **For Skilled Workers**: Hardworking tradespeople (electricians, mechanics, carpenters, plumbers, painters) often struggle to find consistent work because they rely entirely on word-of-mouth. They don't have personal websites or marketing budgets.
- **For Existing Marketplaces**: Commercial gig platforms act as strict middlemen. They take a large percentage commission from the worker's earnings, control communication, and charge booking fees to consumers.

### How KajBazar Solves This:
**KajBazar** is a community-driven digital directory platform designed specifically for Bangladesh:
1. **Direct Contact (Rule BR-06)**: When a consumer finds an electrician, they simply click *"Call Worker"* and immediately get the worker's direct mobile phone number (`017xxxxxxxx`). They call directly. No middleman, no platform cut, no booking fees!
2. **Verified Profiles (Rule BR-03)**: Workers create professional profiles with their experience, skills, and rates. Platform administrators verify their credentials before they appear in public search.
3. **Location Hierarchy (Rule BR-05)**: Search workers specifically in your District (e.g. Patuakhali) and Upazila (e.g. Dumki).
4. **Community Referrals (Rule BR-09)**: Many of the best traditional tradespeople in Bangladesh do not own smartphones or know how to register online. KajBazar allows any community member to submit an offline worker's name and phone number. Platform admins then call the worker, verify their trade, and onboard them into the directory!
5. **Transparent Reviews & Ratings (Rules BR-07, BR-08)**: Registered consumers leave star ratings (1 to 5) and written feedback, ensuring community accountability.

---

## 🗺️ 2. Recommended Learning Pathways

Depending on your personal goals and experience level, follow one of these three curated reading pathways:

### Pathway A: The Absolute Beginner Student Track
*Goal: Understand how modern web software works and learn full-stack programming.*
1. Start with [Volume 01: Architecture & Build From Scratch](01-complete-architecture-and-build-from-scratch.md) (Read Sections 1 and 2 for the Restaurant Analogy).
2. Read [Volume 02: Database Guide](02-database-guide-and-production-hardening.md) (Sections 1 and 3 to understand tables and keys).
3. Read [Volume 04: Frontend React Guide](04-frontend-react-developer-guide.md) (Sections 1 and 2 to learn React components and hooks).
4. Read [Volume 03: Backend ASP.NET Core Guide](03-backend-aspnet-core-developer-guide.md) (Sections 1 and 3 to understand APIs and C#).
5. Practice the hands-on beginner exercises at the end of each volume!

### Pathway B: The Full-Stack Software Engineer Track
*Goal: Build new features, optimize performance, and write automated tests.*
1. [Volume 01: Complete Architecture & Build From Scratch](01-complete-architecture-and-build-from-scratch.md)
2. [Volume 03: Backend ASP.NET Core Developer Guide](03-backend-aspnet-core-developer-guide.md)
3. [Volume 04: Frontend React Developer Guide](04-frontend-react-developer-guide.md)
4. [Volume 05: Testing Guide & Test Suites](05-testing-guide-and-test-suites.md)
5. [Volume 08: Maintenance & Evolution Guide](08-maintenance-and-evolution-guide.md)

### Pathway C: The DevOps & Security Track
*Goal: Deploy to production servers, configure Nginx, SSL, firewalls, and manage incidents.*
1. [Volume 06: Deployment & DevOps Guide](06-deployment-and-devops-guide.md)
2. [Volume 09: Security & Incident Response Guide](09-security-and-incident-response-guide.md)
3. [Volume 07: Troubleshooting & FAQ Guide](07-troubleshooting-and-faq-guide.md)
4. [Volume 10: Performance Optimization & Scaling Guide](10-performance-optimization-and-scaling-guide.md)

---

## 📊 3. System Diagrams Directory Index

All system architecture diagrams are available in Mermaid source format in `docs/diagrams/`:

| Diagram | Filename | Description |
| :--- | :--- | :--- |
| **Context Diagram** | [`01_context_diagram.mmd`](../diagrams/01_context_diagram.mmd) | Birds-eye view of external actors (Customers, Workers, Admins) interacting with KajBazar. |
| **DFD Level 0** | [`02_dfd_level_0.mmd`](../diagrams/02_dfd_level_0.mmd) | High-level data flow diagram showing platform boundaries and core data stores. |
| **DFD Level 1** | [`03_dfd_level_1.mmd`](../diagrams/03_dfd_level_1.mmd) | Decomposed data flow across Authentication, Worker Search, Reviews, and Administration. |
| **DFD Level 2** | [`04_dfd_level_2.mmd`](../diagrams/04_dfd_level_2.mmd) | Micro-level data flow for the Review and Rating calculation pipeline. |
| **Use Case Diagram** | [`05_use_case_diagram.mmd`](../diagrams/05_use_case_diagram.mmd) | Complete functional actor use cases across Guest, Customer, Worker, and Admin. |
| **Activity: Registration**| [`06_activity_diagram_registration.mmd`](../diagrams/06_activity_diagram_registration.mmd) | User onboarding and role selection workflow. |
| **Activity: Search** | [`07_activity_diagram_search.mmd`](../diagrams/07_activity_diagram_search.mmd) | Cascading geographic and category filtering workflow. |
| **Activity: Review** | [`08_activity_diagram_review.mmd`](../diagrams/08_activity_diagram_review.mmd) | Customer review submission and rating calculation pipeline. |
| **Activity: Referral**| [`09_activity_diagram_recommendation.mmd`](../diagrams/09_activity_diagram_recommendation.mmd) | Community worker recommendation and admin approval pipeline. |
| **Class Diagram: Domain**| [`10_class_diagram_domain.mmd`](../diagrams/10_class_diagram_domain.mmd) | Core C# Domain Entities and their OOP relationships. |
| **Class Diagram: System**| [`11_class_diagram_architecture.mmd`](../diagrams/11_class_diagram_architecture.mmd) | Clean Architecture layers: Controllers, Repositories, DbContext, and DTOs. |
| **ER Diagram: Conceptual**| [`12_er_diagram_conceptual.mmd`](../diagrams/12_er_diagram_conceptual.mmd) | High-level business entities and cardinalities (1-to-1, 1-to-many, many-to-many). |
| **ER Diagram: Physical**| [`13_er_diagram_physical.mmd`](../diagrams/13_er_diagram_physical.mmd) | Complete PostgreSQL schema with exact column types, primary keys, and foreign keys. |
| **State Diagram** | [`14_state_diagrams.mmd`](../diagrams/14_state_diagrams.mmd) | Lifecycle states of Workers (`pending` -> `verified`), Recommendations, and Reports. |
| **Sequence Diagram** | [`15_sequence_diagrams.mmd`](../diagrams/15_sequence_diagrams.mmd) | Sequence flows for Login, Search, and Rating Recalculation. |

---

## 🏁 Let's Begin Building!

Turn the page and begin your journey:
👉 **[Volume 01: Complete Architecture & Build From Scratch Guide](01-complete-architecture-and-build-from-scratch.md)**
