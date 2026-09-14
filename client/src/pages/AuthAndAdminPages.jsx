import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getAdminStatsApi,
  getPendingWorkersApi,
  verifyWorkerApi,
  rejectWorkerApi,
  getPendingRecommendationsApi,
  approveRecommendationApi,
  rejectRecommendationApi,
  getAuditLogsApi,
  createCategoryApi
} from '../services/api';

// ==============================================================================
// 1. LOGIN PAGE
// ==============================================================================
export const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'ServiceProvider') {
        navigate('/my-profile');
      } else {
        navigate('/directory');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign In to KajBazar</h2>
          <p>Access your consumer or service provider account</p>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. admin@kajbazar.com or user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Don't have an account yet? <Link to="/register">Create one now</Link>
          </p>
          <div className="demo-credentials-box">
            <small><strong>Demo Accounts (Password: Password123#):</strong></small>
            <br />
            <small>• Admin: <code>admin@kajbazar.com</code></small><br />
            <small>• Consumer: <code>leon@gmail.com</code></small><br />
            <small>• Worker: <code>karim@gmail.com</code></small>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// 2. REGISTER PAGE
// ==============================================================================
export const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'Consumer'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const user = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: formData.role
      });

      if (user.role === 'ServiceProvider') {
        navigate('/my-profile');
      } else {
        navigate('/directory');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create a KajBazar Account</h2>
          <p>Join our community directory as a consumer or skilled service provider</p>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group">
            <label>I want to join as: *</label>
            <div className="role-selector-grid">
              <label className={`role-card ${formData.role === 'Consumer' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="Consumer"
                  checked={formData.role === 'Consumer'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <span className="role-icon">👤</span>
                <strong>Consumer</strong>
                <small>Find & hire local workers</small>
              </label>

              <label className={`role-card ${formData.role === 'ServiceProvider' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="ServiceProvider"
                  checked={formData.role === 'ServiceProvider'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <span className="role-icon">👷</span>
                <strong>Service Provider</strong>
                <small>Offer skilled services</small>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Md. Tanvir Ishrak"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone Number * (e.g. 01712345678)</label>
              <input
                type="tel"
                required
                placeholder="01xxxxxxxxx"
                pattern="^(?:\+8801|01)[3-9]\d{8}$"
                title="Please enter a valid Bangladeshi phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Password (min 6 characters) *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Create secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// 3. ADMIN DASHBOARD & MODERATION PAGE (BR-03, BR-10, BR-11, BR-14)
// ==============================================================================
export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [pendingRecommendations, setPendingRecommendations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, workersRes, recsRes, logsRes] = await Promise.all([
        getAdminStatsApi(),
        getPendingWorkersApi(),
        getPendingRecommendationsApi(),
        getAuditLogsApi(25)
      ]);
      setStats(statsRes.data);
      setPendingWorkers(workersRes.data || []);
      setPendingRecommendations(recsRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyWorker = async (profileId) => {
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await verifyWorkerApi(profileId);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to verify worker.");
    }
  };

  const handleRejectWorker = async (profileId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await rejectWorkerApi(profileId, reason);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject worker.");
    }
  };

  const handleApproveRecommendation = async (id) => {
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await approveRecommendationApi(id);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve recommendation.");
    }
  };

  const handleRejectRecommendation = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await rejectRecommendationApi(id, reason);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject recommendation.");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await createCategoryApi({
        categoryName: newCatName.trim(),
        description: newCatDesc.trim() || null
      });
      setActionMsg(res.data.message);
      setNewCatName('');
      setNewCatDesc('');
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create category.");
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-bar">
        <div>
          <h2>🛡️ Platform Administrator Dashboard</h2>
          <p>Oversee worker profile verification (BR-03), offline referrals (BR-09), service categories (BR-11), and audit logs (BR-14).</p>
        </div>
        <button onClick={loadAdminData} className="btn-refresh-data">
          🔄 Refresh System Data
        </button>
      </div>

      {actionMsg && <div className="alert-success">{actionMsg}</div>}
      {actionError && <div className="alert-danger">{actionError}</div>}

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          📊 System Metrics
        </button>
        <button
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          👷 Pending Worker Verifications ({pendingWorkers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          🤝 Community Referrals ({pendingRecommendations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Manage Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📜 Audit Trail Logs
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading administrative platform data...</div>
      ) : (
        <div className="tab-content-panel">
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && stats && (
            <div className="metrics-dashboard">
              <div className="metric-stat-card">
                <span className="metric-icon">👥</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.totalRegisteredUsers}</span>
                  <span className="metric-title">Registered Accounts</span>
                </div>
              </div>

              <div className="metric-stat-card">
                <span className="metric-icon">👷</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.totalWorkerProfiles}</span>
                  <span className="metric-title">Total Worker Profiles</span>
                </div>
              </div>

              <div className="metric-stat-card success">
                <span className="metric-icon">✓</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.verifiedWorkersCount}</span>
                  <span className="metric-title">Verified & Public (BR-03)</span>
                </div>
              </div>

              <div className="metric-stat-card warning">
                <span className="metric-icon">⏳</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.pendingVerificationCount}</span>
                  <span className="metric-title">Pending Worker Approvals</span>
                </div>
              </div>

              <div className="metric-stat-card info">
                <span className="metric-icon">🤝</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.pendingRecommendationCount}</span>
                  <span className="metric-title">Pending Offline Referrals</span>
                </div>
              </div>

              <div className="metric-stat-card">
                <span className="metric-icon">⭐</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.totalReviewsSubmitted}</span>
                  <span className="metric-title">Reviews Submitted</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING WORKERS */}
          {activeTab === 'workers' && (
            <div className="admin-table-wrapper">
              <h3>Pending Worker Profile Verifications (BR-03, BR-10)</h3>
              {pendingWorkers.length === 0 ? (
                <p className="table-empty-msg">No pending worker profile verifications at this time.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Contact Info</th>
                      <th>Location</th>
                      <th>Categories</th>
                      <th>Experience</th>
                      <th>Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWorkers.map((w) => (
                      <tr key={w.profileId}>
                        <td><strong>{w.workerName}</strong></td>
                        <td>
                          <div>{w.phoneNumber}</div>
                          <small>{w.email}</small>
                        </td>
                        <td>{w.upazilaName}, {w.districtName}</td>
                        <td>
                          {w.categories?.map((c, i) => (
                            <span key={i} className="table-tag">{c}</span>
                          ))}
                        </td>
                        <td>{w.experienceYears} Years</td>
                        <td>{w.hourlyRate ? `৳${w.hourlyRate}/hr` : 'Negotiable'}</td>
                        <td>
                          <button
                            onClick={() => handleVerifyWorker(w.profileId)}
                            className="btn-action-approve"
                            title="Approve profile for public directory listing"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectWorker(w.profileId)}
                            className="btn-action-reject"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="admin-table-wrapper">
              <h3>Pending Community Offline Worker Referrals (BR-09)</h3>
              {pendingRecommendations.length === 0 ? (
                <p className="table-empty-msg">No pending offline worker referrals.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Referred By</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRecommendations.map((r) => (
                      <tr key={r.recommendationId}>
                        <td><strong>{r.workerName}</strong></td>
                        <td>{r.phoneNumber}</td>
                        <td><span className="table-tag">{r.categoryName}</span></td>
                        <td>{r.upazilaName}, {r.districtName}</td>
                        <td>{r.recommenderName}</td>
                        <td><small>{r.notes || 'No notes'}</small></td>
                        <td>
                          <button
                            onClick={() => handleApproveRecommendation(r.recommendationId)}
                            className="btn-action-approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRecommendation(r.recommendationId)}
                            className="btn-action-reject"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: MANAGE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-category-management">
              <h3>Add New Service Category (BR-11)</h3>
              <form onSubmit={handleCreateCategory} className="standard-form">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Appliance Repair, Welder, Blacksmith..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Category Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of skills and repair services encompassed..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">Create Service Category</button>
              </form>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="admin-table-wrapper">
              <h3>Administrative Action Audit Trail (BR-14)</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.logId}>
                      <td><small>{new Date(log.timestamp).toLocaleString()}</small></td>
                      <td><code>{log.action}</code></td>
                      <td>{log.entityName}</td>
                      <td>{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
