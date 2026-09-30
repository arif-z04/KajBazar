import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  getMyWorkerProfileApi,
  getWorkerProfileApi,
  saveWorkerProfileApi,
  getCategoriesApi,
  getDistrictsApi,
  submitReviewApi
} from '../services/api';
import {
  Button,
  Badge,
  RatingStars,
  Skeleton,
  Input,
  Select,
  Textarea
} from '../components/common';
import {
  Briefcase,
  MapPin,
  PhoneCall,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Save,
  MessageSquare,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export const WorkerProfilePage = () => {
  const { id: paramWorkerId } = useParams();
  const { user, isAuthenticated, isServiceProvider } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  // Distinguish whether this is a public worker view (/workers/:id) or logged-in management dashboard (/my-profile)
  const isPublicView = Boolean(paramWorkerId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  // Public Worker State
  const [publicWorker, setPublicWorker] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Private Management State
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [formData, setFormData] = useState({
    districtId: '',
    upazilaId: '',
    bio: '',
    experienceYears: 0,
    hourlyRate: '',
    categoryIds: []
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);

        if (isPublicView) {
          // Public Worker View
          const res = await getWorkerProfileApi(paramWorkerId);
          setPublicWorker(res.data);
        } else {
          // Private Management Dashboard
          try {
            const profileRes = await getMyWorkerProfileApi();
            const p = profileRes.data;
            setVerificationStatus(p.verificationStatus);
            setStats({ averageRating: p.averageRating, totalReviews: p.totalReviews });

            const matchingDistrict = distRes.data.find(d => d.districtId === p.districtId);
            setAvailableUpazilas(matchingDistrict?.upazilas || []);

            const activeCatIds = catRes.data
              .filter(c => p.categories && p.categories.includes(c.categoryName))
              .map(c => c.categoryId);

            setFormData({
              districtId: p.districtId || '',
              upazilaId: p.upazilaId || '',
              bio: p.bio || '',
              experienceYears: p.experienceYears || 0,
              hourlyRate: p.hourlyRate || '',
              categoryIds: activeCatIds
            });
          } catch {
            // First time setup: no profile created yet
            setVerificationStatus(null);
          }
        }
      } catch (err) {
        console.error("Failed to load profile data:", err);
        toast.error("Unable to load profile information.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [paramWorkerId, isPublicView]);

  const handleDistrictChange = (e) => {
    const dId = parseInt(e.target.value, 10);
    setFormData(prev => ({ ...prev, districtId: dId, upazilaId: '' }));
    const selected = districts.find(d => d.districtId === dId);
    setAvailableUpazilas(selected?.upazilas || []);
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const exists = prev.categoryIds.includes(categoryId);
      const updated = exists
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: updated };
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (formData.categoryIds.length === 0) {
      toast.warning("Please select at least one skill or service category.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        districtId: parseInt(formData.districtId, 10),
        upazilaId: parseInt(formData.upazilaId, 10),
        bio: formData.bio.trim() || null,
        experienceYears: parseInt(formData.experienceYears, 10) || 0,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        categoryIds: formData.categoryIds
      };

      const res = await saveWorkerProfileApi(payload);
      toast.success(res.data.message || "Profile updated successfully!");
      setVerificationStatus(res.data.status || 'PENDING');
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile. Please check your inputs.");
    } finally {
      setSaving(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await submitReviewApi({
        workerProfileId: paramWorkerId,
        rating: parseInt(reviewRating, 10),
        comment: reviewComment.trim() || null
      });
      toast.success("Thank you! Your review has been submitted.");
      setReviewComment('');
      // Reload public worker
      const freshRes = await getWorkerProfileApi(paramWorkerId);
      setPublicWorker(freshRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-detail-page">
        <Skeleton height="140px" borderRadius="var(--radius-xl)" />
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          <Skeleton height="350px" borderRadius="var(--radius-lg)" />
          <Skeleton height="350px" borderRadius="var(--radius-lg)" />
        </div>
      </div>
    );
  }

  // ============================================================================
  // 1. PUBLIC WORKER PROFILE VIEW (/workers/:id)
  // ============================================================================
  if (isPublicView) {
    if (!publicWorker) {
      return (
        <div className="kb-empty-state">
          <AlertCircle size={36} />
          <h3 className="kb-empty-title">Worker Profile Not Found</h3>
          <p className="kb-empty-description">The requested service provider profile does not exist or is not publicly verified.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/directory')}>
            Browse Directory
          </Button>
        </div>
      );
    }

    return (
      <div className="profile-detail-page">
        {/* Profile Hero Card */}
        <section className="profile-hero-card">
          <div className="profile-main-bio-wrap">
            <div className="profile-large-avatar">
              {publicWorker.workerName ? publicWorker.workerName.charAt(0).toUpperCase() : 'W'}
            </div>
            <div className="profile-title-block">
              <h1>{publicWorker.workerName}</h1>
              <div className="profile-location-text">
                <MapPin size={16} />
                <span>{publicWorker.upazilaName}, {publicWorker.districtName}</span>
              </div>
              <div className="profile-status-badges">
                <Badge variant="verified" size="md">
                  Admin-Verified Professional
                </Badge>
                <RatingStars
                  rating={publicWorker.averageRating}
                  showValue={true}
                  totalReviews={publicWorker.totalReviews}
                  size={18}
                />
              </div>
            </div>
          </div>

          <div className="profile-contact-action-box">
            <span className="profile-rate-label">Expected Hourly Rate</span>
            <span className="profile-rate-val">
              {publicWorker.hourlyRate ? `৳${publicWorker.hourlyRate}/hr` : 'Negotiable'}
            </span>
            <a
              href={`tel:${publicWorker.phoneNumber}`}
              className="btn-phone-revealed"
              style={{ width: '100%', padding: '0.75rem 1.25rem', fontSize: '1rem' }}
            >
              <PhoneCall size={18} />
              <span>Call: {publicWorker.phoneNumber}</span>
            </a>
            <small style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>
              Direct phone call • Zero platform fees
            </small>
          </div>
        </section>

        {/* Profile Content Columns */}
        <div className="profile-layout-columns">
          {/* Main Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="reviews-section-card">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Briefcase size={20} />
                <span>Professional Background</span>
              </h3>
              <p style={{ color: 'var(--slate-600)', lineHeight: '1.65', fontSize: '0.95rem' }}>
                {publicWorker.bio || 'This professional has not provided a detailed biography yet.'}
              </p>

              <div style={{ marginTop: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--slate-700)', marginBottom: '0.65rem' }}>
                  Service Categories & Skills
                </h4>
                <div className="worker-categories-list">
                  {publicWorker.categories?.map((cat, idx) => (
                    <span key={idx} className="category-tag-pill" style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Customer Reviews List */}
            <div className="reviews-section-card">
              <div className="reviews-header-row">
                <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={20} />
                  <span>Customer Reviews ({publicWorker.reviews?.length || 0})</span>
                </h3>
              </div>

              {publicWorker.reviews && publicWorker.reviews.length > 0 ? (
                <div>
                  {publicWorker.reviews.map((rev) => (
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
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--slate-500)' }}>
                  No customer reviews yet. Hire this worker and be the first to leave feedback!
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Submit Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="reviews-section-card">
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Rate This Professional
              </h3>

              {!isAuthenticated ? (
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '1rem' }}>
                    Sign in as a consumer to submit an authentic rating and review.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                    Sign In to Review
                  </Button>
                </div>
              ) : publicWorker.userId === user?.userId ? (
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                  You cannot submit a review for your own profile.
                </p>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-700)', marginBottom: '0.35rem' }}>
                      Star Rating:
                    </label>
                    <RatingStars
                      rating={reviewRating}
                      size={24}
                      interactive={true}
                      onChange={(val) => setReviewRating(val)}
                    />
                  </div>

                  <Textarea
                    label="Feedback Comments"
                    placeholder="Describe punctuality, quality, pricing, and communication..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={4}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={submittingReview}
                  >
                    Submit Review
                  </Button>
                </form>
              )}
            </div>

            <div className="reviews-section-card" style={{ background: 'var(--slate-50)' }}>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={18} color="var(--secondary)" />
                <span>Verification Guarantee</span>
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
                This worker has undergone administrative credential review. Direct telephone contact is provided free without intermediaries.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // 2. WORKER MANAGEMENT DASHBOARD (/my-profile)
  // ============================================================================
  return (
    <div className="profile-detail-page">
      {/* Top Header Card */}
      <section className="profile-hero-card">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>
            Service Provider Dashboard
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Manage your service categories, operational location, hourly rate, and public listing status.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>
            Listing Verification Status:
          </span>
          {verificationStatus === 'VERIFIED' && (
            <Badge variant="verified" size="md">
              ✓ Verified & Listed in Directory
            </Badge>
          )}
          {verificationStatus === 'PENDING' && (
            <Badge variant="pending" size="md">
              ⏳ Pending Admin Review
            </Badge>
          )}
          {verificationStatus === 'REJECTED' && (
            <Badge variant="rejected" size="md">
              ✕ Rejection Notice (Contact Admin)
            </Badge>
          )}
          {!verificationStatus && (
            <Badge variant="warning" size="md">
              ⚠️ Incomplete Profile Setup
            </Badge>
          )}
        </div>
      </section>

      {/* Stats Widgets */}
      {verificationStatus === 'VERIFIED' && (
        <section className="metrics-overview-grid">
          <div className="metric-widget">
            <div className="metric-widget-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              <Star size={24} />
            </div>
            <div>
              <div className="metric-widget-val">⭐ {Number(stats.averageRating).toFixed(1)}</div>
              <div className="metric-widget-label">Average Star Rating</div>
            </div>
          </div>

          <div className="metric-widget">
            <div className="metric-widget-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="metric-widget-val">{stats.totalReviews}</div>
              <div className="metric-widget-label">Total Customer Reviews</div>
            </div>
          </div>

          <div className="metric-widget">
            <div className="metric-widget-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              <PhoneCall size={24} />
            </div>
            <div>
              <div className="metric-widget-val" style={{ fontSize: '1.15rem' }}>{user?.phoneNumber}</div>
              <div className="metric-widget-label">Direct Calling Active</div>
            </div>
          </div>
        </section>
      )}

      {/* Edit Profile Form */}
      <section className="reviews-section-card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={20} />
          <span>Professional Profile Information</span>
        </h3>

        <form onSubmit={handleSaveProfile}>
          {/* Categories Multi-Select */}
          <div className="kb-form-field">
            <label className="kb-label">
              Service Categories & Trades * (Select all that apply)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.65rem', marginTop: '0.35rem' }}>
              {categories.map((cat) => (
                <label
                  key={cat.categoryId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 0.85rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    backgroundColor: formData.categoryIds.includes(cat.categoryId) ? 'var(--primary-light)' : '#ffffff',
                    borderColor: formData.categoryIds.includes(cat.categoryId) ? 'var(--primary-border)' : 'var(--border)'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.categoryIds.includes(cat.categoryId)}
                    onChange={() => handleCategoryToggle(cat.categoryId)}
                  />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {cat.categoryName}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Dropdowns */}
          <div className="form-grid-2">
            <Select
              label="Operating District"
              required
              value={formData.districtId}
              onChange={handleDistrictChange}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.districtId} value={d.districtId}>
                  {d.districtName}
                </option>
              ))}
            </Select>

            <Select
              label="Operating Upazila / Sub-District"
              required
              value={formData.upazilaId}
              onChange={(e) => setFormData({ ...formData, upazilaId: e.target.value })}
              disabled={!formData.districtId}
            >
              <option value="">Select Upazila</option>
              {availableUpazilas.map((u) => (
                <option key={u.upazilaId} value={u.upazilaId}>
                  {u.upazilaName}
                </option>
              ))}
            </Select>
          </div>

          {/* Experience & Hourly Rate */}
          <div className="form-grid-2">
            <Input
              label="Years of Practical Experience"
              type="number"
              min="0"
              max="50"
              required
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />

            <Input
              label="Expected Hourly Rate (৳ / hour - optional)"
              type="number"
              min="0"
              placeholder="e.g. 350"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
              helperText="Leave empty if rates are negotiable per project"
            />
          </div>

          <Textarea
            label="Professional Biography & Expertise"
            rows={4}
            placeholder="Describe your specializations, tools, past projects, residential/commercial experience..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={1000}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={Save}
              loading={saving}
            >
              {verificationStatus ? 'Save Profile Updates' : 'Submit for Verification'}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default WorkerProfilePage;
