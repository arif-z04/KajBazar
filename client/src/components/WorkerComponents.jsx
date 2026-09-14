import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { submitReviewApi, getWorkerProfileApi, getCategoriesApi, getDistrictsApi } from '../services/api';

export const WorkerCard = ({ worker, onViewDetails }) => {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div className="worker-card">
      <div className="card-top">
        <div className="avatar-circle">
          {worker.workerName ? worker.workerName[0].toUpperCase() : 'W'}
        </div>
        <div className="worker-title-area">
          <h3 className="worker-title">{worker.workerName}</h3>
          <span className="location-tag">📍 {worker.upazilaName}, {worker.districtName}</span>
        </div>
        <div className="rating-pill" title={`${worker.averageRating} out of 5 stars`}>
          ⭐ {Number(worker.averageRating).toFixed(1)} <small>({worker.totalReviews})</small>
        </div>
      </div>

      <div className="category-tags">
        {worker.categories && worker.categories.length > 0 ? (
          worker.categories.map((cat, idx) => (
            <span key={idx} className="tag-pill">{cat}</span>
          ))
        ) : (
          <span className="tag-pill">Skilled Worker</span>
        )}
      </div>

      {worker.bio && <p className="worker-bio-snippet">{worker.bio}</p>}

      <div className="worker-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Experience</span>
          <span className="meta-value">{worker.experienceYears} Years</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Expected Rate</span>
          <span className="meta-value">
            {worker.hourlyRate ? `৳${worker.hourlyRate}/hr` : 'Negotiable'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Status</span>
          <span className="meta-value verified-badge">✓ Verified</span>
        </div>
      </div>

      <div className="card-action-buttons">
        {showPhone ? (
          <a href={`tel:${worker.phoneNumber}`} className="btn-call-active" title="Click to call directly">
            📞 {worker.phoneNumber}
          </a>
        ) : (
          <button 
            type="button" 
            onClick={() => setShowPhone(true)} 
            className="btn-contact-reveal"
            title="Direct contact without intermediary (BR-06)"
          >
            📞 Contact Worker
          </button>
        )}

        <button 
          type="button" 
          onClick={() => onViewDetails(worker.profileId)} 
          className="btn-view-details"
        >
          Reviews & Details
        </button>
      </div>
    </div>
  );
};

export const WorkerFilter = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  useEffect(() => {
    const loadFilterMetadata = async () => {
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    };
    loadFilterMetadata();
  }, []);

  const handleDistrictChange = (e) => {
    const districtId = e.target.value ? parseInt(e.target.value, 10) : null;
    onFilterChange('districtId', districtId);
    onFilterChange('upazilaId', null);

    if (districtId) {
      const selected = districts.find(d => d.districtId === districtId);
      setAvailableUpazilas(selected?.upazilas || []);
    } else {
      setAvailableUpazilas([]);
    }
  };

  return (
    <div className="filter-panel-card">
      <div className="filter-header">
        <h3>🔍 Search & Location Filter (BR-05)</h3>
        <button type="button" onClick={onReset} className="btn-reset-filter">Reset Filters</button>
      </div>

      <div className="filter-controls-grid">
        <div className="filter-field">
          <label>Service Category</label>
          <select 
            value={filters.category || ''} 
            onChange={(e) => onFilterChange('category', e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryName}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>District</label>
          <select 
            value={filters.districtId || ''} 
            onChange={handleDistrictChange}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.districtId} value={d.districtId}>
                {d.districtName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Upazila / Sub-District</label>
          <select 
            value={filters.upazilaId || ''} 
            onChange={(e) => onFilterChange('upazilaId', e.target.value ? parseInt(e.target.value, 10) : null)}
            disabled={!filters.districtId}
          >
            <option value="">All Upazilas</option>
            {availableUpazilas.map((u) => (
              <option key={u.upazilaId} value={u.upazilaId}>
                {u.upazilaName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Minimum Rating</label>
          <select 
            value={filters.minRating || ''} 
            onChange={(e) => onFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
          >
            <option value="">Any Rating</option>
            <option value="3.0">3.0+ Stars ⭐⭐⭐</option>
            <option value="4.0">4.0+ Stars ⭐⭐⭐⭐</option>
            <option value="4.5">4.5+ Stars ⭐⭐⭐⭐⭐</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const WorkerDetailModal = ({ profileId, onClose, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const res = await getWorkerProfileApi(profileId);
        setWorker(res.data);
      } catch (err) {
        console.error("Failed to load worker profile details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (profileId) fetchWorker();
  }, [profileId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMsg(null);
    setReviewError(null);

    try {
      await submitReviewApi({
        workerProfileId: profileId,
        rating: parseInt(rating, 10),
        comment: comment.trim() || null
      });

      setReviewMsg("Thank you! Your rating and review have been submitted.");
      setComment('');
      
      // Refresh worker details to reflect updated rating & reviews
      const freshRes = await getWorkerProfileApi(profileId);
      setWorker(freshRes.data);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!profileId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {loading ? (
          <div className="loading-state">Loading worker profile...</div>
        ) : !worker ? (
          <div className="error-state">Worker details could not be found.</div>
        ) : (
          <div className="modal-body">
            <div className="modal-header-section">
              <div className="avatar-large">{worker.workerName ? worker.workerName[0].toUpperCase() : 'W'}</div>
              <div className="modal-title-info">
                <h2>{worker.workerName}</h2>
                <p className="modal-location">📍 {worker.upazilaName}, {worker.districtName}</p>
                <div className="modal-badges">
                  <span className="badge-verified">✓ Verified Professional</span>
                  <span className="badge-rating">⭐ {Number(worker.averageRating).toFixed(1)} / 5.0 ({worker.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="modal-categories">
              <strong>Specializations:</strong>
              <div className="tag-list">
                {worker.categories?.map((cat, idx) => (
                  <span key={idx} className="tag-pill large">{cat}</span>
                ))}
              </div>
            </div>

            <div className="modal-details-grid">
              <div className="detail-box">
                <span className="detail-label">Experience</span>
                <span className="detail-val">{worker.experienceYears} Years in Service</span>
              </div>
              <div className="detail-box">
                <span className="detail-label">Rate / Charge</span>
                <span className="detail-val">{worker.hourlyRate ? `৳${worker.hourlyRate} / hour` : 'Negotiable'}</span>
              </div>
              <div className="detail-box">
                <span className="detail-label">Direct Contact (BR-06)</span>
                <a href={`tel:${worker.phoneNumber}`} className="btn-call-direct">
                  📞 {worker.phoneNumber}
                </a>
              </div>
            </div>

            {worker.bio && (
              <div className="modal-bio-section">
                <h4>About Service Provider</h4>
                <p>{worker.bio}</p>
              </div>
            )}

            <hr className="modal-divider" />

            {/* Reviews Section */}
            <div className="modal-reviews-section">
              <h3>Customer Reviews ({worker.reviews?.length || 0})</h3>

              {worker.reviews && worker.reviews.length > 0 ? (
                <div className="reviews-list">
                  {worker.reviews.map((rev) => (
                    <div key={rev.reviewId} className="review-item-card">
                      <div className="review-item-header">
                        <span className="reviewer-name">👤 {rev.consumerName}</span>
                        <span className="review-stars">{'⭐'.repeat(rev.rating)}</span>
                        <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      {rev.comment && <p className="review-comment-text">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews-msg">No reviews yet for this service provider. Be the first to review!</p>
              )}

              {/* Review Submission Form (BR-07, BR-08) */}
              <div className="add-review-container">
                <h4>Rate This Worker</h4>
                {!isAuthenticated ? (
                  <p className="login-to-review-hint">
                    Please <a href="/login">Login as a Consumer</a> to submit a rating and review (BR-07).
                  </p>
                ) : worker.userId === user?.userId ? (
                  <p className="self-review-hint">You cannot review your own profile.</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="review-form">
                    {reviewMsg && <div className="alert-success">{reviewMsg}</div>}
                    {reviewError && <div className="alert-danger">{reviewError}</div>}

                    <div className="form-row-rating">
                      <label>Star Rating (1 to 5):</label>
                      <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value="3">⭐⭐⭐ (3 - Average)</option>
                        <option value="2">⭐⭐ (2 - Poor)</option>
                        <option value="1">⭐ (1 - Very Bad)</option>
                      </select>
                    </div>

                    <div className="form-row-comment">
                      <label>Feedback & Comments (optional):</label>
                      <textarea
                        rows="3"
                        placeholder="Share your experience regarding punctuality, quality of work, pricing..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={1000}
                      />
                    </div>

                    <button type="submit" disabled={submittingReview} className="btn-submit-review">
                      {submittingReview ? 'Submitting...' : 'Submit / Update Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
