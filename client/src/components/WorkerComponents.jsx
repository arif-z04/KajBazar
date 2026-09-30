import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  submitReviewApi,
  getWorkerProfileApi,
  getCategoriesApi,
  getDistrictsApi
} from '../services/api';
import {
  Button,
  Badge,
  Modal,
  RatingStars,
  Skeleton
} from './common';
import {
  MapPin,
  Phone,
  PhoneCall,
  Clock,
  Briefcase,
  Star,
  CheckCircle2,
  Filter,
  RotateCcw,
  Sparkles,
  ChevronRight,
  MessageSquare
} from 'lucide-react';

export const WorkerCard = ({ worker, onViewDetails }) => {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <article className="worker-card-modern" aria-label={`Worker ${worker.workerName}`}>
      <div>
        <div className="worker-top-row">
          <div className="worker-avatar">
            {worker.workerName ? worker.workerName.charAt(0).toUpperCase() : 'W'}
          </div>
          <div className="worker-header-info">
            <h3 className="worker-name">{worker.workerName}</h3>
            <div className="worker-location">
              <MapPin size={14} />
              <span>{worker.upazilaName ? `${worker.upazilaName}, ` : ''}{worker.districtName || 'Bangladesh'}</span>
            </div>
          </div>
          <Badge variant="verified" size="sm">
            Verified
          </Badge>
        </div>

        {/* Rating & Review summary */}
        <div style={{ marginBottom: '0.85rem' }}>
          <RatingStars
            rating={worker.averageRating}
            showValue={true}
            totalReviews={worker.totalReviews}
            size={15}
          />
        </div>

        {/* Category Specialization Tags */}
        <div className="worker-categories-list">
          {worker.categories && worker.categories.length > 0 ? (
            worker.categories.map((cat, idx) => (
              <span key={idx} className="category-tag-pill">
                {cat}
              </span>
            ))
          ) : (
            <span className="category-tag-pill">Skilled Technician</span>
          )}
        </div>

        {/* Bio Snippet */}
        {worker.bio && (
          <p className="worker-bio-text">
            {worker.bio}
          </p>
        )}

        {/* Experience & Rate Strip */}
        <div className="worker-meta-strip">
          <div className="meta-col">
            <span className="meta-title">Experience</span>
            <span className="meta-val">{worker.experienceYears || 0} Yrs</span>
          </div>
          <div className="meta-col">
            <span className="meta-title">Hourly Rate</span>
            <span className="meta-val">
              {worker.hourlyRate ? `৳${worker.hourlyRate}/hr` : 'Negotiable'}
            </span>
          </div>
          <div className="meta-col">
            <span className="meta-title">Direct Contact</span>
            <span className="meta-val" style={{ color: 'var(--secondary)' }}>Active</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="worker-action-row">
        {showPhone ? (
          <a
            href={`tel:${worker.phoneNumber}`}
            className="btn-phone-revealed"
            title="Click to place phone call"
            aria-label={`Call ${worker.workerName} at ${worker.phoneNumber}`}
          >
            <PhoneCall size={16} />
            <span>{worker.phoneNumber}</span>
          </a>
        ) : (
          <Button
            variant="outline"
            size="sm"
            icon={Phone}
            onClick={() => setShowPhone(true)}
            className="btn-reveal-phone"
            title="Click to view direct phone number"
          >
            Contact Phone
          </Button>
        )}

        <Button
          variant="primary"
          size="sm"
          icon={ChevronRight}
          iconPosition="right"
          onClick={() => onViewDetails(worker.profileId)}
        >
          View Profile
        </Button>
      </div>
    </article>
  );
};

export const WorkerFilter = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);

        if (filters.districtId) {
          const selected = distRes.data.find(d => d.districtId === filters.districtId);
          setAvailableUpazilas(selected?.upazilas || []);
        }
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    };
    loadMetadata();
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
    <div className="filter-card-panel">
      <div className="filter-header-bar">
        <div className="filter-title">
          <Filter size={18} />
          <span>Filter & Search Professionals</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={RotateCcw}
          onClick={onReset}
        >
          Reset Filters
        </Button>
      </div>

      <div className="filter-controls-row">
        <div className="filter-item">
          <label htmlFor="filter-category">Service Category</label>
          <select
            id="filter-category"
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

        <div className="filter-item">
          <label htmlFor="filter-district">District / City</label>
          <select
            id="filter-district"
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

        <div className="filter-item">
          <label htmlFor="filter-upazila">Upazila / Area</label>
          <select
            id="filter-upazila"
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

        <div className="filter-item">
          <label htmlFor="filter-rating">Minimum Rating</label>
          <select
            id="filter-rating"
            value={filters.minRating || ''}
            onChange={(e) => onFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars ⭐⭐⭐⭐⭐</option>
            <option value="4.0">4.0+ Stars ⭐⭐⭐⭐</option>
            <option value="3.0">3.0+ Stars ⭐⭐⭐</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const WorkerDetailModal = ({ profileId, onClose, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const toast = useToast();

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const res = await getWorkerProfileApi(profileId);
        setWorker(res.data);
      } catch (err) {
        console.error("Failed to load worker profile details:", err);
        toast.error("Could not load worker profile details.");
      } finally {
        setLoading(false);
      }
    };
    if (profileId) fetchWorker();
  }, [profileId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      await submitReviewApi({
        workerProfileId: profileId,
        rating: parseInt(rating, 10),
        comment: comment.trim() || null
      });

      toast.success("Your rating and review have been submitted successfully!");
      setComment('');

      // Refresh worker data
      const freshRes = await getWorkerProfileApi(profileId);
      setWorker(freshRes.data);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!profileId) return null;

  return (
    <Modal
      isOpen={Boolean(profileId)}
      onClose={onClose}
      maxWidth="lg"
      title={worker ? worker.workerName : "Worker Details"}
      subtitle={worker ? `${worker.upazilaName ? `${worker.upazilaName}, ` : ''}${worker.districtName || 'Bangladesh'}` : ''}
    >
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
          <Skeleton height="70px" borderRadius="var(--radius-md)" />
          <Skeleton height="100px" borderRadius="var(--radius-md)" />
          <Skeleton height="150px" borderRadius="var(--radius-md)" />
        </div>
      ) : !worker ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--slate-500)' }}>
          Worker details could not be found.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Header Info & Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div className="worker-avatar" style={{ width: '64px', height: '64px', fontSize: '1.75rem' }}>
                {worker.workerName ? worker.workerName.charAt(0).toUpperCase() : 'W'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '4px' }}>{worker.workerName}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RatingStars
                    rating={worker.averageRating}
                    showValue={true}
                    totalReviews={worker.totalReviews}
                    size={16}
                  />
                  <Badge variant="verified" size="sm">Verified Worker</Badge>
                </div>
              </div>
            </div>

            <a
              href={`tel:${worker.phoneNumber}`}
              className="btn-phone-revealed"
              style={{ fontSize: '1rem', padding: '0.65rem 1.25rem' }}
            >
              <PhoneCall size={18} />
              <span>Call: {worker.phoneNumber}</span>
            </a>
          </div>

          {/* Quick Metrics */}
          <div className="worker-meta-strip" style={{ padding: '0.85rem' }}>
            <div className="meta-col">
              <span className="meta-title">Practical Experience</span>
              <span className="meta-val" style={{ fontSize: '1rem' }}>{worker.experienceYears || 0} Years</span>
            </div>
            <div className="meta-col">
              <span className="meta-title">Hourly Rate</span>
              <span className="meta-val" style={{ fontSize: '1rem' }}>
                {worker.hourlyRate ? `৳${worker.hourlyRate} / hour` : 'Negotiable'}
              </span>
            </div>
            <div className="meta-col">
              <span className="meta-title">Location</span>
              <span className="meta-val" style={{ fontSize: '0.9rem' }}>
                {worker.upazilaName}, {worker.districtName}
              </span>
            </div>
          </div>

          {/* Specialization Categories */}
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-700)', marginBottom: '0.5rem' }}>
              Skills & Service Categories
            </h4>
            <div className="worker-categories-list">
              {worker.categories?.map((cat, idx) => (
                <span key={idx} className="category-tag-pill" style={{ fontSize: '0.85rem', padding: '0.3rem 0.8rem' }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Bio */}
          {worker.bio && (
            <div>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-700)', marginBottom: '0.4rem' }}>
                Professional Background
              </h4>
              <p style={{ color: 'var(--slate-600)', lineHeight: '1.6', fontSize: '0.925rem' }}>
                {worker.bio}
              </p>
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />

          {/* Reviews List */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={18} />
                <span>Customer Reviews ({worker.reviews?.length || 0})</span>
              </h4>
            </div>

            {worker.reviews && worker.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {worker.reviews.map((rev) => (
                  <div key={rev.reviewId} className="review-item">
                    <div className="review-user-row">
                      <span className="review-user-name">{rev.consumerName || 'Community Member'}</span>
                      <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                    </div>
                    <RatingStars rating={rev.rating} size={14} style={{ marginBottom: '6px' }} />
                    {rev.comment && <p className="review-comment">{rev.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                  No customer reviews yet. Be the first to share your experience with {worker.workerName}!
                </p>
              </div>
            )}
          </div>

          {/* Submit Review Section */}
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--slate-800)' }}>
              Rate & Review This Service Provider
            </h4>

            {!isAuthenticated ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                Please <Link to="/login" style={{ fontWeight: 600 }}>sign in with a Consumer account</Link> to submit a review and rating.
              </p>
            ) : worker.userId === user?.userId ? (
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                You cannot review your own service provider profile.
              </p>
            ) : (
              <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                    Your Rating:
                  </label>
                  <RatingStars
                    rating={rating}
                    size={22}
                    interactive={true}
                    onChange={(val) => setRating(val)}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                    Review Comments (optional):
                  </label>
                  <textarea
                    rows={3}
                    className="kb-textarea"
                    placeholder="Share feedback on punctuality, pricing, and craftsmanship..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    maxLength={1000}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    loading={submittingReview}
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
