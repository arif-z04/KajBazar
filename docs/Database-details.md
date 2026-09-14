# KajBazar - Database Details & Schema Documentation

This document provides complete technical specifications for the **KajBazar** relational database hosted on **PostgreSQL 15+**.

---

## 1. Entity-Relationship Overview

The database manages 12 core tables storing user credentials, role permissions, worker professional profiles, service taxonomy, regional hierarchy (Districts & Upazilas), reviews, community recommendations, content reports, and system audit logs.

### Summary Table List
| Table Name | Description | Primary Key |
| :--- | :--- | :--- |
| `roles` | System roles (`Consumer`, `ServiceProvider`, `Admin`) | `role_id` (INT) |
| `users` | System user accounts and authentication credentials | `user_id` (UUID) |
| `user_roles` | Junction table mapping users to roles (RBAC) | `user_id`, `role_id` |
| `districts` | Administrative districts in Bangladesh (e.g. Patuakhali, Dhaka) | `district_id` (INT) |
| `upazilas` | Sub-districts associated with a district (e.g. Dumki, Bauphal) | `upazila_id` (INT) |
| `categories` | Service categories (e.g. Electrician, Plumber, Carpenter) | `category_id` (INT) |
| `service_provider_profiles` | Detailed professional profiles for skilled service providers | `profile_id` (UUID) |
| `worker_categories` | Junction table mapping workers to service categories | `profile_id`, `category_id` |
| `reviews` | Customer ratings (1-5) and reviews for verified workers | `review_id` (UUID) |
| `community_recommendations` | Offline worker recommendations submitted by community users | `recommendation_id` (UUID) |
| `reports` | Inappropriate content or user behavior reports | `report_id` (UUID) |
| `admin_audit_logs` | Audit trail of administrative operations | `log_id` (UUID) |

---

## 2. Detailed Data Dictionary & Schema Specifications

### 2.1 `roles`
Stores role names for RBAC authorization.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `role_id` | `INT` | `GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Unique role identifier |
| `role_name` | `VARCHAR(50)` | `NOT NULL UNIQUE` | Role name (`Consumer`, `ServiceProvider`, `Admin`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

---

### 2.2 `users`
Stores login credentials, contact info, and status for all system accounts.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique user identifier |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | User's full name |
| `email` | `VARCHAR(150)` | `NOT NULL UNIQUE` | User email address (login identifier) |
| `phone_number` | `VARCHAR(20)` | `NOT NULL UNIQUE` | Contact phone number |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hashed password (60-char BCrypt) |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Account status flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |

---

### 2.3 `user_roles`
Junction table mapping users to roles (supporting RBAC).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `NOT NULL REFERENCES users(user_id) ON DELETE CASCADE` | User account |
| `role_id` | `INT` | `NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE` | Assigned role |
*(Composite Primary Key: `PRIMARY KEY (user_id, role_id)`)*

---

### 2.4 `districts` & `upazilas`
Hierarchical geographical locations for Bangladesh.

#### `districts`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `district_id` | `INT` | `GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | District ID |
| `district_name` | `VARCHAR(100)` | `NOT NULL UNIQUE` | District name (e.g. Patuakhali, Dhaka) |

#### `upazilas`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `upazila_id` | `INT` | `GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Upazila ID |
| `district_id` | `INT` | `NOT NULL REFERENCES districts(district_id) ON DELETE CASCADE` | Parent district |
| `upazila_name` | `VARCHAR(100)` | `NOT NULL` | Upazila name (e.g. Dumki, Bauphal) |
*(Unique Constraint: `uq_district_upazila UNIQUE (district_id, upazila_name)`)*

---

### 2.5 `categories`
Service provider operational categories.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `category_id` | `INT` | `GENERATED ALWAYS AS IDENTITY PRIMARY KEY` | Category ID |
| `category_name` | `VARCHAR(100)` | `NOT NULL UNIQUE` | Service title (e.g. Electrician, Plumber) |
| `description` | `TEXT` | `NULL` | Service category description |
| `icon_url` | `VARCHAR(255)` | `NULL` | Category UI icon path |
| `is_active` | `BOOLEAN` | `NOT NULL DEFAULT TRUE` | Category active status |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

---

### 2.6 `service_provider_profiles`
Profile details for skilled workers. Enforces business rule `BR-03` (`verification_status = 'VERIFIED'`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `profile_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Profile ID |
| `user_id` | `UUID` | `NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE` | 1-to-1 link to user |
| `district_id` | `INT` | `NOT NULL REFERENCES districts(district_id)` | Primary district |
| `upazila_id` | `INT` | `NOT NULL REFERENCES upazilas(upazila_id)` | Primary upazila |
| `bio` | `TEXT` | `NULL` | Experience summary |
| `experience_years` | `INT` | `NOT NULL DEFAULT 0 CHECK (experience_years >= 0)` | Years of experience |
| `hourly_rate` | `NUMERIC(10,2)` | `CHECK (hourly_rate >= 0)` | Expected rate (optional) |
| `verification_status`| `VARCHAR(20)`| `NOT NULL DEFAULT 'PENDING' CHECK (...)` | `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED` |
| `verified_at` | `TIMESTAMPTZ` | `NULL` | Verification timestamp |
| `average_rating` | `NUMERIC(3,2)` | `NOT NULL DEFAULT 0.00 CHECK (average_rating BETWEEN 0.00 AND 5.00)` | Auto-calculated aggregate rating |
| `total_reviews` | `INT` | `NOT NULL DEFAULT 0 CHECK (total_reviews >= 0)` | Count of reviews |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record update timestamp |

---

### 2.7 `worker_categories`
Junction table mapping workers to service categories (`BR-04`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `profile_id` | `UUID` | `NOT NULL REFERENCES service_provider_profiles(profile_id) ON DELETE CASCADE` | Worker profile |
| `category_id` | `INT` | `NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE` | Service category |
*(Composite Primary Key: `PRIMARY KEY (profile_id, category_id)`)*

---

### 2.8 `reviews`
Consumer ratings and feedback for verified service providers. Enforces `BR-08` via `UNIQUE(consumer_id, worker_profile_id)`.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `review_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Review ID |
| `consumer_id` | `UUID` | `NOT NULL REFERENCES users(user_id) ON DELETE CASCADE` | Reviewing consumer |
| `worker_profile_id` | `UUID` | `NOT NULL REFERENCES service_provider_profiles(profile_id) ON DELETE CASCADE` | Worker being reviewed |
| `rating` | `INT` | `NOT NULL CHECK (rating BETWEEN 1 AND 5)` | Rating (1 to 5 stars) |
| `comment` | `TEXT` | `NULL` | Review comment text |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Review submission timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Review update timestamp |
*(Unique Constraint: `uq_consumer_worker_review UNIQUE (consumer_id, worker_profile_id)`)*

---

### 2.9 `community_recommendations`
User recommendations for skilled offline workers not yet registered on the platform (`BR-09`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `recommendation_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Recommendation ID |
| `recommended_by_user_id` | `UUID` | `NOT NULL REFERENCES users(user_id) ON DELETE CASCADE` | Submitting user ID |
| `worker_name` | `VARCHAR(100)` | `NOT NULL` | Offline worker name |
| `phone_number` | `VARCHAR(20)` | `NOT NULL` | Worker phone number |
| `category_id` | `INT` | `NOT NULL REFERENCES categories(category_id)` | Worker service category |
| `district_id` | `INT` | `NOT NULL REFERENCES districts(district_id)` | Worker location district |
| `upazila_id` | `INT` | `NOT NULL REFERENCES upazilas(upazila_id)` | Worker location upazila |
| `notes` | `TEXT` | `NULL` | Additional context |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'PENDING' CHECK (...)` | `PENDING`, `APPROVED`, `REJECTED` |
| `reviewed_by_admin_id` | `UUID` | `NULL REFERENCES users(user_id)` | Admin reviewer |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

---

### 2.10 `reports`
Inappropriate content or user behavior reports (`BR-12`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `report_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Report ID |
| `reporter_user_id` | `UUID` | `NOT NULL REFERENCES users(user_id) ON DELETE CASCADE` | Reporter user ID |
| `target_type` | `VARCHAR(30)` | `NOT NULL CHECK (target_type IN ('WORKER_PROFILE', 'REVIEW', 'USER'))` | Report target |
| `target_id` | `UUID` | `NOT NULL` | Target entity UUID |
| `reason` | `VARCHAR(100)` | `NOT NULL` | Reason for report |
| `status` | `VARCHAR(20)` | `NOT NULL DEFAULT 'PENDING' CHECK (...)` | `PENDING`, `RESOLVED`, `DISMISSED` |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Report submission timestamp |

---

### 2.11 `admin_audit_logs`
Audit trail of administrative operations enforcing `BR-14`.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `log_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Log ID |
| `admin_user_id` | `UUID` | `NOT NULL REFERENCES users(user_id)` | Admin who performed action |
| `action` | `VARCHAR(100)` | `NOT NULL` | Action identifier (e.g. `VERIFY_WORKER_PROFILE`) |
| `target_entity` | `VARCHAR(50)` | `NOT NULL` | Target table |
| `target_id` | `UUID` | `NOT NULL` | Target record UUID |
| `details` | `TEXT` | `NULL` | Human-readable details |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL DEFAULT CURRENT_TIMESTAMP` | Action timestamp |

---

## 3. Automated Rating Recalculation Trigger

Whenever a review is inserted, updated, or deleted on the `reviews` table, the `trg_update_worker_rating_stats` trigger fires automatically to recalculate the worker's `average_rating` and `total_reviews` in O(1) time:

```sql
CREATE OR REPLACE FUNCTION update_worker_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
    target_worker_id UUID;
    new_avg NUMERIC(3,2);
    new_count INT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_worker_id := OLD.worker_profile_id;
    ELSE
        target_worker_id := NEW.worker_profile_id;
    END IF;

    SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0.00), COUNT(*)
    INTO new_avg, new_count
    FROM reviews
    WHERE worker_profile_id = target_worker_id;

    UPDATE service_provider_profiles
    SET average_rating = new_avg,
        total_reviews = new_count,
        updated_at = CURRENT_TIMESTAMP
    WHERE profile_id = target_worker_id;

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
```

---

## 4. Performance Indexes

1. **`idx_sp_verification_search`**: On `service_provider_profiles (verification_status, district_id, upazila_id)`.
2. **`idx_worker_categories_cat`**: On `worker_categories (category_id, profile_id)`.
3. **`idx_reviews_worker`**: On `reviews (worker_profile_id, rating)`.
4. **`idx_users_email` & `idx_users_phone`**: On `users (email)` and `users (phone_number)`.
