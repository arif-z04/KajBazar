# 🛠️ KajBazar: A Community-Driven Service Provider Directory Platform

[![NET 8.0](https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet)](https://dotnet.microsoft.com/)
[![React 18](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev/)
[![PostgreSQL 15](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql)](https://www.postgresql.org/)
[![Course](https://img.shields.io/badge/Course-CIT--222-orange)](file:///home/noir/Desktop/4th/Project/docs/KajBazar_Project_Proposal_Formatted.md)

**KajBazar** is a web-based community service provider directory platform designed to connect consumers directly with verified local skilled workers (electricians, plumbers, carpenters, mechanics, painters, etc.). 

Unlike traditional service marketplaces that enforce intermediary fees or handle bookings through third-party call centers, KajBazar functions as a trusted directory enabling consumers to search for professionals by location and category, view verified credentials, contact workers directly, and share experiences through ratings and reviews.

---

## 📌 Key Features

- 🔍 **Location & Category Search (`BR-05`)**: Search skilled workers filtered by service category, district, and upazila (sub-district).
- ✅ **Verified Worker Profiles (`BR-02`, `BR-03`)**: Only administrator-verified service providers are visible in the public directory.
- 📞 **Direct Contact System (`BR-06`)**: Direct phone communication between consumers and workers without platform commissions or intermediaries.
- ⭐ **Ratings & Reviews (`BR-07`, `BR-08`)**: Transparent consumer feedback with automated aggregate score calculation and single-review enforcement per consumer per worker.
- 🤝 **Community Recommendations (`BR-09`)**: Enables community members to submit recommendations for skilled offline workers not yet registered on the platform.
- 🛡️ **Administrative Moderation & Audit Logging (`BR-10` to `BR-14`)**: Centralized admin dashboard for worker verification, policy moderation, category management, and audit tracking.

---

## 🏗️ System Architecture & Tech Stack

```mermaid
flowchart LR
    Client[React.js Single Page App\n(Port 3000)] <-->|REST API / JWT| API[ASP.NET Core Web API\n.NET 8.0 - Port 5000]
    API <-->|Entity Framework Core| DB[(PostgreSQL Database\nkajbazar_db - Port 5432)]
```

### Technology Breakdown

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, React Router v6, Axios | Responsive Single Page Application with JWT authorization interceptor and Context API state management |
| **Backend API** | ASP.NET Core (.NET 8.0) | Layered RESTful Web API architecture with dependency injection and controller endpoints |
| **ORM** | Entity Framework Core 8 | Object-Relational Mapping with PostgreSQL provider (`Npgsql`) |
| **Database** | PostgreSQL 15+ | Relational DBMS with custom B-Tree indexes, check constraints, UUIDs, and automated timestamp triggers |
| **Security** | JWT & BCrypt | Role-Based Access Control (`Admin`, `Consumer`, `ServiceProvider`) with password hashing |

---

## 📁 Repository Structure

```
Project/
├── client/                                  # React.js Frontend Application
│   ├── package.json                         # Node dependencies manifest
│   └── src/
│       ├── components/                      # Reusable UI components (WorkerCard, WorkerFilter, Navbar)
│       ├── context/                         # AuthContext state provider
│       ├── pages/                           # View pages (HomePage, Directory, Recommend, Admin, Auth)
│       ├── services/                        # Axios API wrapper with JWT interceptor
│       └── styles/                          # Responsive CSS stylesheets
├── docs/                                    # Technical Documentation
│   ├── KajBazar_Project_Proposal_Formatted.md # Original System Analysis & Design proposal
│   ├── Database-details.md                  # Comprehensive DB data dictionary & schema specs
│   ├── Class-diagrams.md                    # UML Class diagrams in Mermaid syntax
│   ├── E-R-diagram.mmd                      # Entity-Relationship diagram
│   ├── Frontend-guide.md                    # Step-by-step frontend building roadmap
│   ├── Testing-procedure.md                 # Complete testing guide & business rules verification matrix
│   ├── Project-running-and-publishing.md    # Local execution, hosting, and production deployment guide
│   └── walkthrough.md                       # Task execution roadmap
├── sql/                                     # PostgreSQL SQL Scripts
│   ├── 01_schema_ddl.sql                    # Database DDL schema (12 tables, keys, triggers)
│   ├── 02_seed_data.sql                     # Initial seed data (roles, categories, Bangladesh districts/upazilas)
│   ├── 03_crud_queries.sql                  # Core operational CRUD SQL queries
│   └── 04_complex_queries.sql               # Complex analytical queries (location search, DENSE_RANK rankings)
└── src/                                     # ASP.NET Core Backend Solution
    ├── KajBazar.API/                        # Web API Controllers & Program configuration
    ├── KajBazar.Core/                       # Domain Entities, Enums, and Repository Interfaces
    └── KajBazar.Infrastructure/             # EF Core DbContext and Data Access implementation
```

---

## 🚀 Quick Start Guide

### 1. Database Initialization (PostgreSQL)

Create database and execute schema DDL and seed data scripts:
```bash
# Create database in PostgreSQL
psql -U postgres -c "CREATE DATABASE kajbazar_db;"

# Execute DDL schema script
psql -U postgres -d kajbazar_db -f sql/01_schema_ddl.sql

# Execute Seed Data script
psql -U postgres -d kajbazar_db -f sql/02_seed_data.sql
```

### 2. Backend Execution (.NET 8 Web API)

```bash
# Navigate to API project directory
cd src/KajBazar.API

# Restore dependencies and run API server
dotnet restore
dotnet run
```
Access Swagger API documentation at `http://localhost:5000/swagger`.

### 3. Frontend Execution (React.js)

```bash
# Navigate to client directory
cd client

# Install Node modules and start development server
npm install
npm start
```
Access application at `http://localhost:3000`.

---

## 📊 SQL Query Capabilities

The repository contains pre-built SQL scripts in the `sql/` directory:
- **`sql/01_schema_ddl.sql`**: Full DDL schema with 12 tables, constraints, UUID primary keys, B-Tree indexes, and timestamp triggers.
- **`sql/02_seed_data.sql`**: Default roles, Bangladesh regional geography (Districts & Upazilas), service categories, and sample verified worker profiles.
- **`sql/03_crud_queries.sql`**: Operational queries for user registration, worker profile creation, review posting, and recommendation submission.
- **`sql/04_complex_queries.sql`**:
  - Multi-criteria location & category worker search with rating aggregates and pagination.
  - Top-rated worker rankings per district & category using `DENSE_RANK()` window functions.
  - 1-to-5 star rating breakdown percentages.
  - Admin dashboard metric analytics.

---

## 🧪 Testing & Production Publishing

Detailed documentation for testing and deployment is available in `docs/`:
- 🧪 **Testing Procedure**: Refer to [`docs/Testing-procedure.md`](file:///home/noir/Desktop/4th/Project/docs/Testing-procedure.md) for unit tests, Postman collection endpoints, and the Business Rules Compliance Audit matrix (`BR-01` to `BR-15`).
- 🌐 **Deployment & Publishing**: Refer to [`docs/Project-running-and-publishing.md`](file:///home/noir/Desktop/4th/Project/docs/Project-running-and-publishing.md) for Linux systemd service unit setup, Nginx reverse proxy configuration, Certbot SSL setup, and GitHub Actions CI/CD pipeline.

---

## 🎓 Academic Metadata & Credits

- **Course Title**: System Analysis and Design Sessional
- **Course Code**: CIT - 222
- **Session**: 2023-2024
- **Faculty**: Faculty of Computer Science and Engineering, Patuakhali Science and Technology University

### Project Team
| Name | Student ID |
| :--- | :---: |
| **Md Leon Islam** | 2302008 |
| **Tanvir Ishrak** | 2302049 |
| **S M Arifuzzaman** | 2302054 |
| **Asif Md. Iqbal Sourav** | 2302067 |

### Course Instructors
- **Prof. Golam Md. Muradul Bashir**, Professor, Dept. of CCE, PSTU
- **Muhtasim**, Lecturer, Dept. of CSIT, PSTU
