import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyWorkerProfileApi, saveWorkerProfileApi, getCategoriesApi, getDistrictsApi } from '../services/api';

export const WorkerProfilePage = () => {
  const { user, isServiceProvider } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  const [formData, setFormData] = useState({
    districtId: '',
    upazilaId: '',
    bio: '',
    experienceYears: 0,
    hourlyRate: '',
    categoryIds: []
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const loadProfileAndMeta = async () => {
      setLoading(true);
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);

        try {
          const profileRes = await getMyWorkerProfileApi();
          const p = profileRes.data;
          setVerificationStatus(p.verificationStatus);
          setStats({ averageRating: p.averageRating, totalReviews: p.totalReviews });

          const matchingDistrict = distRes.data.find(d => d.districtId === p.districtId);
          setAvailableUpazilas(matchingDistrict?.upazilas || []);

          // Match category names to IDs
          const activeCatIds = catRes.data
            .filter(c => p.categories.includes(c.categoryName))
            .map(c => c.categoryId);

          setFormData({
            districtId: p.districtId,
            upazilaId: p.upazilaId,
            bio: p.bio || '',
            experienceYears: p.experienceYears || 0,
            hourlyRate: p.hourlyRate || '',
            categoryIds: activeCatIds
          });
        } catch {
          // No profile yet, initial setup
          setVerificationStatus(null);
        }
      } catch (err) {
        console.error("Failed to load worker profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndMeta();
  }, []);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (formData.categoryIds.length === 0) {
      setErrorMsg("Please select at least one service category.");
      setSaving(false);
      return;
    }

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
      setSuccessMsg(res.data.message || "Profile updated successfully.");
      setVerificationStatus(res.data.status || 'PENDING');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile. Please verify all inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading worker profile dashboard...</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header-card">
        <div className="profile-user-info">
          <h2>👷 Worker Profile Dashboard</h2>
          <p>Manage your professional details, service categories, and contact availability.</p>
        </div>

        <div className="profile-status-box">
          <span className="status-label">Verification Status (BR-02, BR-03):</span>
          {verificationStatus === 'VERIFIED' && (
            <span className="badge-status verified">✓ VERIFIED (Publicly Visible)</span>
          )}
          {verificationStatus === 'PENDING' && (
            <span className="badge-status pending">⏳ PENDING VERIFICATION</span>
          )}
          {verificationStatus === 'REJECTED' && (
            <span className="badge-status rejected">✕ REJECTED (Contact Admin)</span>
          )}
          {!verificationStatus && (
            <span className="badge-status unconfigured">⚠️ Incomplete Profile</span>
          )}
        </div>
      </div>

      {verificationStatus === 'VERIFIED' && (
        <div className="worker-stats-row">
          <div className="metric-box">
            <h4>Average Rating</h4>
            <p>⭐ {Number(stats.averageRating).toFixed(1)} / 5.0</p>
          </div>
          <div className="metric-box">
            <h4>Total Reviews Received</h4>
            <p>{stats.totalReviews} Reviews</p>
          </div>
          <div className="metric-box highlight">
            <h4>Direct Call Access</h4>
            <p>Active (tel:{user?.phoneNumber})</p>
          </div>
        </div>
      )}

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="profile-form-card">
        <h3>Professional Service Details</h3>

        <div className="form-group">
          <label>Service Categories * (Select all that apply - BR-04)</label>
          <div className="category-checkbox-grid">
            {categories.map((cat) => (
              <label key={cat.categoryId} className="category-checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(cat.categoryId)}
                  onChange={() => handleCategoryToggle(cat.categoryId)}
                />
                <span>{cat.categoryName}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Service District *</label>
            <select
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
            </select>
          </div>

          <div className="form-group">
            <label>Service Upazila / Sub-District *</label>
            <select
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
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Years of Practical Experience *</label>
            <input
              type="number"
              min="0"
              max="50"
              required
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Expected Hourly Rate (৳ / hr - optional)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 350"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Professional Bio / Experience Summary</label>
          <textarea
            rows="4"
            placeholder="Describe your expertise, past projects, specialties (e.g. residential wiring, generator maintenance, pipe repair)..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={1000}
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary-large">
          {saving ? 'Saving Profile...' : 'Save & Submit for Verification (BR-02)'}
        </button>
      </form>
    </div>
  );
};
