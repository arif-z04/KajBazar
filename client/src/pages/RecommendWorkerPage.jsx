import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  submitRecommendationApi,
  getMyRecommendationsApi,
  getCategoriesApi,
  getDistrictsApi
} from '../services/api';
import {
  Button,
  Badge,
  Input,
  Select,
  Textarea
} from '../components/common';
import {
  UserPlus,
  Send,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  HelpCircle,
  ShieldCheck,
  History,
  AlertCircle
} from 'lucide-react';

export const RecommendWorkerPage = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);
  const [myRecommendations, setMyRecommendations] = useState([]);

  const [formData, setFormData] = useState({
    workerName: '',
    phoneNumber: '',
    categoryId: '',
    districtId: '',
    upazilaId: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);

        if (isAuthenticated) {
          const myRecs = await getMyRecommendationsApi();
          setMyRecommendations(myRecs.data || []);
        }
      } catch (err) {
        console.error("Failed to load recommendation metadata:", err);
      }
    };
    loadMetadata();
  }, [isAuthenticated]);

  const handleDistrictChange = (e) => {
    const dId = parseInt(e.target.value, 10);
    setFormData(prev => ({ ...prev, districtId: dId, upazilaId: '' }));
    const selected = districts.find(d => d.districtId === dId);
    setAvailableUpazilas(selected?.upazilas || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.warning("Please sign in to submit a worker recommendation.");
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        workerName: formData.workerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        categoryId: parseInt(formData.categoryId, 10),
        districtId: parseInt(formData.districtId, 10),
        upazilaId: parseInt(formData.upazilaId, 10),
        notes: formData.notes.trim() || null
      };

      const res = await submitRecommendationApi(payload);
      toast.success(res.data.message || "Thank you! Your recommendation has been submitted for admin review.");

      // Reset form
      setFormData({
        workerName: '',
        phoneNumber: '',
        categoryId: '',
        districtId: '',
        upazilaId: '',
        notes: ''
      });

      // Refresh my recommendations
      const myRecs = await getMyRecommendationsApi();
      setMyRecommendations(myRecs.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit recommendation. Please verify all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Banner */}
      <div className="directory-header-banner">
        <h1>Recommend an Offline Skilled Worker</h1>
        <p>
          Do you know a trustworthy electrician, plumber, or mechanic in your neighborhood who lacks an online profile?
          Help bridge the digital divide by submitting their details for platform verification.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '2rem' }}>
        {/* Referral Form */}
        <div className="reviews-section-card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={20} />
            <span>Worker Referral Form</span>
          </h3>

          {!isAuthenticated && (
            <div style={{ padding: '0.85rem 1rem', background: 'var(--info-light)', border: '1px solid var(--info-border)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--info)' }}>
              <AlertCircle size={18} />
              <span>You must <Link to="/login" style={{ fontWeight: 700 }}>sign in</Link> before submitting a worker referral.</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <Input
              label="Worker Full Name"
              required
              placeholder="e.g. Master Jamal Hossain"
              value={formData.workerName}
              onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
            />

            <Input
              label="Worker Phone Number"
              type="tel"
              required
              placeholder="01xxxxxxxxx"
              pattern="^(?:\+8801|01)[3-9]\d{8}$"
              helperText="Enter a valid 11-digit Bangladeshi mobile number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />

            <Select
              label="Primary Trade Category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.categoryName}
                </option>
              ))}
            </Select>

            <div className="form-grid-2">
              <Select
                label="District"
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
                label="Upazila / Sub-District"
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

            <Textarea
              label="Experience Notes & Workshop Details"
              rows={3}
              placeholder="Describe their reliability, workshop location, notable skills, or pricing reputation..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              maxLength={1000}
            />

            <div style={{ marginTop: '1.25rem' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Send}
                loading={submitting}
                disabled={!isAuthenticated}
                style={{ width: '100%' }}
              >
                Submit Worker Referral
              </Button>
            </div>
          </form>
        </div>

        {/* History Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="reviews-section-card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <History size={18} />
              <span>My Submitted Referrals</span>
            </h3>

            {!isAuthenticated ? (
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>
                Sign in to view your past offline worker recommendations.
              </p>
            ) : myRecommendations.length === 0 ? (
              <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                You have not submitted any worker referrals yet. Fill out the form on the left to submit your first referral!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {myRecommendations.map((r) => (
                  <div
                    key={r.recommendationId}
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'var(--slate-50)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--slate-900)' }}>{r.workerName}</strong>
                      <Badge
                        variant={
                          r.status === 'APPROVED' ? 'verified' :
                          r.status === 'REJECTED' ? 'rejected' : 'pending'
                        }
                        size="sm"
                      >
                        {r.status}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--slate-600)', marginBottom: '4px' }}>
                      {r.categoryName} • 📍 {r.upazilaName}, {r.districtName}
                    </div>

                    <div style={{ fontSize: '0.825rem', color: 'var(--slate-700)', fontWeight: 600 }}>
                      📞 {r.phoneNumber}
                    </div>

                    {r.notes && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontStyle: 'italic', marginTop: '4px' }}>
                        "{r.notes}"
                      </p>
                    )}

                    <div style={{ fontSize: '0.725rem', color: 'var(--slate-400)', marginTop: '6px' }}>
                      Submitted on {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="reviews-section-card" style={{ background: 'var(--slate-50)' }}>
            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Admin Verification Process</span>
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: '1.5' }}>
              Our team verifies referral contact information directly before adding workers to the public directory. Once approved, the worker receives direct service inquiries from local customers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendWorkerPage;
