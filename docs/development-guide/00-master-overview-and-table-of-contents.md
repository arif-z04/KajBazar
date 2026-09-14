# KajBazar - Master Developer Guide & System Handbook
## Complete Construction, Operation, Security, and Maintenance Manual
### Course: System Analysis and Design Sessional (CIT-222)
### Institution: Patuakhali Science and Technology University (PSTU)

---

## 🌟 Welcome to the KajBazar Master Guide!

> *"Explain it to me like I am five, step-by-step, with no skipped steps and no technical jargon left unexplained."*

If you are reading this, you are holding the **complete master blueprint** for **KajBazar: A Community-Driven Service Provider Directory Platform**. Whether you are a first-year computer science student, an experienced software engineer, a system administrator, or someone who has never written a line of code in C# or React before, **this guide was written specifically for you**.

Every single technical concept, architecture pattern, database query, API route, and security check in this system is broken down into simple, intuitive, step-by-step language.

---

## 📚 Table of Contents Across the 10 Master Volumes

All development documentation is organized into 10 structured, comprehensive volumes in this directory (`docs/development-guide/`):

| Volume | Document Name | File Path | Focus Area & Key Topics Covered |
| :---: | :--- | :--- | :--- |
| **00** | **Master Overview & System Map** | [`00-master-overview-and-table-of-contents.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/00-master-overview-and-table-of-contents.md) | Platform overview, core problem statement, business objectives, and documentation index. |
| **01** | **Architecture & Build From Scratch** | [`01-complete-architecture-and-build-from-scratch.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/01-complete-architecture-and-build-from-scratch.md) | Clean 3-tier architecture, building from zero on an empty computer, step-by-step creation of solution, projects, and files. |
| **02** | **Database Guide & Production Hardening** | [`02-database-guide-and-production-hardening.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/02-database-guide-and-production-hardening.md) | PostgreSQL relational schema, all 12 tables, primary/foreign keys, B-Tree indexes, automated review rating triggers, and backup/restore. |
| **03** | **Backend ASP.NET Core 8 Guide** | [`03-backend-aspnet-core-developer-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/03-backend-aspnet-core-developer-guide.md) | ASP.NET Core 8 Web API, C# async/await, Entity Framework Core, JWT Bearer authentication, RBAC, controllers, and repositories. |
| **04** | **Frontend React.js & Vite Guide** | [`04-frontend-react-developer-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/04-frontend-react-developer-guide.md) | React 18 SPA, Vite build system, Context API global state, Axios interceptors, responsive components, and styling system. |
| **05** | **Testing Guide & Test Suites** | [`05-testing-guide-and-test-suites.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/05-testing-guide-and-test-suites.md) | Complete testing manual: xUnit unit tests, in-memory repository tests, business rule audits (`BR-01` to `BR-15`), and curl/Postman test scripts. |
| **06** | **Deployment & DevOps Guide** | [`06-deployment-and-devops-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/06-deployment-and-devops-guide.md) | Production deployment to Ubuntu Linux, Kestrel systemd background service, Nginx reverse proxy, Certbot SSL, and GitHub Actions CI/CD. |
| **07** | **Troubleshooting & FAQ Guide** | [`07-troubleshooting-and-faq-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/07-troubleshooting-and-faq-guide.md) | 25+ real-world bugs, connection errors, CORS failures, token expiration issues, port conflicts, and their exact copy-paste fixes. |
| **08** | **Maintenance & Evolution Guide** | [`08-maintenance-and-evolution-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/08-maintenance-and-evolution-guide.md) | Day-to-day operations, database migrations, package upgrades, adding new features, logging with `journalctl`, and cron job backups. |
| **09** | **Security & Incident Response Guide** | [`09-security-and-incident-response-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/09-security-and-incident-response-guide.md) | OWASP Top 10 defenses, BCrypt password hashing, JWT secret management, SQL injection prevention, rate limiting, and incident response playbook. |
| **10** | **Performance Optimization & Scaling** | [`10-performance-optimization-and-scaling-guide.md`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/10-performance-optimization-and-scaling-guide.md) | Database query profiling with `EXPLAIN ANALYZE`, connection pooling, Redis caching, bundle minification, and load balancing. |

---

## 🎯 1. What is KajBazar? (The Plain-English Explanation)

Imagine you are at home in Dumki, Patuakhali, and suddenly a water pipe bursts under your kitchen sink, or your ceiling fan wiring burns out. What do most people in Bangladesh do today?
1. They walk out into the neighborhood bazaar asking shopkeepers: *"Do you know a good electrician?"*
2. Or they call three different relatives asking: *"Can you give me the phone number of that plumber who fixed your pump last month?"*

### The Real Problems in the Real World:
- **For Consumers**: Finding a reliable, qualified skilled worker in your specific upazila is frustrating, slow, and uncertain. You have no idea if the worker is skilled, what they charge, or if past customers had good experiences.
- **For Skilled Workers**: Hardworking tradespeople (electricians, mechanics, carpenters, plumbers, painters) often struggle to find consistent work because they rely entirely on word-of-mouth. They don't have personal websites or marketing budgets.
- **For Existing Marketplaces**: Platforms like Sheba.xyz or Handy act as strict middlemen. They take a large percentage commission from the worker's earnings, control the communication, and charge booking fees to consumers.

### How KajBazar Solves This:
**KajBazar** is a community-driven digital directory platform designed specifically for Bangladesh:
1. **Direct Contact (BR-06)**: When a consumer finds an electrician, they simply click *"Contact Worker"* and immediately get the worker's direct mobile phone number (`017xxxxxxxx`). They call directly. No middleman, no platform cut, no booking fees!
2. **Verified Profiles (BR-03)**: Workers create professional profiles with their experience, skills, and rates. Platform administrators verify their credentials before they appear in public search.
3. **Location Hierarchy (BR-05)**: Search workers specifically in your District (e.g. Patuakhali) and Upazila (e.g. Dumki).
4. **Community Referrals (BR-09)**: Many of the best traditional tradespeople in Bangladesh do not own smartphones or know how to register online. KajBazar allows any community member to submit an offline worker's name and phone number. Platform admins then call the worker, verify their trade, and onboard them into the directory!
5. **Transparent Reviews & Ratings (BR-07, BR-08)**: Registered consumers leave star ratings (1 to 5) and written feedback, ensuring community accountability.

---

## 🏗️ 2. High-Level Technology Stack & Rationale

```
+------------------------------------------------------------------------+
| FRONTEND CLIENT (Browser SPA)                                          |
| - React.js 18 with modern Functional Components & Hooks                |
| - Vite: Ultra-fast bundler, sub-second HMR development & build         |
| - React Router DOM v6: Client-side routing without full page reloads   |
| - Axios: HTTP client with automatic JWT Bearer Authorization headers   |
| - Custom CSS Design System: Inter typography, responsive CSS Grid     |
+------------------------------------------------------------------------+
                                   |
                         HTTPS REST API (JSON)
                                   |
+------------------------------------------------------------------------+
| BACKEND SERVER (ASP.NET Core 8 Web API)                                |
| - ASP.NET Core 8 (.NET 8.0 LTS / .NET 10.0 runtime compatible)         |
| - Clean Layered Architecture: Core, Infrastructure, API                |
| - Dependency Injection: Decoupled service and repository interfaces    |
| - JWT Bearer Authentication & Role-Based Access Control (RBAC)         |
| - BCrypt.Net: Cost factor 11 cryptographic password hashing            |
| - Swagger / OpenAPI v1: Interactive browser API documentation           |
+------------------------------------------------------------------------+
                                   |
                     Object-Relational Mapping (ORM)
                                   |
+------------------------------------------------------------------------+
| DATA ACCESS LAYER (Entity Framework Core 8)                           |
| - Npgsql.EntityFrameworkCore.PostgreSQL provider                       |
| - EFCore.NamingConventions: Automatic snake_case column and table maps |
| - Fluent API Configuration: Explicit Foreign Keys, Enums & Conversions |
+------------------------------------------------------------------------+
                                   |
                             Native SQL / TCP
                                   |
+------------------------------------------------------------------------+
| RELATIONAL DATABASE (PostgreSQL 15+)                                   |
| - 12 Relational Tables with strong ACID guarantees                     |
| - UUID Primary Keys (`gen_random_uuid()`) for decentralized security   |
| - Multi-column B-Tree Performance Indexes for search query acceleration|
| - Automatic PostgreSQL Trigger Functions for review aggregate updates  |
| - Administrative Audit Logging Table for operational traceability      |
+------------------------------------------------------------------------+
```

---

## 📋 3. System Business Rules Quick Reference

The platform strictly enforces the 15 core Business Rules specified in the proposal:

- **`BR-01`**: Every user must register and authenticate before accessing protected features.
- **`BR-02`**: Service providers must complete profile details (bio, rate, location, categories) before requesting verification.
- **`BR-03`**: Only verified workers (`verification_status = 'VERIFIED'`) appear in public directory search results.
- **`BR-04`**: Workers can specialize in multiple service categories (multi-category junction mapping).
- **`BR-05`**: Consumers can search and filter workers by category, district, and upazila.
- **`BR-06`**: Consumers directly contact verified workers via revealed phone numbers without intermediaries or fees.
- **`BR-07`**: Only authenticated consumers can submit ratings and reviews.
- **`BR-08`**: A consumer may submit only one review per worker. If submitted again, the previous review is updated.
- **`BR-09`**: Community members can recommend skilled offline workers for admin review.
- **`BR-10`**: Only administrators can approve, reject, or suspend worker profiles.
- **`BR-11`**: Administrators manage service categories, districts, and upazila taxonomy.
- **`BR-12`**: Content reports and policy violations are moderated exclusively by administrators.
- **`BR-13`**: RBAC ensures protected dashboard endpoints require valid JWT claims (`Consumer`, `ServiceProvider`, `Admin`).
- **`BR-14`**: The system records all administrative actions in an audit log table for auditing.
- **`BR-15`**: All passwords are encrypted with salted BCrypt; personal data is protected via role-based access.

---

## 🚀 4. How to Read and Use These Guides

1. **If you want to understand the system from scratch**: Read Volume [`01`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/01-complete-architecture-and-build-from-scratch.md) and Volume [`02`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/02-database-guide-and-production-hardening.md).
2. **If you need to run the application right now**: Follow the quickstart instructions in Volume [`01`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/01-complete-architecture-and-build-from-scratch.md) Section 7.
3. **If you want to run tests and verify functionality**: Go directly to Volume [`05`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/05-testing-guide-and-test-suites.md).
4. **If you are deploying to a production Linux server**: Follow the step-by-step checklist in Volume [`06`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/06-deployment-and-devops-guide.md).
5. **If you encounter an error or bug**: Look up the exact symptom in Volume [`07`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/07-troubleshooting-and-faq-guide.md).
6. **If you want to understand database schema or security**: Study Volume [`02`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/02-database-guide-and-production-hardening.md) and Volume [`09`](file:///home/noir/Desktop/PROJECTS/Kajbazar/docs/development-guide/09-security-and-incident-response-guide.md).
