import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
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
import {
  Button,
  Badge,
  Input,
  Select,
  Textarea,
  ConfirmDialog,
  TableRowSkeleton,
  EmptyState
} from '../components/common';
import {
  ShieldCheck,
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  PlusCircle,
  FileText,
  User,
  Phone,
  Mail,
  Lock,
  Wrench,
  Sparkles,
  Inbox,
  XCircle,
  Check,
  X
} from 'lucide-react';

// ==============================================================================
// 1. LOGIN PAGE
// ==============================================================================
export const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      toast.success(`Welcome back, ${user.fullName}!`);

      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'ServiceProvider') {
        navigate('/my-profile');
      } else {
        navigate('/directory');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123#');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern">
        <div className="auth-header-box">
          <div className="auth-logo-badge">
            <Wrench size={24} />
          </div>
          <h2>Sign In to KajBazar</h2>
          <p>Access your consumer directory or service provider dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <Input
            label="Email Address"
            type="email"
            required
            icon={Mail}
            placeholder="e.g. leon@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            required
            icon={Lock}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%' }}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
          Don't have an account? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
        </div>

        {/* Demo Accounts Quick-Fill Card */}
        <div className="demo-credentials-card">
          <strong>⚡ Quick Demo Accounts (Click to test):</strong>
          <div className="demo-accounts-grid">
            <button
              type="button"
              className="btn-demo-quick"
              onClick={() => fillDemoAccount('admin@kajbazar.com')}
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              className="btn-demo-quick"
              onClick={() => fillDemoAccount('leon@gmail.com')}
            >
              👤 Consumer
            </button>
            <button
              type="button"
              className="btn-demo-quick"
              onClick={() => fillDemoAccount('karim@gmail.com')}
            >
              👷 Worker
            </button>
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
  const toast = useToast();
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const user = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: formData.role
      });

      toast.success("Account created successfully! Welcome to KajBazar.");

      if (user.role === 'ServiceProvider') {
        navigate('/my-profile');
      } else {
        navigate('/directory');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card-modern auth-card-large">
        <div className="auth-header-box">
          <div className="auth-logo-badge">
            <Wrench size={24} />
          </div>
          <h2>Create Your KajBazar Account</h2>
          <p>Join as a community member or register as a skilled service provider</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Role Selector Cards */}
          <div className="role-selection-grid">
            <label className={`role-radio-card ${formData.role === 'Consumer' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="Consumer"
                checked={formData.role === 'Consumer'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
              <div className="role-icon-circle">
                <User size={20} />
              </div>
              <span className="role-name">Consumer</span>
              <span className="role-desc">Find and hire local skilled workers</span>
            </label>

            <label className={`role-radio-card ${formData.role === 'ServiceProvider' ? 'active' : ''}`}>
              <input
                type="radio"
                name="role"
                value="ServiceProvider"
                checked={formData.role === 'ServiceProvider'}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
              <div className="role-icon-circle">
                <Briefcase size={20} />
              </div>
              <span className="role-name">Service Provider</span>
              <span className="role-desc">Offer services and get customer calls</span>
            </label>
          </div>

          <Input
            label="Full Name"
            required
            placeholder="e.g. Md. Tanvir Ishrak"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />

          <div className="form-grid-2">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <Input
              label="Phone Number"
              type="tel"
              required
              placeholder="01xxxxxxxxx"
              pattern="^(?:\+8801|01)[3-9]\d{8}$"
              helperText="11-digit Bangladeshi number"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            />
          </div>

          <div className="form-grid-2">
            <Input
              label="Password (min 6 characters)"
              type="password"
              required
              placeholder="Create secure password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <Input
              label="Confirm Password"
              type="password"
              required
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              style={{ width: '100%' }}
            >
              Register Account
            </Button>
          </div>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--slate-600)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// 3. ADMIN DASHBOARD & MODERATION
// ==============================================================================
export const AdminDashboardPage = () => {
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('metrics');
  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [pendingRecommendations, setPendingRecommendations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [creatingCategory, setCreatingCategory] = useState(false);

  // Modern Dialog State (replacing prompt)
  const [dialogConfig, setDialogConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    variant: 'danger',
    requireReason: false,
    action: null
  });

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, workersRes, recsRes, logsRes] = await Promise.all([
        getAdminStatsApi(),
        getPendingWorkersApi(),
        getPendingRecommendationsApi(),
        getAuditLogsApi(50)
      ]);
      setStats(statsRes.data);
      setPendingWorkers(workersRes.data || []);
      setPendingRecommendations(recsRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
      toast.error("Failed to load administrative records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const openConfirmDialog = (title, message, variant, requireReason, action) => {
    setDialogConfig({
      isOpen: true,
      title,
      message,
      variant,
      requireReason,
      action
    });
  };

  const closeConfirmDialog = () => {
    setDialogConfig(prev => ({ ...prev, isOpen: false }));
  };

  const handleDialogConfirm = async (reasonOrResult) => {
    if (dialogConfig.action) {
      await dialogConfig.action(reasonOrResult);
    }
    closeConfirmDialog();
  };

  // Actions
  const handleVerifyWorker = (profileId, workerName) => {
    openConfirmDialog(
      "Approve Worker Verification",
      `Are you sure you want to approve ${workerName}? Once approved, this profile will become publicly visible in the worker directory.`,
      "primary",
      false,
      async () => {
        try {
          const res = await verifyWorkerApi(profileId);
          toast.success(res.data.message || "Worker profile verified successfully!");
          loadAdminData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to verify worker.");
        }
      }
    );
  };

  const handleRejectWorker = (profileId, workerName) => {
    openConfirmDialog(
      "Reject Worker Verification",
      `Please provide a reason for rejecting ${workerName}'s verification request:`,
      "danger",
      true,
      async (reason) => {
        try {
          const res = await rejectWorkerApi(profileId, reason);
          toast.info(res.data.message || "Worker profile rejected.");
          loadAdminData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to reject worker.");
        }
      }
    );
  };

  const handleApproveRecommendation = (id, workerName) => {
    openConfirmDialog(
      "Approve Community Referral",
      `Approve the offline worker referral for "${workerName}"?`,
      "primary",
      false,
      async () => {
        try {
          const res = await approveRecommendationApi(id);
          toast.success(res.data.message || "Recommendation approved!");
          loadAdminData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to approve recommendation.");
        }
      }
    );
  };

  const handleRejectRecommendation = (id, workerName) => {
    openConfirmDialog(
      "Reject Community Referral",
      `Please specify why referral for "${workerName}" is being rejected:`,
      "danger",
      true,
      async (reason) => {
        try {
          const res = await rejectRecommendationApi(id, reason);
          toast.info(res.data.message || "Recommendation rejected.");
          loadAdminData();
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to reject recommendation.");
        }
      }
    );
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setCreatingCategory(true);
    try {
      const res = await createCategoryApi({
        categoryName: newCatName.trim(),
        description: newCatDesc.trim() || null
      });
      toast.success(res.data.message || "Service category created successfully!");
      setNewCatName('');
      setNewCatDesc('');
      loadAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <div className="admin-page-container">
      {/* Top Header */}
      <div className="admin-top-bar">
        <div>
          <h1>Platform Administration</h1>
          <p>Oversee worker profile verifications, offline referrals, service taxonomy, and audit logs.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={RotateCcw}
          onClick={loadAdminData}
        >
          Refresh Data
        </Button>
      </div>

      {/* Admin Tabs */}
      <div className="admin-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          className={`admin-tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          <ShieldCheck size={16} />
          <span>Overview</span>
        </button>

        <button
          type="button"
          role="tab"
          className={`admin-tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          <Briefcase size={16} />
          <span>Pending Workers</span>
          {pendingWorkers.length > 0 && (
            <span className="admin-tab-count">{pendingWorkers.length}</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          className={`admin-tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <Users size={16} />
          <span>Offline Referrals</span>
          {pendingRecommendations.length > 0 && (
            <span className="admin-tab-count">{pendingRecommendations.length}</span>
          )}
        </button>

        <button
          type="button"
          role="tab"
          className={`admin-tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <PlusCircle size={16} />
          <span>Categories</span>
        </button>

        <button
          type="button"
          role="tab"
          className={`admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <FileText size={16} />
          <span>Audit Trail</span>
        </button>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem 0' }}>
          <div className="metrics-overview-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="metric-widget">
                <TableRowSkeleton columns={2} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && stats && (
            <div className="metrics-overview-grid">
              <div className="metric-widget">
                <div className="metric-widget-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Users size={24} />
                </div>
                <div>
                  <div className="metric-widget-val">{stats.totalRegisteredUsers}</div>
                  <div className="metric-widget-label">Registered Accounts</div>
                </div>
              </div>

              <div className="metric-widget">
                <div className="metric-widget-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}>
                  <Briefcase size={24} />
                </div>
                <div>
                  <div className="metric-widget-val">{stats.totalWorkerProfiles}</div>
                  <div className="metric-widget-label">Worker Profiles</div>
                </div>
              </div>

              <div className="metric-widget">
                <div className="metric-widget-icon" style={{ background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="metric-widget-val">{stats.verifiedWorkersCount}</div>
                  <div className="metric-widget-label">Verified & Public</div>
                </div>
              </div>

              <div className="metric-widget">
                <div className="metric-widget-icon" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  <Clock size={24} />
                </div>
                <div>
                  <div className="metric-widget-val">{stats.pendingVerificationCount}</div>
                  <div className="metric-widget-label">Pending Verifications</div>
                </div>
              </div>

              <div className="metric-widget">
                <div className="metric-widget-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="metric-widget-val">{stats.pendingRecommendationCount}</div>
                  <div className="metric-widget-label">Pending Referrals</div>
                </div>
              </div>

              <div className="metric-widget">
                <div className="metric-widget-icon" style={{ background: '#fef3c7', color: '#b45309' }}>
                  <FileText size={24} />
                </div>
                <div>
                  <div className="metric-widget-val">{stats.totalReviewsSubmitted}</div>
                  <div className="metric-widget-label">Customer Reviews</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING WORKERS */}
          {activeTab === 'workers' && (
            <div className="table-responsive-wrapper">
              {pendingWorkers.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No Pending Worker Verifications"
                  description="All submitted service provider profiles have been reviewed and processed."
                />
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Contact Details</th>
                      <th>Location</th>
                      <th>Skills</th>
                      <th>Experience</th>
                      <th>Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWorkers.map((w) => (
                      <tr key={w.profileId}>
                        <td>
                          <strong>{w.workerName}</strong>
                        </td>
                        <td>
                          <div>{w.phoneNumber}</div>
                          <small style={{ color: 'var(--slate-400)' }}>{w.email}</small>
                        </td>
                        <td>
                          {w.upazilaName}, {w.districtName}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {w.categories?.map((c, i) => (
                              <span key={i} className="category-tag-pill" style={{ fontSize: '0.725rem' }}>
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>{w.experienceYears} Years</td>
                        <td>{w.hourlyRate ? `৳${w.hourlyRate}/hr` : 'Negotiable'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button
                              variant="success"
                              size="sm"
                              icon={Check}
                              onClick={() => handleVerifyWorker(w.profileId, w.workerName)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={X}
                              onClick={() => handleRejectWorker(w.profileId, w.workerName)}
                            >
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: PENDING RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="table-responsive-wrapper">
              {pendingRecommendations.length === 0 ? (
                <EmptyState
                  icon={Inbox}
                  title="No Pending Referrals"
                  description="All submitted offline worker recommendations have been processed."
                />
              ) : (
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Phone</th>
                      <th>Trade Category</th>
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
                        <td>
                          <Badge variant="role" size="sm">{r.categoryName}</Badge>
                        </td>
                        <td>{r.upazilaName}, {r.districtName}</td>
                        <td>{r.recommenderName}</td>
                        <td>
                          <small style={{ color: 'var(--slate-600)', maxWidth: '200px', display: 'inline-block' }}>
                            {r.notes || '—'}
                          </small>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button
                              variant="success"
                              size="sm"
                              icon={Check}
                              onClick={() => handleApproveRecommendation(r.recommendationId, r.workerName)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={X}
                              onClick={() => handleRejectRecommendation(r.recommendationId, r.workerName)}
                            >
                              Reject
                            </Button>
                          </div>
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
            <div className="reviews-section-card" style={{ maxWidth: '640px' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} />
                <span>Add New Service Category</span>
              </h3>

              <form onSubmit={handleCreateCategory}>
                <Input
                  label="Category Name"
                  required
                  placeholder="e.g. Appliance Repair, Welder, Blacksmith..."
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />

                <Textarea
                  label="Description"
                  rows={3}
                  placeholder="Skills, scope of work, and common services encompassed..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                />

                <div style={{ marginTop: '1.25rem' }}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={creatingCategory}
                  >
                    Create Service Category
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: AUDIT TRAIL LOGS */}
          {activeTab === 'logs' && (
            <div className="table-responsive-wrapper">
              <table className="modern-table">
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
                      <td>
                        <small style={{ color: 'var(--slate-500)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </small>
                      </td>
                      <td>
                        <Badge variant="neutral" size="sm">{log.action}</Badge>
                      </td>
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

      {/* Confirmation Dialog Component */}
      <ConfirmDialog
        isOpen={dialogConfig.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={handleDialogConfirm}
        title={dialogConfig.title}
        message={dialogConfig.message}
        variant={dialogConfig.variant}
        requireReason={dialogConfig.requireReason}
      />
    </div>
  );
};
