-- ==============================================================================
-- KajBazar Standard CRUD Queries (PostgreSQL)
-- Operational queries for User Authentication, Worker Search, Reviews & Admin
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USER AUTHENTICATION & MANAGEMENT (BR-01, BR-13)
-- ------------------------------------------------------------------------------

-- 1.1 Register New Consumer User Account
INSERT INTO users (full_name, email, phone_number, password_hash)
VALUES ('Asif Sourav', 'asif@gmail.com', '01733333333', '$2a$11$e.fWwWbBq.v/4U7NlV.N9O1.11223344556677889900aa')
RETURNING user_id, full_name, email;

-- Assign Consumer Role
INSERT INTO user_roles (user_id, role_id)
VALUES ('<user_id_here>', (SELECT role_id FROM roles WHERE role_name = 'Consumer'));

-- 1.2 User Login Lookup
SELECT u.user_id, u.full_name, u.email, u.password_hash, u.is_active, r.role_name
FROM users u
JOIN user_roles ur ON u.user_id = ur.user_id
JOIN roles r ON ur.role_id = r.role_id
WHERE u.email = 'leon@gmail.com' AND u.is_active = TRUE;


-- ------------------------------------------------------------------------------
-- 2. WORKER PROFILE MANAGEMENT (BR-02, BR-04)
-- ------------------------------------------------------------------------------

-- 2.1 Worker Profile Creation (Initial Status = PENDING)
INSERT INTO service_provider_profiles (user_id, district_id, upazila_id, bio, experience_years, hourly_rate)
VALUES (
    '<worker_user_id>',
    (SELECT district_id FROM districts WHERE district_name = 'Patuakhali'),
    (SELECT upazila_id FROM upazilas WHERE upazila_name = 'Dumki'),
    'Professional mechanic specializing in 4-stroke generator and motorcycle engine repair.',
    6,
    400.00
)
RETURNING profile_id, verification_status;

-- Map Worker to Categories
INSERT INTO worker_categories (profile_id, category_id)
VALUES ('<worker_profile_id>', (SELECT category_id FROM categories WHERE category_name = 'Mechanic'));

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
VALUES ('Mason', 'Brickwork, concrete plastering, and stone building construction.', '/icons/mason.png');
