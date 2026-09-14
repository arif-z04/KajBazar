import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { submitRecommendationApi, getMyRecommendationsApi, getCategoriesApi, getDistrictsApi } from '../services/api';

export const RecommendWorkerPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

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
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

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
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!isAuthenticated) {
      setErrorMsg("Please login to submit a community worker recommendation (BR-09).");
      setSubmitting(false);
      return;
    }

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
      setSuccessMsg(res.data.message || "Thank you! Your recommendation has been submitted for admin review.");

      // Reset form
      setFormData({
        workerName: '',
        phoneNumber: '',
        categoryId: '',
        districtId: '',
        upazilaId: '',
        notes: ''
      });

      // Refresh my recommendations list
      const myRecs = await getMyRecommendationsApi();
      setMyRecommendations(myRecs.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit recommendation. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recommend-page-container">
      <div className="recommend-header">
        <h2>🤝 Recommend an Offline Skilled Worker (BR-09)</h2>
        <p>
          Do you know a trustworthy electrician, plumber, or mechanic in your neighborhood who lacks an internet profile?
          Help expand local employment opportunities by submitting their information for platform verification.
        </p>
      </div>

      <div className="recommend-layout-grid">
        <div className="recommend-form-column">
          <div className="card-form-wrapper">
            <h3>Worker Recommendation Form</h3>

            {!isAuthenticated && (
              <div className="alert-info">
                ℹ️ You need to <a href="/login">login or register</a> before submitting a recommendation.
              </div>
            )}

            {successMsg && <div className="alert-success">{successMsg}</div>}
            {errorMsg && <div className="alert-danger">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="standard-form">
              <div className="form-group">
                <label>Worker Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Jamal Hossain"
                  value={formData.workerName}
                  onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Worker Phone Number * (e.g. 01712345678)</label>
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  pattern="^(?:\+8801|01)[3-9]\d{8}$"
                  title="Enter a valid Bangladeshi phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Primary Service Skill Category *</label>
                <select
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
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>District *</label>
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
                  <label>Upazila / Sub-District *</label>
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

              <div className="form-group">
                <label>Experience Notes & Recommendation Details</label>
                <textarea
                  rows="3"
                  placeholder="Share details about their work quality, reliability, workshop location, or specific skills..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={1000}
                />
              </div>

              <button type="submit" disabled={submitting || !isAuthenticated} className="btn-primary-block">
                {submitting ? 'Submitting Recommendation...' : 'Submit Offline Worker Referral'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: User's previously submitted recommendations */}
        <div className="recommend-history-column">
          <div className="history-card">
            <h3>My Submitted Recommendations</h3>
            {!isAuthenticated ? (
              <p className="history-empty">Login to track your offline worker referrals.</p>
            ) : myRecommendations.length === 0 ? (
              <p className="history-empty">You haven't recommended any workers yet. Use the form on the left to submit your first referral!</p>
            ) : (
              <div className="history-list">
                {myRecommendations.map((r) => (
                  <div key={r.recommendationId} className="history-item">
                    <div className="history-top">
                      <strong>{r.workerName}</strong>
                      <span className={`status-badge-small ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="history-meta">
                      {r.categoryName} • 📍 {r.upazilaName}, {r.districtName}
                    </p>
                    <p className="history-phone">📞 {r.phoneNumber}</p>
                    {r.notes && <p className="history-notes">"{r.notes}"</p>}
                    <span className="history-date">
                      Submitted: {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
