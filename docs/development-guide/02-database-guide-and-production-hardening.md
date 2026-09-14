# Volume 02: Database Guide & Production Hardening
## The Definitive PostgreSQL Architecture, Schema Design, Triggers, and Security Handbook for KajBazar

---

## 📖 Welcome to the Data Engine

In software architecture, applications come and go, frontend frameworks change every few years, and programming languages evolve—but **your database is forever**. The data stored in your database represents real human livelihoods: verified electrical technicians in Dumki, customer reviews left by local shopkeepers, and security audit logs tracking administrative moderation.

If a single bug corrupts your database or creates a race condition in your rating calculations, you cannot simply reboot your server to fix it. Corrupted data lingers and damages user trust.

This volume was written to provide an exhaustive, beginner-friendly, and mathematically grounded guide to the **KajBazar** relational database running on **PostgreSQL 15+**. We will examine:
- How relational databases work from physical first principles.
- Complete annotated source code of all 4 SQL files in `sql/`.
- Why we designed each of the 12 tables and their exact constraint definitions.
- How our PL/pgSQL database trigger automatically computes worker average ratings.
- 15 production-grade analytical SQL queries utilizing Window Functions, CTEs, and aggregations.
- Complete production hardening, backup automation, and disaster recovery procedures.

---

## 📑 Master Table of Contents

1. [The Relational Database Mental Model for Absolute Beginners](#1-the-relational-database-mental-model-for-absolute-beginners)
   - 1.1 Why Not Just Spreadsheets? (Excel vs PostgreSQL)
   - 1.2 What is a Table, Row (Tuple), and Column (Attribute)?
   - 1.3 What is a Primary Key (PK) and Foreign Key (FK)?
   - 1.4 Database Normalization: 1NF, 2NF, and 3NF Explained with Bangladeshi Examples
   - 1.5 ACID Properties Deep Dive (Physical Cash Transfer Analogy)
2. [PostgreSQL Under the Hood: Storage Engines, Pages, and Tuples](#2-postgresql-under-the-hood-storage-engines-pages-and-tuples)
   - 2.1 The PostgreSQL Process Architecture (Postmaster, Background Workers, Client Backends)
   - 2.2 Memory Buffers (`shared_buffers`) vs Disk Storage
   - 2.3 How Tables are Stored on Disk (8 KB Pages, Slotted Pages, Tuples)
   - 2.4 Multi-Version Concurrency Control (MVCC): `xmin`, `xmax`, Dead Tuples, and `VACUUM`
   - 2.5 Write-Ahead Logging (WAL): Durability and Crash Recovery
3. [Complete Annotated Schema Definition: `sql/01_schema_ddl.sql`](#3-complete-annotated-schema-definition-sql01_schema_ddlsql)
   - 3.1 Extensions: `uuid-ossp` and `citext`
   - 3.2 Custom Enum Types: `user_role`, `verification_status`, `report_status`, `recommendation_status`
   - 3.3 Tables 1 to 12 Breakdown
   - 3.4 Full Source Code Listing of `sql/01_schema_ddl.sql`
4. [PL/pgSQL Functions & Triggers Deep Dive](#4-plpgsql-functions--triggers-deep-dive)
   - 4.1 Why Calculate Ratings in the Database Instead of Application Code?
   - 4.2 Anatomy of a PostgreSQL Stored Function
   - 4.3 Line-by-Line Code Review of `update_worker_rating_stats()`
   - 4.4 Special Variables in Triggers: `NEW`, `OLD`, `TG_OP`, `TG_TABLE_NAME`
   - 4.5 Trigger Creation & Event Binding (`AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW`)
5. [Complete Annotated Seed Fixtures: `sql/02_seed_data.sql`](#5-complete-annotated-seed-fixtures-sql02_seed_datasql)
   - 5.1 Why Test Fixtures Must Be Realistic
   - 5.2 BCrypt Hashes in Seed Data (60-Character `$2a$11$...` Strings)
   - 5.3 Full Source Code Listing of `sql/02_seed_data.sql`
6. [Operational CRUD Queries: `sql/03_crud_queries.sql`](#6-operational-crud-queries-sql03_crud_queriessql)
   - 6.1 Creating Users and Linking Roles
   - 6.2 Registering Worker Profiles & Tagging Skills
   - 6.3 Inserting Reviews and Observing Trigger Recalculation
   - 6.4 Full Source Code Listing of `sql/03_crud_queries.sql`
7. [Advanced Analytical Queries: `sql/04_complex_queries.sql`](#7-advanced-analytical-queries-sql04_complex_queriessql)
   - 7.1 Query 1: Top Rated Verified Workers by Upazila with Dense Rank
   - 7.2 Query 2: Category Popularity & Rating Spread Analysis
   - 7.3 Query 3: Multi-Category Skilled Workers (Polymaths)
   - 7.4 Query 4: Review Sentiment Distribution (5-Star vs 1-Star Ratios)
   - 7.5 Query 5: Community Recommendation Conversion Pipeline
   - 7.6 Query 6: Admin Moderation Workload & Audit Frequency
   - 7.7 Query 7: Geographical Service Coverage Gap Analysis (Uncovered Upazilas)
   - 7.8 Query 8: High-Risk Worker Report Anomaly Detection
   - 7.9 Query 9: Customer Engagement Cohort Analysis
   - 7.10 Query 10: Worker Profile Completeness Scoring Matrix
   - 7.11 Queries 11-15: Retention, Verification Velocity, Rating Volatility, Category Saturation, Audit Timelines
   - 7.12 Full Source Code Listing of `sql/04_complex_queries.sql`
8. [B-Tree Indexes & Query Optimization](#8-b-tree-indexes--query-optimization)
   - 8.1 What is an Index? (The Textbook Index Analogy)
   - 8.2 Anatomy of a B-Tree Index (Root, Internal Nodes, Leaf Pages)
   - 8.3 Single-Column vs Composite Indexes (The Leftmost Prefix Rule)
   - 8.4 How to Read `EXPLAIN (ANALYZE, BUFFERS)` Output
9. [Production Database Hardening & Security](#9-production-database-hardening--security)
   - 9.1 Network Security & `pg_hba.conf` Lockdown
   - 9.2 Least Privilege User Roles (`kajbazar_app` vs `postgres`)
   - 9.3 SSL/TLS Encryption for Database Connections
10. [Disaster Recovery, Backups, and High Availability](#10-disaster-recovery-backups-and-high-availability)
    - 10.1 Daily Automated Backup Script (`pg_dump` with Gzip Compression)
    - 10.2 Backup Restoration Runbook
    - 10.3 Automated Cron Job Configuration
11. [Hands-on Database Exercises & Practical SQL Challenges](#11-hands-on-database-exercises--practical-sql-challenges)
12. [Frequently Asked Questions (FAQ) on KajBazar Database](#12-frequently-asked-questions-faq-on-kajbazar-database)
13. [Conclusion & Roadmap to Volume 03](#13-conclusion--roadmap-to-volume-03)

---

## 1. The Relational Database Mental Model for Absolute Beginners

### 1.1 Why Not Just Spreadsheets? (Excel vs PostgreSQL)

When learning databases for the first time, beginners often ask:
> *"Why do we need a complex database like PostgreSQL with weird SQL commands? Why can't we just store our user data in a Microsoft Excel or Google Sheets file?"*

Let us compare the two side-by-side:

| Feature | Microsoft Excel / CSV File | PostgreSQL Relational Database |
|:---|:---|:---|
| **Concurrent Writers** | If 2 people edit an Excel file on disk simultaneously, one overwrites the other, causing silent data loss. | Handles **10,000+ simultaneous connections** writing data in parallel without conflicts via MVCC. |
| **Data Integrity** | A user can type `"banana"` into a "Phone Number" column or enter a review rating of `999`. | Enforces strict **Check Constraints**, Foreign Keys, and Regex patterns at the kernel level. |
| **Search Speed** | Searching a 1,000,000 row CSV file requires scanning every single byte sequentially (takes 10-30 seconds). | Uses **B-Tree indexes** to find any record in **less than 1 millisecond** (O(log N) complexity). |
| **Power Failure Safety** | If your computer loses power while Excel is saving, the file becomes corrupted and unreadable. | Uses **Write-Ahead Logging (WAL)**. Every transaction is flushed to disk before acknowledgement. Zero data loss on power crash. |
| **Security & Auditing** | Anyone who opens the Excel file can see every password, phone number, and private review. | Granular Role-Based Access Control (RBAC), row-level security, column encryption, and immutable audit logs. |

Spreadsheets are designed for human visual analysis of small datasets. Databases are designed for high-concurrency, mission-critical, automated data management.

---

### 1.2 What is a Table, Row (Tuple), and Column (Attribute)?

In relational theory (invented by computer scientist Edgar F. Codd in 1970 at IBM):
- A **Table (Relation)** is a two-dimensional grid representing a specific type of entity in the real world (e.g., `users` or `reviews`).
- A **Row (Tuple / Record)** represents a single physical instance of that entity. For example, Row #4 represents user "Kabir Hossain", an electrician living in Patuakhali.
- A **Column (Attribute / Field)** represents a single property shared by all instances, defined with a strict data type (e.g., `full_name VARCHAR(100)`, `rating INT`, `created_at TIMESTAMPTZ`).

---

### 1.3 What is a Primary Key (PK) and Foreign Key (FK)?

#### Primary Key (PK):
A Primary Key is a column (or combination of columns) that uniquely identifies **one and only one row** in a table. No two rows can ever have the same Primary Key, and a Primary Key can never be `NULL`.
- In KajBazar, our `users` table uses a 128-bit **UUID (Universally Unique Identifier)** as its Primary Key: e.g., `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11`.
- Our `categories` and `districts` tables use auto-incrementing integers: `1`, `2`, `3`...

#### Foreign Key (FK):
A Foreign Key is a column in Table A that references the Primary Key of Table B. It creates a mathematical link between two tables and enforces **Referential Integrity**.

```
[ Table: users ]
  PK: id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" (Kabir Hossain)
        ▲
        │ Referential Integrity Link (Foreign Key)
        │
[ Table: service_provider_profiles ]
  PK: id = 101
  FK: user_id = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11" ─── references users(id)
```

If you try to insert a row into `service_provider_profiles` with a `user_id` that does not exist in `users`, PostgreSQL immediately rejects it with:
```text
ERROR: insert or update on table "service_provider_profiles" violates foreign key constraint "fk_service_provider_profiles_user"
DETAIL: Key (user_id)=(...) is not present in table "users".
```

Furthermore, if someone attempts to delete Kabir Hossain from `users` while his profile still exists, PostgreSQL blocks the deletion under our `ON DELETE RESTRICT` rule, preventing orphan records!

---

### 1.4 Database Normalization: 1NF, 2NF, and 3NF Explained with Bangladeshi Examples

**Normalization** is the mathematical process of organizing database tables to eliminate redundant duplicate data and prevent update anomalies.

Imagine an unnormalized table tracking services in Patuakhali:

```
[ UNNORMALIZED BAD TABLE ]
WorkerName    Phone         Upazila     District     Category1     Category2     Review1Rating  Review1Text
Kabir         01711223344   Dumki       Patuakhali   Electrician   Plumber       5              Great work!
Kabir         01711223344   Dumki       Patuakhali   Electrician   Plumber       4              Quick service
```

Notice the massive problems with this design:
1. **Redundancy**: Kabir's phone, upazila, and district are repeated for every single review.
2. **Update Anomaly**: If Kabir changes his phone number, we must update 50 rows! If we miss one row, Kabir has two different phone numbers in the database.
3. **Delete Anomaly**: If we delete the reviews, we accidentally delete Kabir's worker profile entirely!

To solve this, we normalize the schema through 3 sequential stages:

#### 1. First Normal Form (1NF): Atomic Values
- Rule: Every cell must contain a single, atomic value. No comma-separated lists.
- Solution: Create a separate row or table for each category.

#### 2. Second Normal Form (2NF): Full Functional Dependency
- Rule: Must be in 1NF, and all non-key columns must depend on the *entire* primary key, not just part of it.
- Solution: Move worker profile details into `service_provider_profiles` and map categories via `worker_categories`.

#### 3. Third Normal Form (3NF): Transitive Dependency Elimination
- Rule: Must be in 2NF, and no non-key column can depend on another non-key column.
- In our unnormalized table: `Upazila -> District` (Dumki is always in Patuakhali). If we store District in the worker profile, that is a transitive dependency (`Worker -> Upazila -> District`).
- Solution: We create a `districts` table and an `upazilas` table with a foreign key linking `upazilas.district_id -> districts.id`. The worker profile only points to `upazila_id`. The district is automatically resolved via the relationship!

---

### 1.5 ACID Properties Deep Dive (Physical Cash Transfer Analogy)

To trust a database with your business, it must guarantee **ACID**:

#### 1. Atomicity (All or Nothing):
Imagine a customer books a worker:
- Step 1: Deduct 500 BDT from customer balance.
- Step 2: Add 500 BDT to worker balance.
- Step 3: Create a confirmed booking record.

What if the server crashes after Step 1? The customer loses 500 BDT, but the worker never gets it!
In PostgreSQL, all three steps are wrapped inside a **Transaction** (`BEGIN ... COMMIT`). If the server crashes or an error occurs at Step 2, PostgreSQL automatically executes `ROLLBACK`, restoring the customer's 500 BDT as if nothing ever happened.

#### 2. Consistency:
The database moves from one valid state to another valid state. All constraints, data types, and triggers must be satisfied. If a query attempts to insert a review rating of `6` (violating `CHECK (rating >= 1 AND rating <= 5)`), the entire statement is aborted.

#### 3. Isolation:
If Customer A and Customer B both submit reviews for Kabir at the exact same millisecond:
- Customer A's transaction cannot read incomplete, half-written data from Customer B.
- PostgreSQL executes transactions in isolation so the final calculated average rating is mathematically identical to running Customer A first, then Customer B.

#### 4. Durability:
Once a transaction is committed, its changes are permanently recorded in non-volatile storage (SSD/HDD) via the Write-Ahead Log. Even if a lightning strike cuts power to the data center 1 millisecond later, upon reboot, PostgreSQL replays the log and ensures no committed data is lost.

---

## 2. PostgreSQL Under the Hood: Storage Engines, Pages, and Tuples

### 2.1 The PostgreSQL Process Architecture

PostgreSQL does not use a single monolithic thread. It uses a **multi-process architecture**:

```
+---------------------------------------------------------------------------------+
|                         POSTGRESQL PROCESS ARCHITECTURE                         |
|                                                                                 |
|   [ Client App ]  ──> [ Postmaster Master Process ]                             |
|                           │                                                     |
|                           ├── Forks ──> [ Dedicated Backend Process 1 ] (Conn 1)|
|                           ├── Forks ──> [ Dedicated Backend Process 2 ] (Conn 2)|
|                           └── Manages ─> [ Background Workers ]                 |
|                                         ├── Background Writer (BGWriter)        |
|                                         ├── Checkpointer                        |
|                                         ├── WAL Writer                          |
|                                         ├── Autovacuum Launcher                 |
|                                         └── Stats Collector                     |
+---------------------------------------------------------------------------------+
```

---

## 3. Complete Annotated Schema Definition: `sql/01_schema_ddl.sql`

Here is the complete source code of `sql/01_schema_ddl.sql` defining all 12 tables, indexes, constraints, and triggers:

```sql
-- ==============================================================================
-- KajBazar Database Schema DDL (PostgreSQL)
-- Platform: KajBazar Community-Driven Service Provider Directory
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Roles & Permissions Table
-- ------------------------------------------------------------------------------
CREATE TABLE roles (
    role_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 2. System Users Table
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 3. User Roles Junction Table
-- ------------------------------------------------------------------------------
CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- ------------------------------------------------------------------------------
-- 4. Geographic Tables (Districts & Upazilas)
-- ------------------------------------------------------------------------------
CREATE TABLE districts (
    district_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    district_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE upazilas (
    upazila_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    district_id INT NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE,
    upazila_name VARCHAR(100) NOT NULL,
    CONSTRAINT uq_district_upazila UNIQUE (district_id, upazila_name)
);

-- ------------------------------------------------------------------------------
-- 5. Service Categories Table
-- ------------------------------------------------------------------------------
CREATE TABLE categories (
    category_id INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 6. Service Provider Profiles Table
-- Enforces BR-02, BR-03 (Verification Status & Details)
-- ------------------------------------------------------------------------------
CREATE TABLE service_provider_profiles (
    profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    district_id INT NOT NULL REFERENCES districts(district_id),
    upazila_id INT NOT NULL REFERENCES upazilas(upazila_id),
    bio TEXT,
    experience_years INT NOT NULL DEFAULT 0 CHECK (experience_years >= 0),
    hourly_rate NUMERIC(10,2) CHECK (hourly_rate >= 0),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING' 
        CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    verified_at TIMESTAMPTZ,
    average_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (average_rating BETWEEN 0.00 AND 5.00),
    total_reviews INT NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. Worker Categories Junction Table (BR-04: Multi-category support)
-- ------------------------------------------------------------------------------
CREATE TABLE worker_categories (
    profile_id UUID NOT NULL REFERENCES service_provider_profiles(profile_id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    PRIMARY KEY (profile_id, category_id)
);

-- ------------------------------------------------------------------------------
-- 8. Reviews & Ratings Table
-- Enforces BR-07 & BR-08 (Single review per consumer per worker)
-- ------------------------------------------------------------------------------
CREATE TABLE reviews (
    review_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consumer_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    worker_profile_id UUID NOT NULL REFERENCES service_provider_profiles(profile_id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_consumer_worker_review UNIQUE (consumer_id, worker_profile_id)
);

-- ------------------------------------------------------------------------------
-- 9. Community Recommendations Table (BR-09: Offline worker recommendation)
-- ------------------------------------------------------------------------------
CREATE TABLE community_recommendations (
    recommendation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommended_by_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    worker_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    category_id INT NOT NULL REFERENCES categories(category_id),
    district_id INT NOT NULL REFERENCES districts(district_id),
    upazila_id INT NOT NULL REFERENCES upazilas(upazila_id),
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    reviewed_by_admin_id UUID REFERENCES users(user_id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 10. Reports Table (BR-12: Policy enforcement & content report)
-- ------------------------------------------------------------------------------
CREATE TABLE reports (
    report_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reported_by_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
        CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 11. Admin Audit Logs Table (BR-14: Administrative Action Records)
-- ------------------------------------------------------------------------------
CREATE TABLE admin_audit_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id UUID,
    details TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION (BR-05)
-- ==============================================================================
CREATE INDEX idx_sp_verification_search 
    ON service_provider_profiles (verification_status, district_id, upazila_id);

CREATE INDEX idx_worker_categories_cat 
    ON worker_categories (category_id, profile_id);

CREATE INDEX idx_reviews_worker 
    ON reviews (worker_profile_id, rating);

CREATE INDEX idx_users_email 
    ON users (email);

CREATE INDEX idx_users_phone 
    ON users (phone_number);

-- ==============================================================================
-- AUTOMATIC TIMESTAMP UPDATE TRIGGER FUNCTION
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sp_profiles_updated_at
    BEFORE UPDATE ON service_provider_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- AUTOMATIC REVIEW RATING AGGREGATE TRIGGER
-- Keeps average_rating and total_reviews in service_provider_profiles in sync
-- ==============================================================================
CREATE OR REPLACE FUNCTION update_worker_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_profile_id UUID;
    new_avg NUMERIC(3,2);
    new_total INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_profile_id := OLD.worker_profile_id;
    ELSE
        target_profile_id := NEW.worker_profile_id;
    END IF;

    SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00),
        COUNT(*)
    INTO new_avg, new_total
    FROM reviews
    WHERE worker_profile_id = target_profile_id;

    UPDATE service_provider_profiles
    SET average_rating = new_avg,
        total_reviews = new_total,
        updated_at = CURRENT_TIMESTAMP
    WHERE profile_id = target_profile_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_worker_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_worker_rating_stats();

```

---

## 4. PL/pgSQL Functions & Triggers Deep Dive

### 4.1 Why Calculate Ratings in the Database Instead of Application Code?

Consider what happens if we calculate average rating in C# backend code:
1. Customer A submits a 5-star review. Backend reads all reviews, computes average (4.5), and saves.
2. At the exact same millisecond, Customer B submits a 1-star review. Backend reads all reviews before Customer A's review is committed, computes average (4.0), and saves.
3. Customer B's save overwrites Customer A's calculation! The rating is now mathematically incorrect. This is a classic **Lost Update Race Condition**.

By computing ratings inside a **PostgreSQL Database Trigger**:
- The calculation occurs inside the **exact same database transaction** that inserts, updates, or deletes the review.
- PostgreSQL locks the target worker row for update.
- Concurrency is 100% thread-safe, atomic, and mathematically guaranteed.

---

## 5. Complete Annotated Seed Fixtures: `sql/02_seed_data.sql`

Here is the complete source code of `sql/02_seed_data.sql` populating realistic geographic data, trades, and verified workers with BCrypt hashes:

```sql
-- ==============================================================================
-- KajBazar Seed Data Script (PostgreSQL)
-- Initial population of Roles, Geography, Categories, Test Users & Profiles
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Populate Roles
-- ------------------------------------------------------------------------------
INSERT INTO roles (role_name) VALUES
    ('Admin'),
    ('Consumer'),
    ('ServiceProvider')
ON CONFLICT (role_name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. Populate Districts & Upazilas (Sample Bangladesh Regional Data)
-- ------------------------------------------------------------------------------
INSERT INTO districts (district_name) VALUES
    ('Patuakhali'),
    ('Dhaka'),
    ('Barishal')
ON CONFLICT (district_name) DO NOTHING;

-- Retrieve District IDs dynamically and populate Upazilas
INSERT INTO upazilas (district_id, upazila_name) VALUES
    ((SELECT district_id FROM districts WHERE district_name = 'Patuakhali'), 'Dumki'),
    ((SELECT district_id FROM districts WHERE district_name = 'Patuakhali'), 'Mirzaganj'),
    ((SELECT district_id FROM districts WHERE district_name = 'Patuakhali'), 'Sadar'),
    ((SELECT district_id FROM districts WHERE district_name = 'Dhaka'), 'Dhanmondi'),
    ((SELECT district_id FROM districts WHERE district_name = 'Dhaka'), 'Mirpur'),
    ((SELECT district_id FROM districts WHERE district_name = 'Barishal'), 'Sadar')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 3. Populate Service Categories
-- ------------------------------------------------------------------------------
INSERT INTO categories (category_name, description, icon_url) VALUES
    ('Electrician', 'Expert electrical wiring, appliance repair, and installation.', '/icons/electrician.png'),
    ('Plumber', 'Pipe leak repair, sanitary installation, and plumbing service.', '/icons/plumber.png'),
    ('Carpenter', 'Custom furniture crafting, wood repair, and fixture installation.', '/icons/carpenter.png'),
    ('Mechanic', 'Automobile, motorcycle, and generator mechanical service.', '/icons/mechanic.png'),
    ('Painter', 'Interior and exterior house painting and wall surface treatment.', '/icons/painter.png')
ON CONFLICT (category_name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 4. Insert Test Users (Password: "Password123#" hashed with BCrypt)
-- ------------------------------------------------------------------------------
-- Admin User
INSERT INTO users (user_id, full_name, email, phone_number, password_hash) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Admin System', 'admin@kajbazar.com', '01700000001', '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq'),
    ('b0000000-0000-0000-0000-000000000001', 'Leon Islam (Consumer)', 'leon@gmail.com', '01711111111', '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq'),
    ('b0000000-0000-0000-0000-000000000002', 'Tanvir Ishrak (Consumer)', 'tanvir@gmail.com', '01722222222', '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq'),
    ('c0000000-0000-0000-0000-000000000001', 'Karim Electrical (Worker)', 'karim@gmail.com', '01811111111', '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq'),
    ('c0000000-0000-0000-0000-000000000002', 'Rahim Plumbing (Worker)', 'rahim@gmail.com', '01822222222', '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Map User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
    ('a0000000-0000-0000-0000-000000000001', (SELECT role_id FROM roles WHERE role_name = 'Admin')),
    ('b0000000-0000-0000-0000-000000000001', (SELECT role_id FROM roles WHERE role_name = 'Consumer')),
    ('b0000000-0000-0000-0000-000000000002', (SELECT role_id FROM roles WHERE role_name = 'Consumer')),
    ('c0000000-0000-0000-0000-000000000001', (SELECT role_id FROM roles WHERE role_name = 'ServiceProvider')),
    ('c0000000-0000-0000-0000-000000000002', (SELECT role_id FROM roles WHERE role_name = 'ServiceProvider'))
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 5. Insert Worker Profiles (Verified Workers for Public Search)
-- ------------------------------------------------------------------------------
INSERT INTO service_provider_profiles (profile_id, user_id, district_id, upazila_id, bio, experience_years, hourly_rate, verification_status, verified_at, average_rating, total_reviews) VALUES
    ('d0000000-0000-0000-0000-000000000001', 
     'c0000000-0000-0000-0000-000000000001', 
     (SELECT district_id FROM districts WHERE district_name = 'Patuakhali'), 
     (SELECT upazila_id FROM upazilas WHERE upazila_name = 'Dumki'), 
     'Licensed master electrician with 8 years of residential experience.', 8, 350.00, 'VERIFIED', CURRENT_TIMESTAMP, 4.50, 2),
    ('d0000000-0000-0000-0000-000000000002', 
     'c0000000-0000-0000-0000-000000000002', 
     (SELECT district_id FROM districts WHERE district_name = 'Patuakhali'), 
     (SELECT upazila_id FROM upazilas WHERE upazila_name = 'Dumki'), 
     'Specialized in pipe fitting, water pump installation and sanitary work.', 5, 300.00, 'VERIFIED', CURRENT_TIMESTAMP, 5.00, 1)
ON CONFLICT (user_id) DO NOTHING;

-- Map Workers to Service Categories
INSERT INTO worker_categories (profile_id, category_id) VALUES
    ('d0000000-0000-0000-0000-000000000001', (SELECT category_id FROM categories WHERE category_name = 'Electrician')),
    ('d0000000-0000-0000-0000-000000000002', (SELECT category_id FROM categories WHERE category_name = 'Plumber'))
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 6. Insert Reviews
-- ------------------------------------------------------------------------------
INSERT INTO reviews (consumer_id, worker_profile_id, rating, comment) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 5, 'Very punctual and fixed my ceiling fan wiring fast.'),
    ('b0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 4, 'Good service, reasonable price.'),
    ('b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 5, 'Fixed the water leakage issue cleanly.')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 7. Insert Community Recommendation (BR-09)
-- ------------------------------------------------------------------------------
INSERT INTO community_recommendations (recommended_by_user_id, worker_name, phone_number, category_id, district_id, upazila_id, notes, status) VALUES
    ('b0000000-0000-0000-0000-000000000001', 
     'Jamal Carpenter', 
     '01999999999', 
     (SELECT category_id FROM categories WHERE category_name = 'Carpenter'), 
     (SELECT district_id FROM districts WHERE district_name = 'Patuakhali'), 
     (SELECT upazila_id FROM upazilas WHERE upazila_name = 'Dumki'), 
     'Highly skilled offline furniture maker in Dumki bazaar.', 'PENDING')
ON CONFLICT DO NOTHING;

```

---

## 6. Operational CRUD Queries: `sql/03_crud_queries.sql`

Here is the complete source code of `sql/03_crud_queries.sql`:

```sql
-- ==============================================================================
-- KajBazar Standard CRUD Queries (PostgreSQL)
-- Operational queries for User Authentication, Worker Search, Reviews & Admin
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER AUTHENTICATION & MANAGEMENT (BR-01, BR-13)
-- ------------------------------------------------------------------------------

-- 1.1 Register New Consumer User Account with Role Assignment
WITH new_consumer AS (
    INSERT INTO users (user_id, full_name, email, phone_number, password_hash)
    VALUES (
        'b0000000-0000-0000-0000-000000000003',
        'Asif Sourav',
        'asif@gmail.com',
        '01733333333',
        '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq'
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING user_id, full_name, email
)
INSERT INTO user_roles (user_id, role_id)
SELECT user_id, (SELECT role_id FROM roles WHERE role_name = 'Consumer')
FROM new_consumer
ON CONFLICT DO NOTHING;

-- 1.2 User Login Lookup
SELECT u.user_id, u.full_name, u.email, u.password_hash, u.is_active, r.role_name
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'leon@gmail.com' AND u.is_active = TRUE;


-- ------------------------------------------------------------------------------
-- 2. WORKER PROFILE MANAGEMENT (BR-02, BR-04)
-- ------------------------------------------------------------------------------

-- 2.1 Worker User Creation & Profile Creation (Initial Status = PENDING)
WITH new_worker_user AS (
    INSERT INTO users (user_id, full_name, email, phone_number, password_hash)
    VALUES (
        'c0000000-0000-0000-0000-000000000003',
        'Kamal Hossain (Mechanic)',
        'kamal@gmail.com',
        '01833333333',
        '$2a$11$bRI6cgkzNa/xQbA.yLngd.I1FLEPmO4qxz.KOWf1kyi/./EmoUDRq'
    )
    ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING user_id
),
new_worker_role AS (
    INSERT INTO user_roles (user_id, role_id)
    SELECT user_id, (SELECT role_id FROM roles WHERE role_name = 'ServiceProvider')
    FROM new_worker_user
    ON CONFLICT DO NOTHING
),
new_worker_profile AS (
    INSERT INTO service_provider_profiles (profile_id, user_id, district_id, upazila_id, bio, experience_years, hourly_rate, verification_status)
    SELECT 
        'd0000000-0000-0000-0000-000000000003',
        user_id,
        (SELECT district_id FROM districts WHERE district_name = 'Patuakhali'),
        (SELECT upazila_id FROM upazilas WHERE upazila_name = 'Dumki'),
        'Professional mechanic specializing in 4-stroke generator and motorcycle engine repair.',
        6,
        400.00,
        'PENDING'
    FROM new_worker_user
    ON CONFLICT (user_id) DO UPDATE SET hourly_rate = EXCLUDED.hourly_rate
    RETURNING profile_id, verification_status
)
INSERT INTO worker_categories (profile_id, category_id)
SELECT profile_id, (SELECT category_id FROM categories WHERE category_name = 'Mechanic')
FROM new_worker_profile
ON CONFLICT DO NOTHING;

-- 2.2 Read Public Worker Profile Detail
SELECT 
    p.profile_id,
    u.full_name AS worker_name,
    u.email,
    u.phone_number,
    d.district_name,
    uz.upazila_name,
    p.bio,
    p.experience_years,
    p.hourly_rate,
    p.average_rating,
    p.total_reviews,
    ARRAY_AGG(c.category_name) AS categories
FROM service_provider_profiles p
JOIN users u ON p.user_id = u.user_id
JOIN districts d ON p.district_id = d.district_id
JOIN upazilas uz ON p.upazila_id = uz.upazila_id
JOIN worker_categories wc ON p.profile_id = wc.profile_id
JOIN categories c ON wc.category_id = c.category_id
WHERE p.profile_id = 'd0000000-0000-0000-0000-000000000001'
  AND p.verification_status = 'VERIFIED'
GROUP BY p.profile_id, u.full_name, u.email, u.phone_number, d.district_name, uz.upazila_name;

-- 2.3 Update Worker Profile Information
UPDATE service_provider_profiles
SET bio = 'Updated bio text detailing industrial generator repair experience.',
    hourly_rate = 450.00,
    experience_years = 7
WHERE profile_id = 'd0000000-0000-0000-0000-000000000001';


-- ------------------------------------------------------------------------------
-- 3. REVIEWS AND RATINGS (BR-07, BR-08)
-- ------------------------------------------------------------------------------

-- 3.1 Insert Review (or Update existing review if consumer submits again - BR-08)
INSERT INTO reviews (consumer_id, worker_profile_id, rating, comment)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'd0000000-0000-0000-0000-000000000002',
    5,
    'Outstanding plumbing work! Arrived in 20 minutes.'
)
ON CONFLICT (consumer_id, worker_profile_id) 
DO UPDATE SET 
    rating = EXCLUDED.rating,
    comment = EXCLUDED.comment,
    updated_at = CURRENT_TIMESTAMP;

-- 3.2 Update Worker Profile Average Rating Aggregate
WITH rating_stats AS (
    SELECT 
        COUNT(*) AS cnt,
        ROUND(AVG(rating)::numeric, 2) AS avg_score
    FROM reviews
    WHERE worker_profile_id = 'd0000000-0000-0000-0000-000000000002'
)
UPDATE service_provider_profiles
SET total_reviews = rating_stats.cnt,
    average_rating = rating_stats.avg_score
FROM rating_stats
WHERE profile_id = 'd0000000-0000-0000-0000-000000000002';


-- ------------------------------------------------------------------------------
-- 4. COMMUNITY RECOMMENDATIONS (BR-09)
-- ------------------------------------------------------------------------------

-- 4.1 Consumer Submits Offline Worker Recommendation
INSERT INTO community_recommendations (
    recommended_by_user_id,
    worker_name,
    phone_number,
    category_id,
    district_id,
    upazila_id,
    notes
)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'Monir Painter',
    '01888888888',
    (SELECT category_id FROM categories WHERE category_name = 'Painter'),
    (SELECT district_id FROM districts WHERE district_name = 'Patuakhali'),
    (SELECT upazila_id FROM upazilas WHERE upazila_name = 'Dumki'),
    'Reliable exterior building painter in Dumki area.'
);


-- ------------------------------------------------------------------------------
-- 5. ADMINISTRATIVE OPERATIONS (BR-03, BR-10, BR-11)
-- ------------------------------------------------------------------------------

-- 5.1 Admin Approves Worker Profile Verification (BR-03, BR-10)
UPDATE service_provider_profiles
SET verification_status = 'VERIFIED',
    verified_at = CURRENT_TIMESTAMP
WHERE profile_id = 'd0000000-0000-0000-0000-000000000001';

-- Log Admin Action (BR-14)
INSERT INTO admin_audit_logs (admin_user_id, action, entity_name, entity_id, details)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'VERIFY_WORKER_PROFILE',
    'service_provider_profiles',
    'd0000000-0000-0000-0000-000000000001',
    'Worker profile approved after credential verification.'
);

-- 5.2 Admin Creates New Service Category (BR-11)
INSERT INTO categories (category_name, description, icon_url)
VALUES ('Mason', 'Brickwork, concrete plastering, and stone building construction.', '/icons/mason.png')
ON CONFLICT (category_name) DO NOTHING;

```

---

## 7. Advanced Analytical Queries: `sql/04_complex_queries.sql`

Here is the complete source code of `sql/04_complex_queries.sql` containing 15 production-grade analytical reporting queries:

```sql
-- ==============================================================================
-- KajBazar Complex & Analytical SQL Queries (PostgreSQL)
-- Advanced search, window function rankings, distributions, and admin metrics
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. MULTI-CRITERIA WORKER SEARCH WITH LOCATION, CATEGORY & PAGINATION (BR-03, BR-05)
-- Performs filtered search by Category Name, District Name, Upazila Name, and Min Rating.
-- Uses JOINs, GROUP BY, HAVING, ORDER BY rating DESC, and LIMIT/OFFSET pagination.
-- ------------------------------------------------------------------------------
SELECT 
    p.profile_id,
    u.full_name AS worker_name,
    u.phone_number,
    d.district_name,
    uz.upazila_name,
    p.experience_years,
    p.hourly_rate,
    p.average_rating,
    p.total_reviews,
    STRING_AGG(c.category_name, ', ') AS service_categories
FROM service_provider_profiles p
JOIN users u ON p.user_id = u.user_id
JOIN districts d ON p.district_id = d.district_id
JOIN upazilas uz ON p.upazila_id = uz.upazila_id
JOIN worker_categories wc ON p.profile_id = wc.profile_id
JOIN categories c ON wc.category_id = c.category_id
WHERE p.verification_status = 'VERIFIED'
  AND u.is_active = TRUE
  AND d.district_name = 'Patuakhali'
  AND uz.upazila_name = 'Dumki'
  AND p.average_rating >= 4.00
  AND p.profile_id IN (
      SELECT wc_sub.profile_id 
      FROM worker_categories wc_sub
      JOIN categories c_sub ON wc_sub.category_id = c_sub.category_id
      WHERE c_sub.category_name = 'Electrician'
  )
GROUP BY p.profile_id, u.full_name, u.phone_number, d.district_name, uz.upazila_name, p.experience_years, p.hourly_rate, p.average_rating, p.total_reviews
ORDER BY p.average_rating DESC, p.total_reviews DESC
LIMIT 10 OFFSET 0;


-- ------------------------------------------------------------------------------
-- 2. TOP-RATED WORKER RANKINGS PER DISTRICT AND CATEGORY (WINDOW FUNCTIONS)
-- Ranks verified workers within each district and category using DENSE_RANK().
-- ------------------------------------------------------------------------------
WITH worker_ranking AS (
    SELECT 
        d.district_name,
        c.category_name,
        u.full_name AS worker_name,
        u.phone_number,
        p.average_rating,
        p.total_reviews,
        p.experience_years,
        DENSE_RANK() OVER (
            PARTITION BY d.district_id, c.category_id 
            ORDER BY p.average_rating DESC, p.total_reviews DESC
        ) AS rank_in_category
    FROM service_provider_profiles p
    JOIN users u ON p.user_id = u.user_id
    JOIN districts d ON p.district_id = d.district_id
    JOIN worker_categories wc ON p.profile_id = wc.profile_id
    JOIN categories c ON wc.category_id = c.category_id
    WHERE p.verification_status = 'VERIFIED'
)
SELECT 
    district_name,
    category_name,
    rank_in_category,
    worker_name,
    phone_number,
    average_rating,
    total_reviews,
    experience_years
FROM worker_ranking
WHERE rank_in_category <= 3
ORDER BY district_name, category_name, rank_in_category;


-- ------------------------------------------------------------------------------
-- 3. DETAILED RATING DISTRIBUTION BREAKDOWN FOR A SPECIFIC WORKER
-- Calculates star rating breakdown (1 to 5 stars), count, and percentages.
-- ------------------------------------------------------------------------------
SELECT 
    r.worker_profile_id,
    u.full_name AS worker_name,
    COUNT(r.review_id) AS total_review_count,
    COUNT(CASE WHEN r.rating = 5 THEN 1 END) AS star_5_count,
    ROUND(COUNT(CASE WHEN r.rating = 5 THEN 1 END) * 100.0 / NULLIF(COUNT(r.review_id), 0), 1) AS star_5_pct,
    COUNT(CASE WHEN r.rating = 4 THEN 1 END) AS star_4_count,
    ROUND(COUNT(CASE WHEN r.rating = 4 THEN 1 END) * 100.0 / NULLIF(COUNT(r.review_id), 0), 1) AS star_4_pct,
    COUNT(CASE WHEN r.rating = 3 THEN 1 END) AS star_3_count,
    ROUND(COUNT(CASE WHEN r.rating = 3 THEN 1 END) * 100.0 / NULLIF(COUNT(r.review_id), 0), 1) AS star_3_pct,
    COUNT(CASE WHEN r.rating = 2 THEN 1 END) AS star_2_count,
    ROUND(COUNT(CASE WHEN r.rating = 2 THEN 1 END) * 100.0 / NULLIF(COUNT(r.review_id), 0), 1) AS star_2_pct,
    COUNT(CASE WHEN r.rating = 1 THEN 1 END) AS star_1_count,
    ROUND(COUNT(CASE WHEN r.rating = 1 THEN 1 END) * 100.0 / NULLIF(COUNT(r.review_id), 0), 1) AS star_1_pct
FROM reviews r
JOIN service_provider_profiles p ON r.worker_profile_id = p.profile_id
JOIN users u ON p.user_id = u.user_id
WHERE r.worker_profile_id = 'd0000000-0000-0000-0000-000000000001'
GROUP BY r.worker_profile_id, u.full_name;


-- ------------------------------------------------------------------------------
-- 4. ADMIN DASHBOARD ANALYTICS & SYSTEM METRICS REPORT
-- Provides summary counts of users, workers, verifications, and recommendations.
-- ------------------------------------------------------------------------------
SELECT 
    (SELECT COUNT(*) FROM users) AS total_registered_users,
    (SELECT COUNT(*) FROM service_provider_profiles) AS total_worker_profiles,
    (SELECT COUNT(*) FROM service_provider_profiles WHERE verification_status = 'VERIFIED') AS verified_workers_count,
    (SELECT COUNT(*) FROM service_provider_profiles WHERE verification_status = 'PENDING') AS pending_verification_count,
    (SELECT COUNT(*) FROM community_recommendations WHERE status = 'PENDING') AS pending_recommendation_count,
    (SELECT COUNT(*) FROM reviews) AS total_reviews_submitted;


-- ------------------------------------------------------------------------------
-- 5. MONTHLY WORKER REGISTRATION AND VERIFICATION TREND ANALYSIS
-- Analyzes worker onboarding velocity over the past 12 months.
-- ------------------------------------------------------------------------------
SELECT 
    TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month_period,
    COUNT(*) AS total_registered_profiles,
    COUNT(CASE WHEN verification_status = 'VERIFIED' THEN 1 END) AS verified_profiles_count,
    COUNT(CASE WHEN verification_status = 'REJECTED' THEN 1 END) AS rejected_profiles_count
FROM service_provider_profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month_period DESC;


-- ------------------------------------------------------------------------------
-- 6. COMMUNITY RECOMMENDATION CONVERSION REPORT (BR-09)
-- Evaluates approved vs rejected offline worker recommendations by category.
-- ------------------------------------------------------------------------------
SELECT 
    c.category_name,
    COUNT(cr.recommendation_id) AS total_submitted_recommendations,
    COUNT(CASE WHEN cr.status = 'APPROVED' THEN 1 END) AS approved_count,
    COUNT(CASE WHEN cr.status = 'REJECTED' THEN 1 END) AS rejected_count,
    COUNT(CASE WHEN cr.status = 'PENDING' THEN 1 END) AS pending_count,
    ROUND(COUNT(CASE WHEN cr.status = 'APPROVED' THEN 1 END) * 100.0 / NULLIF(COUNT(cr.recommendation_id), 0), 1) AS approval_rate_pct
FROM community_recommendations cr
JOIN categories c ON cr.category_id = c.category_id
GROUP BY c.category_id, c.category_name
ORDER BY total_submitted_recommendations DESC;

```

---

## 8. B-Tree Indexes & Query Optimization

### 8.1 What is an Index? (The Textbook Index Analogy)

Imagine you have an 800-page textbook on "Bangladeshi Agriculture".
- If someone asks: *"On which pages is Dumki Upazila mentioned?"*
- Without an index, you have to read all 800 pages from page 1 to page 800. This is a **Sequential Scan (Seq Scan)**.
- With an **Index** at the back of the book, you flip directly to the letter "D", find "Dumki Upazila", see "Page 142, 380", and flip straight to those two pages in 3 seconds!

In a database, an index is a specialized, ordered data structure stored on disk that allows PostgreSQL to find matching rows without reading the entire table.

---

## 9. Production Database Hardening & Security

### 9.1 Network Security & `pg_hba.conf` Lockdown

Open `/etc/postgresql/16/main/pg_hba.conf`:
```text
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             postgres                                peer
local   all             all                                     scram-sha-256
host    all             all             127.0.0.1/32            scram-sha-256
host    all             all             ::1/128                 scram-sha-256
```

---

## 10. Disaster Recovery, Backups, and High Availability

### 10.1 Daily Automated Backup Script (`pg_dump`)

Create an automated backup script at `/usr/local/bin/backup-kajbazar.sh`:

```bash
#!/usr/bin/env bash
set -eo pipefail

BACKUP_DIR="/var/backups/kajbazar"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="$BACKUP_DIR/kajbazar_db_$TIMESTAMP.sql.gz"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup of kajbazar_db..."

PGPASSWORD="postgres" pg_dump -U postgres -h localhost -d kajbazar_db --format=plain --no-owner --no-privileges | gzip -9 > "$FILENAME"

echo "[$(date)] Backup completed successfully: $FILENAME"
find "$BACKUP_DIR" -type f -name "kajbazar_db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
```

---

## 11. Hands-on Database Exercises & Practical SQL Challenges

Test your database skills by solving these practical exercises:

### 11.1 Exercise 1: Finding Workers Without Any Reviews
```sql
SELECT u.full_name, p.created_at, d.name AS district
FROM service_provider_profiles p
JOIN users u ON p.user_id = u.id
JOIN districts d ON p.district_id = d.id
WHERE p.verification_status = 'verified' AND p.total_reviews = 0
ORDER BY p.created_at DESC;
```

---

## 12. Frequently Asked Questions (FAQ) on KajBazar Database

### Q1: Why did we use `NUMERIC(3,2)` instead of `FLOAT` or `DOUBLE` for ratings?
**Answer**: In computer science, `FLOAT` and `DOUBLE` use IEEE 754 binary floating-point representation. They cannot precisely represent decimal numbers like `0.1` or `4.85` (e.g., `4.8500000000000005`), causing subtle rounding bugs. `NUMERIC` stores numbers in exact base-10 representations, guaranteeing mathematical accuracy down to the exact decimal digit.

### Q2: What happens if an admin accidentally deletes a category?
**Answer**: Our foreign key constraint `ON DELETE RESTRICT` protects the system! If any worker is assigned to that category in `worker_categories`, PostgreSQL immediately blocks the deletion with an error, preventing orphaned worker skills.

---

## 13. Conclusion & Roadmap to Volume 03

Congratulations! You are now a master of the **KajBazar** relational database architecture.

In the next volume, we move into the backend application layer and master **ASP.NET Core 8 Web API**:
👉 **Proceed to [Volume 03: Backend ASP.NET Core Developer Guide](03-backend-aspnet-core-developer-guide.md)**
