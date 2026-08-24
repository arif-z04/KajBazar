# KajBazar - Database Details & Schema Documentation

This document provides complete technical specifications for the **KajBazar** relational database hosted on **PostgreSQL**.

---

## 1. Entity-Relationship Overview

The database manages 12 core tables storing user credentials, role permissions, worker professional profiles, service taxonomy, regional hierarchy (Districts & Upazilas), reviews, community recommendations, content reports, and system audit logs.

### Summary Table List
| Table Name | Description | Primary Key |
| :--- | :--- | :--- |
| `roles` | System roles (`Consumer`, `ServiceProvider`, `Admin`) | `role_id` |
| `users` | System user accounts and authentication credentials | `user_id` |
| `user_roles` | Junction table mapping users to roles | `user_id`, `role_id` |
| `districts` | Administrative districts in Bangladesh | `district_id` |
| `upazilas` | Sub-districts associated with a district | `upazila_id` |
| `categories` | Service categories (e.g. Electrician, Plumber, Carpenter) | `category_id` |
| `service_provider_profiles` | Detailed professional profiles for service providers | `profile_id` |
| `worker_categories` | Junction table mapping workers to service categories | `profile_id`, `category_id` |
| `reviews` | Customer ratings and reviews for verified workers | `review_id` |
| `community_recommendations` | Offline worker recommendations submitted by users | `recommendation_id` |
| `reports` | Inappropriate content or user behavior reports | `report_id` |
| `admin_audit_logs` | Audit trail of administrative operations | `log_id` |

---

## 2. Detailed Data Dictionary & Schema Specifications

### 2.1 `roles`
Stores role names for RBAC authorization.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `role_id` | `INT` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Unique role identifier |
| `role_name` | `VARCHAR(50)` | `NOT NULL`, `UNIQUE` | Role name (`Consumer`, `ServiceProvider`, `Admin`) |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

---

### 2.2 `users`
Stores login credentials, contact info, and status for all system accounts.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Unique user identifier |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | User's full name |
| `email` | `VARCHAR(150)` | `NOT NULL`, `UNIQUE` | User email address (login identifier) |
| `phone_number` | `VARCHAR(20)` | `NOT NULL`, `UNIQUE` | Contact phone number |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Hashed password (BCrypt) |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Account status flag |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Last updated timestamp |

---

### 2.3 `districts` & `upazilas`
Hierarchical geographical locations for Bangladesh.

#### `districts`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `district_id` | `INT` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | District ID |
| `district_name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Name of district (e.g. Dhaka, Patuakhali) |

#### `upazilas`
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `upazila_id` | `INT` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Upazila ID |
| `district_id` | `INT` | `NOT NULL`, `FK -> districts(district_id)` | Parent district ID |
| `upazila_name` | `VARCHAR(100)` | `NOT NULL` | Upazila name (e.g. Dumki, Mirzaganj) |

---

### 2.4 `categories`
Service provider operational categories.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `category_id` | `INT` | `PRIMARY KEY`, `GENERATED ALWAYS AS IDENTITY` | Category ID |
| `category_name` | `VARCHAR(100)` | `NOT NULL`, `UNIQUE` | Service title (e.g., Electrician, Plumber) |
| `description` | `TEXT` | `NULL` | Service category description |
| `icon_url` | `VARCHAR(255)` | `NULL` | Category UI icon path |
| `is_active` | `BOOLEAN` | `NOT NULL`, `DEFAULT TRUE` | Category active status |

---

### 2.5 `service_provider_profiles`
Profile details for skilled workers. Enforces business rule `BR-03` (`verification_status = 'VERIFIED'`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `profile_id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Profile ID |
| `user_id` | `UUID` | `NOT NULL`, `UNIQUE`, `FK -> users(user_id)` | User account ID |
| `district_id` | `INT` | `NOT NULL`, `FK -> districts(district_id)` | Service district |
| `upazila_id` | `INT` | `NOT NULL`, `FK -> upazilas(upazila_id)` | Service upazila |
| `bio` | `TEXT` | `NULL` | Experience summary |
| `experience_years` | `INT` | `NOT NULL`, `DEFAULT 0` | Years of experience |
| `hourly_rate` | `NUMERIC(10,2)` | `NULL` | Expected rate (optional) |
| `verification_status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'PENDING'` | Status: `PENDING`, `VERIFIED`, `REJECTED`, `SUSPENDED` |
| `verified_at` | `TIMESTAMPTZ` | `NULL` | Verification timestamp |
| `average_rating` | `NUMERIC(3,2)` | `NOT NULL`, `DEFAULT 0.00` | Aggregated average rating |
| `total_reviews` | `INT` | `NOT NULL`, `DEFAULT 0` | Count of reviews |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Record update timestamp |

---

### 2.6 `reviews`
Consumer ratings and feedback for verified service providers. Enforces `BR-08` via `UNIQUE(consumer_id, worker_profile_id)`.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `review_id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Review ID |
| `consumer_id` | `UUID` | `NOT NULL`, `FK -> users(user_id)` | Reviewing consumer |
| `worker_profile_id` | `UUID` | `NOT NULL`, `FK -> service_provider_profiles(profile_id)` | Worker being reviewed |
| `rating` | `INT` | `NOT NULL`, `CHECK (rating BETWEEN 1 AND 5)` | Rating (1 to 5 stars) |
| `comment` | `TEXT` | `NULL` | Review comment text |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Review submission timestamp |
| `updated_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Review update timestamp |

---

### 2.7 `community_recommendations`
User recommendations for skilled offline workers not yet registered on the platform (`BR-09`).

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `recommendation_id` | `UUID` | `PRIMARY KEY`, `DEFAULT gen_random_uuid()` | Recommendation ID |
| `recommended_by_user_id` | `UUID` | `NOT NULL`, `FK -> users(user_id)` | Submitting user ID |
| `worker_name` | `VARCHAR(100)` | `NOT NULL` | Offline worker name |
| `phone_number` | `VARCHAR(20)` | `NOT NULL` | Worker phone number |
| `category_id` | `INT` | `NOT NULL`, `FK -> categories(category_id)` | Worker service category |
| `district_id` | `INT` | `NOT NULL`, `FK -> districts(district_id)` | Worker location district |
| `upazila_id` | `INT` | `NOT NULL`, `FK -> upazilas(upazila_id)` | Worker location upazila |
| `notes` | `TEXT` | `NULL` | Additional context |
| `status` | `VARCHAR(20)` | `NOT NULL`, `DEFAULT 'PENDING'` | Status: `PENDING`, `APPROVED`, `REJECTED` |
| `reviewed_by_admin_id` | `UUID` | `NULL`, `FK -> users(user_id)` | Admin reviewer |
| `created_at` | `TIMESTAMPTZ` | `NOT NULL`, `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp |

---

## 3. Database Indexing Strategy

To support location-based and category-based worker searches (`BR-05`), the following B-Tree indexes are created:

1. **`idx_sp_verification_search`**: On `service_provider_profiles (verification_status, district_id, upazila_id)` to rapidly filter public verified workers by location.
2. **`idx_worker_categories_cat`**: On `worker_categories (category_id, profile_id)` for category filtering.
3. **`idx_reviews_worker`**: On `reviews (worker_profile_id, rating)` for fast average score aggregate lookup.
4. **`idx_users_email_phone`**: Unique index on `users (email)` and `users (phone_number)` for login performance.
