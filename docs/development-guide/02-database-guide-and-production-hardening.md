# Volume 02: Database Guide & Production Hardening
## A Comprehensive Manual for the KajBazar PostgreSQL Relational Engine

---

## 📖 Introduction: The Vault of the System

In any software system, application code can be refactored, UI designs can be updated, and servers can be rebooted. But if your database is corrupted, slow, or insecure, **your business is dead**.

This volume is your complete reference for the **KajBazar** database. We will explain how the relational engine works, analyze every single table and foreign key relationship, understand automated database triggers, inspect query execution plans with `EXPLAIN ANALYZE`, and harden the database against attacks.

---

## 📑 Table of Contents

1. [Why PostgreSQL 15+? (And Why Relational?)](#1-why-postgresql-15-and-why-relational)
   - 1.1 Relational Integrity vs. NoSQL Chaos
   - 1.2 PostgreSQL Features We Rely On (UUIDs, JSONB, Triggers, Check Constraints)
   - 1.3 The ACID Guarantees Explained Simply
2. [Complete Entity-Relationship (ER) Architecture](#2-complete-entity-relationship-er-architecture)
   - 2.1 The 12 Core Tables at a Glance
   - 2.2 Relational Dependency Graph
   - 2.3 Visual Conceptual ER Diagram
   - 2.4 Visual Physical ER Diagram
3. [Deep Column-by-Column Table Specifications](#3-deep-column-by-column-table-specifications)
   - 3.1 `roles`
   - 3.2 `users`
   - 3.3 `districts`
   - 3.4 `upazilas`
   - 3.5 `categories`
   - 3.6 `service_providers`
   - 3.7 `worker_categories` (Junction Table)
   - 3.8 `reviews`
   - 3.9 `recommendations`
   - 3.10 `user_favorites`
   - 3.11 `reports`
   - 3.12 `admin_audit_logs`
4. [The Complete DDL Schema Script (`01_schema_ddl.sql`)](#4-the-complete-ddl-schema-script-01_schema_ddlsql)
   - 4.1 Script Overview & Transactional Execution (`BEGIN ... COMMIT`)
   - 4.2 Full DDL Source Code with In-Line Comments
5. [Business Rules Enforced in the Database Engine](#5-business-rules-enforced-in-the-database-engine)
   - 5.1 Verification Status Integrity (`CHECK` constraints)
   - 5.2 Rating Scale Bounds (1 to 5 Stars)
   - 5.3 Preventing Duplicate Reviews (`UNIQUE(worker_id, consumer_id)`)
   - 5.4 Phone Number & Email Uniqueness
6. [Automated Triggers: Real-Time Worker Rating Recalculation](#6-automated-triggers-real-time-worker-rating-recalculation)
   - 6.1 The Performance Problem with `AVG()` on Live Queries
   - 6.2 The Solution: `update_worker_rating_stats()` Trigger Function
   - 6.3 Step-by-Step Code Walkthrough of the PL/pgSQL Function
   - 6.4 Edge Cases Handled: INSERT, UPDATE, DELETE, and Zero Reviews
7. [Performance Indexing Strategy](#7-performance-indexing-strategy)
   - 7.1 What is a B-Tree Index?
   - 7.2 The Composite Index for Search: `idx_workers_upazila_status`
   - 7.3 Category Junction Index: `idx_worker_categories_cat_worker`
   - 7.4 Query Analysis: Before vs. After Index (`EXPLAIN ANALYZE`)
8. [The Complete Seed Data Script (`02_seed_data.sql`)](#8-the-complete-seed-data-script-02_seed_datasql)
   - 8.1 Why Deterministic Seed Data is Crucial
   - 8.2 Seed Data Breakdown (Roles, Districts, Upazilas, Categories, Users, Workers)
9. [Tested CRUD and Analytical Queries](#9-tested-crud-and-analytical-queries)
   - 9.1 Core CRUD Operations (`03_crud_queries.sql`)
   - 9.2 Analytical & Reporting Queries (`04_complex_queries.sql`)
10. [Production Hardening & Security Checklist](#10-production-hardening--security-checklist)
    - 10.1 Principle of Least Privilege: The Dedicated `kajbazar_app` User
    - 10.2 Defeating SQL Injection with Parameterized Queries
    - 10.3 Securing Database Connections with SSL/TLS
    - 10.4 Hardening `pg_hba.conf` and `postgresql.conf`
11. [Automated Backup, Restore & Disaster Recovery](#11-automated-backup-restore--disaster-recovery)
    - 11.1 Logical Backups with `pg_dump`
    - 11.2 Production Daily Backup Cron Script
    - 11.3 Step-by-Step Disaster Recovery Drill (Restoring from Zero)
    - 11.4 Routine Vacuuming & Index Maintenance (`VACUUM ANALYZE`)
12. [Summary & Next Steps](#12-summary--next-steps)

---

## 1. Why PostgreSQL 15+? (And Why Relational?)

### 1.1 Relational Integrity vs. NoSQL Chaos
When starting a web application, inexperienced developers sometimes choose NoSQL document stores (like MongoDB) simply because "it's easy to save JSON". However, for a service provider directory, NoSQL is a dangerous choice:
- If a user changes their phone number in MongoDB, and their phone number was copied inside 50 reviews, you now have 50 stale, incorrect phone numbers scattered across the database.
- If an admin deletes a fraudulent service provider in MongoDB, orphaned reviews and bookmarks remain floating around forever.

**PostgreSQL gives us mathematical consistency**:
- **Foreign Keys**: You cannot create a review for a worker who does not exist.
- **Cascades**: When a worker profile is deleted, all their category mappings and reviews can be cleanly deleted automatically (`ON DELETE CASCADE`).
- **Transactional Safety**: If an admin approves a worker and logs the audit event, both happen inside a single transaction. Either both succeed, or neither does.

### 1.2 PostgreSQL Features We Rely On
1. **`gen_random_uuid()`**: Built-in cryptographically secure UUIDv4 generation without third-party extensions.
2. **`TIMESTAMPTZ`**: Timestamp with timezone. Bangladesh Standard Time is UTC+6. Storing timestamps in UTC guarantees that daylight savings or international users never corrupt appointment or creation dates.
3. **`PL/pgSQL` Triggers**: Server-side procedural language that executes directly inside the database engine at C-level speed.
4. **`NUMERIC(3,2)`**: Fixed-point arithmetic for ratings (e.g. `4.85`) and rates (e.g. `350.00`) to eliminate floating-point rounding errors.

### 1.3 The ACID Guarantees Explained Simply
- **A (Atomicity)**: "All or Nothing." If you update a worker's status and insert an audit log, but the database crashes halfway through, PostgreSQL rolls everything back. There are never "half-saved" operations.
- **C (Consistency)**: "No Rule Breaking." If a check constraint says rating must be between 1 and 5, PostgreSQL will reject a rating of 6 with an immediate error, even if the application code tried to send it.
- **I (Isolation)**: "No Stepping on Toes." If 500 consumers are searching for electricians while 3 workers are updating their profiles at the exact same millisecond, PostgreSQL processes them cleanly without data corruption.
- **D (Durability)**: "Written in Stone." Once PostgreSQL acknowledges that a transaction is committed, that data is flushed to physical disk storage. Even if the server loses power 1 microsecond later, the data is safe.

---

## 2. Complete Entity-Relationship (ER) Architecture

### 2.1 The 12 Core Tables at a Glance

```
+-----------------------------------------------------------------------------------------+
|                                  KAJBAZAR DATABASE MAP                                  |
|                                                                                         |
|  [roles] <-----------+                                                                  |
|                      |                                                                  |
|  [districts] <-------+--- [users] <---------------+------------- [admin_audit_logs]     |
|       ^              |        ^                   |                                     |
|       |              |        |                   |                                     |
|  [upazilas] <--------+        |                   +------------- [recommendations]      |
|       ^                       |                   |                                     |
|       |                       |                   +------------- [reports]              |
|       +--------------+        |                   |                                     |
|                      |        |                   |                                     |
|             [service_providers] <---+------- [reviews]                                  |
|                      ^              |                                                   |
|                      |              +------- [user_favorites]                           |
|             [worker_categories]                                                         |
|                      v                                                                  |
|                 [categories]                                                            |
+-----------------------------------------------------------------------------------------+
```

### 2.2 Relational Dependency Graph
Tables must be created in a specific topological order so that foreign keys find their parent tables:
1. `roles`, `districts`, `categories` (No foreign keys)
2. `upazilas` (References `districts`)
3. `users` (References `roles`, `districts`, `upazilas`)
4. `service_providers` (References `users`, `districts`, `upazilas`)
5. `worker_categories` (References `service_providers`, `categories`)
6. `reviews` (References `service_providers`, `users`)
7. `recommendations` (References `users`, `districts`, `upazilas`)
8. `user_favorites` (References `users`, `service_providers`)
9. `reports` (References `users`)
10. `admin_audit_logs` (References `users`)

---

## 3. Deep Column-by-Column Table Specifications

Let's examine every table as defined in [`sql/01_schema_ddl.sql`](file:///home/noir/Desktop/PROJECTS/Kajbazar/sql/01_schema_ddl.sql).

### 3.1 `roles`
Defines the three permission tiers: `Admin`, `ServiceProvider`, and `Consumer`.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing integer (1=Admin, 2=Worker, 3=Consumer). |
| `name` | `VARCHAR(50)` | `NOT NULL UNIQUE` | System identifier: `'Admin'`, `'ServiceProvider'`, `'Consumer'`. |
| `description` | `TEXT` | `NULL` | Plain-English summary of capabilities. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp. |

### 3.2 `users`
Stores login credentials, personal identification, and security flags for every human on the platform.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | 128-bit random unique identifier. Prevents ID enumeration attacks. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Human's legal or trade name. |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | Unique email for login & alerts. |
| `phone_number` | `VARCHAR(20)` | `NOT NULL UNIQUE` | Unique mobile number (e.g. `01711223344`). |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | 60-character BCrypt cryptographic hash. Salt is embedded. |
| `role_id` | `INT` | `NOT NULL REFERENCES roles(id) ON DELETE RESTRICT` | Role link. Cannot delete a role if users have it. |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | False = banned / suspended user. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Account registration time. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Last profile update time. |

### 3.3 `districts` & 3.4 `upazilas`
Implements the administrative geographic hierarchy of Bangladesh.

```sql
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    division VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE upazilas (
    id SERIAL PRIMARY KEY,
    district_id INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_district_upazila UNIQUE (district_id, name)
);
```

### 3.5 `categories`
The trade taxonomy (e.g., Electrician, Plumber, Carpenter, Appliance Technician).

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing identifier. |
| `name` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Trade name in English. |
| `slug` | `VARCHAR(100)` | `NOT NULL UNIQUE` | URL-safe slug (e.g., `electrician`). |
| `description` | `TEXT` | `NULL` | Detailed description of tasks performed. |
| `icon_name` | `VARCHAR(50)` | `DEFAULT 'wrench'` | Icon key used by React frontend. |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Allows soft-disabling a trade. |

### 3.6 `service_providers`
The central directory profile entity representing a verified skilled worker.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Profile UUID. |
| `user_id` | `UUID` | `NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE` | 1-to-1 link with User account. |
| `bio` | `TEXT` | `NULL` | Work history, special skills, and customer message. |
| `years_experience` | `INT` | `DEFAULT 0 CHECK (years_experience >= 0)` | Experience in years. |
| `hourly_rate` | `NUMERIC(10,2)` | `DEFAULT 0.00 CHECK (hourly_rate >= 0)` | Estimated hourly wage in BDT. |
| `availability_status`| `VARCHAR(20)`| `DEFAULT 'AVAILABLE' CHECK (...)` | `'AVAILABLE'`, `'BUSY'`, `'ON_LEAVE'`. |
| `verification_status`| `VARCHAR(20)`| `DEFAULT 'PENDING' CHECK (...)` | `'PENDING'`, `'VERIFIED'`, `'REJECTED'`, `'SUSPENDED'`. |
| `national_id_number` | `VARCHAR(30)`| `NULL` | Bangladesh NID or Smart Card number for identity verification. |
| `district_id` | `INT` | `NOT NULL REFERENCES districts(id) ON DELETE RESTRICT` | Operating district. |
| `upazila_id` | `INT` | `NOT NULL REFERENCES upazilas(id) ON DELETE RESTRICT` | Primary operating upazila. |
| `address_line` | `TEXT` | `NULL` | Village, road, bazaar stall, or landmark. |
| `average_rating` | `NUMERIC(3,2)` | `DEFAULT 0.00` | Auto-computed star rating (0.00 to 5.00). |
| `total_reviews` | `INT` | `DEFAULT 0` | Auto-computed review count. |
| `verified_at` | `TIMESTAMPTZ` | `NULL` | Timestamp of admin verification approval. |
| `verified_by_admin_id`| `UUID`| `NULL REFERENCES users(id)` | Admin who inspected NID and approved worker. |

### 3.7 `worker_categories` (Junction Table)
Implements a Many-to-Many relationship between `service_providers` and `categories`. A worker can be both an *Electrician* and a *Plumber*.

```sql
CREATE TABLE worker_categories (
    id SERIAL PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_worker_category UNIQUE (worker_id, category_id)
);
```

### 3.8 `reviews`
Stores ratings and feedback left by authenticated consumers.

| Column | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Review UUID. |
| `worker_id` | `UUID` | `NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE` | Worker being evaluated. |
| `consumer_id` | `UUID` | `NOT NULL REFERENCES users(id) ON DELETE CASCADE` | Consumer leaving review. |
| `rating` | `INT` | `NOT NULL CHECK (rating >= 1 AND rating <= 5)` | 1, 2, 3, 4, or 5 stars. |
| `comment` | `TEXT` | `NULL` | Customer's written review text. |
| `is_flagged` | `BOOLEAN` | `DEFAULT FALSE` | True if flagged for abuse or offensive language. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Initial submission time. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Last edited time. |

*Unique Constraint (`BR-08`)*:
```sql
CONSTRAINT uq_review_consumer_worker UNIQUE (worker_id, consumer_id)
```
*A consumer can never spam multiple reviews for the same worker. Submitting again updates their existing review!*

### 3.9 `recommendations`
Stores community referrals for traditional offline workers (`BR-09`).

```sql
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    worker_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    district_id INT REFERENCES districts(id) ON DELETE SET NULL,
    upazila_id INT REFERENCES upazilas(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONTACTED', 'ONBOARDED', 'REJECTED')),
    reviewed_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

### 3.12 `admin_audit_logs`
Enforces `BR-14`: Every administrative action (verifying a worker, banning an account, updating categories) is permanently recorded with user ID, IP address, and JSON diffs of before and after states.

```sql
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
```

---

## 4. The Complete DDL Schema Script (`01_schema_ddl.sql`)

Here is the exact production DDL script:

```sql
-- KajBazar PostgreSQL Production Schema DDL
-- Enforces all Business Rules (BR-01 through BR-15)

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing objects cleanly
DROP TABLE IF EXISTS admin_audit_logs CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS worker_categories CASCADE;
DROP TABLE IF EXISTS service_providers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS upazilas CASCADE;
DROP TABLE IF EXISTS districts CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- 1. Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Districts
CREATE TABLE districts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    division VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Upazilas
CREATE TABLE upazilas (
    id SERIAL PRIMARY KEY,
    district_id INT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_district_upazila UNIQUE (district_id, name)
);

-- 4. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    district_id INT REFERENCES districts(id) ON DELETE SET NULL,
    upazila_id INT REFERENCES upazilas(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 5. Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'wrench',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 6. Service Providers
CREATE TABLE service_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    years_experience INT DEFAULT 0 CHECK (years_experience >= 0),
    hourly_rate NUMERIC(10,2) DEFAULT 0.00 CHECK (hourly_rate >= 0),
    availability_status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE'
        CHECK (availability_status IN ('AVAILABLE', 'BUSY', 'ON_LEAVE')),
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED')),
    national_id_number VARCHAR(30),
    district_id INT NOT NULL REFERENCES districts(id) ON DELETE RESTRICT,
    upazila_id INT NOT NULL REFERENCES upazilas(id) ON DELETE RESTRICT,
    address_line TEXT,
    average_rating NUMERIC(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    verified_at TIMESTAMPTZ,
    verified_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 7. Worker Categories Junction
CREATE TABLE worker_categories (
    id SERIAL PRIMARY KEY,
    worker_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_worker_category UNIQUE (worker_id, category_id)
);

-- 8. Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_review_consumer_worker UNIQUE (worker_id, consumer_id)
);

-- 9. Recommendations
CREATE TABLE recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommender_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    worker_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    trade VARCHAR(100) NOT NULL,
    district_id INT REFERENCES districts(id) ON DELETE SET NULL,
    upazila_id INT REFERENCES upazilas(id) ON DELETE SET NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'CONTACTED', 'ONBOARDED', 'REJECTED')),
    reviewed_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Favorites
CREATE TABLE user_favorites (
    id SERIAL PRIMARY KEY,
    consumer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_favorite UNIQUE (consumer_id, worker_id)
);

-- 11. Reports
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('WORKER', 'REVIEW', 'CONSUMER')),
    target_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    resolved_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 12. Admin Audit Logs
CREATE TABLE admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_workers_upazila_status ON service_providers(upazila_id, verification_status);
CREATE INDEX idx_workers_district_status ON service_providers(district_id, verification_status);
CREATE INDEX idx_worker_categories_cat_worker ON worker_categories(category_id, worker_id);
CREATE INDEX idx_reviews_worker ON reviews(worker_id);
CREATE INDEX idx_recommendations_status ON recommendations(status);
CREATE INDEX idx_audit_admin_date ON admin_audit_logs(admin_user_id, created_at DESC);

-- Automated rating recalculation trigger
CREATE OR REPLACE FUNCTION update_worker_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_worker_id UUID;
    new_avg NUMERIC(3,2);
    new_count INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_worker_id := OLD.worker_id;
    ELSE
        target_worker_id := NEW.worker_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0.00), COUNT(*)
    INTO new_avg, new_count
    FROM reviews
    WHERE worker_id = target_worker_id;

    UPDATE service_providers
    SET average_rating = new_avg,
        total_reviews = new_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = target_worker_id;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_worker_rating_stats ON reviews;
CREATE TRIGGER trg_update_worker_rating_stats
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_worker_rating_stats();

COMMIT;
```

---

## 5. Business Rules Enforced in the Database Engine

Never rely solely on frontend or backend application code for data integrity. A junior developer might forget to validate an input in an API controller, or an attacker might bypass the API with a direct database tool.

In KajBazar, our PostgreSQL schema enforces business rules directly at the storage layer:

1. **`CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'))`**:
   - It is physically impossible to save an invalid or typo-ridden status like `'APPROVED'` or `'OK'`.
2. **`CHECK (rating >= 1 AND rating <= 5)`**:
   - Zero or 6-star ratings are rejected immediately with an engine-level error.
3. **`CHECK (hourly_rate >= 0)` & `CHECK (years_experience >= 0)`**:
   - Negative numbers for money or time are mathematically prohibited.
4. **`UNIQUE(worker_id, consumer_id)`**:
   - Prevents race conditions where two simultaneous clicks from a user might insert two reviews.

---

## 6. Automated Triggers: Real-Time Worker Rating Recalculation

### 6.1 The Performance Problem with `AVG()` on Live Queries
Imagine KajBazar grows to 50,000 workers and 1,000,000 reviews. 
If our search query calculated worker ratings like this:
```sql
SELECT sp.*, AVG(r.rating) 
FROM service_providers sp 
JOIN reviews r ON sp.id = r.worker_id 
GROUP BY sp.id;
```
Every time a user visits the homepage, PostgreSQL would have to scan hundreds of thousands of review rows! Server CPU would spike to 100%, and search times would degrade from 5 milliseconds to 8 seconds.

### 6.2 The Solution: `update_worker_rating_stats()` Trigger
Instead of recalculating the average on every read, we pre-calculate and store `average_rating` and `total_reviews` directly on the `service_providers` row.
Whenever a review is **inserted**, **updated**, or **deleted**, PostgreSQL fires a trigger function automatically!

---

## 7. Performance Indexing Strategy

### 7.1 What is a B-Tree Index?
Imagine a phone book with 100,000 names. If the names were printed in completely random order, finding "Rahim" would require looking at every single page from page 1 to page 500 (this is a **Sequential Scan**).
Because the phone book is sorted alphabetically (A, B, C...), you jump straight to "R" in 1 second. That sorted index is a **B-Tree (Balanced Tree)**.

### 7.2 The Composite Index for Search
Our most frequent query in KajBazar is:
> *"Find all VERIFIED workers in Upazila X sorted by average rating."*

To make this instantaneous, we created a **Composite Multi-Column Index**:
```sql
CREATE INDEX idx_workers_upazila_status 
ON service_providers (upazila_id, verification_status);
```

We also indexed the categories junction table:
```sql
CREATE INDEX idx_worker_categories_cat_worker 
ON worker_categories (category_id, worker_id);
```

---

## 8. The Complete Seed Data Script (`02_seed_data.sql`)

A database without realistic seed data makes testing miserable. Our seed script initializes:
- 3 Roles (`Admin`, `ServiceProvider`, `Consumer`).
- 4 Administrative Districts (`Patuakhali`, `Barishal`, `Dhaka`, `Khulna`).
- 9 Upazilas (including `Dumki`, `Bauphal`, `Galachipa`, `Mirzaganj`, `Patuakhali Sadar`).
- 7 Core Service Categories (`Electrician`, `Plumber`, `Appliance Technician`, `Carpenter`, `Painter`, `Mason`, `Mechanic`).
- Default Admin (`admin@kajbazar.com`), Consumer (`consumer@kajbazar.com`), and 4 Verified Skilled Workers with real-world profiles and phone numbers.
- Verified Reviews that fire the rating recalculation trigger.

---

## 9. Tested CRUD and Analytical Queries

All CRUD operations are fully verified in [`sql/03_crud_queries.sql`](file:///home/noir/Desktop/PROJECTS/Kajbazar/sql/03_crud_queries.sql) and complex analytical queries in [`sql/04_complex_queries.sql`](file:///home/noir/Desktop/PROJECTS/Kajbazar/sql/04_complex_queries.sql).

### Example: Top-Rated Workers by Upazila
```sql
SELECT 
    sp.id,
    u.full_name,
    u.phone_number,
    c.name AS primary_trade,
    d.name AS district,
    up.name AS upazila,
    sp.average_rating,
    sp.total_reviews,
    sp.hourly_rate
FROM service_providers sp
JOIN users u ON sp.user_id = u.id
JOIN districts d ON sp.district_id = d.id
JOIN upazilas up ON sp.upazila_id = up.id
LEFT JOIN worker_categories wc ON sp.id = wc.worker_id AND wc.is_primary = TRUE
LEFT JOIN categories c ON wc.category_id = c.id
WHERE sp.verification_status = 'VERIFIED'
ORDER BY sp.average_rating DESC, sp.total_reviews DESC;
```

---

## 10. Production Hardening & Security Checklist

### 10.1 Principle of Least Privilege: The Dedicated `kajbazar_app` User
In development, it is common to connect as the `postgres` superuser. **In production, this is a critical security vulnerability.** If an attacker finds a flaw, they have full control over the database server operating system!

Run this script to create a hardened, dedicated application user:
```sql
CREATE USER kajbazar_app WITH PASSWORD 'UseAStrongGeneratedPassword987!#';
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT CONNECT ON DATABASE kajbazar_db TO kajbazar_app;
GRANT USAGE ON SCHEMA public TO kajbazar_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO kajbazar_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO kajbazar_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO kajbazar_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO kajbazar_app;
```

---

## 11. Automated Backup, Restore & Disaster Recovery

### 11.1 Logical Backups with `pg_dump`
```bash
pg_dump -U postgres -h localhost -d kajbazar_db -Fc -f kajbazar_backup_$(date +%Y%m%d_%H%M%S).dump
```

### 11.2 Daily Backup Script
Set up `/opt/kajbazar/scripts/backup_db.sh`:
```bash
#!/bin/bash
set -e
BACKUP_DIR="/var/backups/kajbazar"
mkdir -p "$BACKUP_DIR"
pg_dump -U postgres -h localhost kajbazar_db | gzip > "$BACKUP_DIR/kajbazar_db_$(date +%Y%m%d_%H%M%S).sql.gz"
find "$BACKUP_DIR" -type f -name "kajbazar_db_*.sql.gz" -mtime +30 -exec rm {} \;
```

---

## 12. Next Steps

Your database is now hardened, indexed, automated, and secure.

Next, explore how our ASP.NET Core 8 Web API connects to this database and provides clean JSON endpoints:
👉 **[Volume 03: Backend ASP.NET Core Developer Guide](03-backend-aspnet-core-developer-guide.md)**
