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
