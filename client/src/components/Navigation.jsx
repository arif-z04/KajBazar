import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  Wrench,
  Search,
  UserPlus,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Button } from './common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isServiceProvider, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="header-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        {/* Brand Logo */}
        <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
          <div className="brand-icon-wrap">
            <Wrench size={20} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Kaj<span>Bazar</span></span>
            <span className="brand-tagline">Service Directory</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="navbar-links-desktop">
          <li>
            <NavLink to="/directory" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Search size={16} />
              <span>Find Workers</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/recommend" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <UserPlus size={16} />
              <span>Recommend Worker</span>
            </NavLink>
          </li>

          {isServiceProvider && (
            <li>
              <NavLink to="/my-profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Briefcase size={16} />
                <span>My Worker Dashboard</span>
                <span className="nav-badge-pill nav-badge-worker">Provider</span>
              </NavLink>
            </li>
          )}

          {isAdmin && (
            <li>
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <ShieldCheck size={16} />
                <span>Admin Dashboard</span>
                <span className="nav-badge-pill nav-badge-admin">Admin</span>
              </NavLink>
            </li>
          )}

          {isAuthenticated ? (
            <li className="user-menu-wrap">
              <div className="user-profile-badge">
                <span className="user-avatar">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </span>
                <div className="user-info">
                  <span className="user-name">{user?.fullName || 'User'}</span>
                  <span className="user-role-label">{user?.role || 'Member'}</span>
                </div>
              </div>
              <button
                type="button"
                className="btn-nav-logout"
                onClick={handleLogout}
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </li>
          ) : (
            <li className="user-menu-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            </li>
          )}
        </ul>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <>
          <div className="mobile-nav-backdrop" onClick={closeMobileMenu} />
          <aside className="mobile-nav-drawer" aria-label="Mobile Navigation">
            <div className="mobile-drawer-header">
              <Link to="/" className="brand-logo" onClick={closeMobileMenu}>
                <div className="brand-icon-wrap">
                  <Wrench size={18} />
                </div>
                <div className="brand-text">
                  <span className="brand-title">Kaj<span>Bazar</span></span>
                </div>
              </Link>
              <button
                type="button"
                className="toast-close-btn"
                onClick={closeMobileMenu}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="mobile-drawer-links">
              <li>
                <NavLink
                  to="/directory"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <Search size={18} />
                  <span>Find Skilled Workers</span>
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/recommend"
                  className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                  onClick={closeMobileMenu}
                >
                  <UserPlus size={18} />
                  <span>Recommend Offline Worker</span>
                </NavLink>
              </li>

              {isServiceProvider && (
                <li>
                  <NavLink
                    to="/my-profile"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <Briefcase size={18} />
                    <span>My Worker Dashboard</span>
                  </NavLink>
                </li>
              )}

              {isAdmin && (
                <li>
                  <NavLink
                    to="/admin"
                    className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
                    onClick={closeMobileMenu}
                  >
                    <ShieldCheck size={18} />
                    <span>Admin Moderation</span>
                  </NavLink>
                </li>
              )}
            </ul>

            <div className="mobile-drawer-footer">
              {isAuthenticated ? (
                <>
                  <div className="user-profile-badge" style={{ width: '100%', justifyContent: 'flex-start' }}>
                    <span className="user-avatar">
                      {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </span>
                    <div className="user-info">
                      <span className="user-name">{user?.fullName}</span>
                      <span className="user-role-label">{user?.role}</span>
                    </div>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={LogOut}
                    onClick={handleLogout}
                    style={{ width: '100%' }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => { closeMobileMenu(); navigate('/login'); }}
                    style={{ width: '100%' }}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => { closeMobileMenu(); navigate('/register'); }}
                    style={{ width: '100%' }}
                  >
                    Create Account
                  </Button>
                </>
              )}
            </div>
          </aside>
        </>
      )}
    </header>
  );
};

export const Footer = () => (
  <footer className="footer-new">
    <div className="footer-top">
      <div className="footer-brand-col">
        <Link to="/" className="brand-logo">
          <div className="brand-icon-wrap">
            <Wrench size={18} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Kaj<span>Bazar</span></span>
            <span className="brand-tagline">Service Directory</span>
          </div>
        </Link>
        <p className="footer-desc">
          Empowering communities and local skilled tradespeople across Bangladesh.
          Direct phone contact, admin-verified profiles, zero middleman commissions.
        </p>
      </div>

      <div className="footer-col">
        <h4>Explore Directory</h4>
        <ul className="footer-links-list">
          <li><Link to="/directory">All Verified Workers</Link></li>
          <li><Link to="/directory?category=Electrician">Electricians</Link></li>
          <li><Link to="/directory?category=Plumber">Plumbers</Link></li>
          <li><Link to="/directory?category=Carpenter">Carpenters</Link></li>
          <li><Link to="/directory?category=Mechanic">Mechanics</Link></li>
          <li><Link to="/directory?category=Painter">Painters</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Community</h4>
        <ul className="footer-links-list">
          <li><Link to="/recommend">Recommend Offline Worker</Link></li>
          <li><Link to="/register">Join as Service Provider</Link></li>
          <li><Link to="/login">Sign In to Dashboard</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Trust & Verification</h4>
        <ul className="footer-links-list">
          <li><span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>✓ 100% Free Direct Calling</span></li>
          <li><span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>✓ Admin Identity Vetting</span></li>
          <li><span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>✓ Community Star Reviews</span></li>
          <li><span style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>✓ Bangladesh Upazila Reach</span></li>
        </ul>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} KajBazar Platform. Direct Community Service Provider Directory.</p>
    </div>
  </footer>
);

export default Navbar;
