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
