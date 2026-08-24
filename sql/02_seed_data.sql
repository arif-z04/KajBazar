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
    ('a0000000-0000-0000-0000-000000000001', 'Admin System', 'admin@kajbazar.com', '01700000001', '$2a$11$e.fWwWbBq.v/4U7NlV.N9O1.11223344556677889900aa'),
    ('b0000000-0000-0000-0000-000000000001', 'Leon Islam (Consumer)', 'leon@gmail.com', '01711111111', '$2a$11$e.fWwWbBq.v/4U7NlV.N9O1.11223344556677889900aa'),
    ('b0000000-0000-0000-0000-000000000002', 'Tanvir Ishrak (Consumer)', 'tanvir@gmail.com', '01722222222', '$2a$11$e.fWwWbBq.v/4U7NlV.N9O1.11223344556677889900aa'),
    ('c0000000-0000-0000-0000-000000000001', 'Karim Electrical (Worker)', 'karim@gmail.com', '01811111111', '$2a$11$e.fWwWbBq.v/4U7NlV.N9O1.11223344556677889900aa'),
    ('c0000000-0000-0000-0000-000000000002', 'Rahim Plumbing (Worker)', 'rahim@gmail.com', '01822222222', '$2a$11$e.fWwWbBq.v/4U7NlV.N9O1.11223344556677889900aa')
ON CONFLICT (email) DO NOTHING;

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
