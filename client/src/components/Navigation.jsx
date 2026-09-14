import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isServiceProvider, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">🛠️</span>
            <div className="logo-text">
              <span className="brand-title">KajBazar</span>
              <span className="brand-tagline">Service Directory</span>
            </div>
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <Link to="/directory" className="nav-link">
              🔍 Find Workers
            </Link>
          </li>
          <li>
            <Link to="/recommend" className="nav-link">
              ✍️ Recommend Worker
            </Link>
          </li>

          {isServiceProvider && (
            <li>
              <Link to="/my-profile" className="nav-link highlight">
                👷 Worker Profile
              </Link>
            </li>
          )}

          {isAdmin && (
            <li>
              <Link to="/admin" className="nav-link admin-pill">
                🛡️ Admin Dashboard
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <li className="user-menu">
              <div className="user-badge">
                <span className="user-avatar">{user?.fullName ? user.fullName[0].toUpperCase() : 'U'}</span>
                <div className="user-info">
                  <span className="user-name">{user?.fullName || 'User'}</span>
                  <span className="user-role">{user?.role || 'Member'}</span>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout} title="Sign Out">
                Logout
              </button>
            </li>
          ) : (
            <li className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-col">
        <div className="footer-logo">🛠️ KajBazar</div>
        <p className="footer-desc">
          A Community-Driven Service Provider Directory connecting consumers directly with verified local skilled workers without intermediaries or commission fees.
        </p>
      </div>

      <div className="footer-col">
        <h4>Platform Navigation</h4>
        <ul className="footer-nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/directory">Worker Directory</Link></li>
          <li><Link to="/recommend">Recommend Worker</Link></li>
          <li><Link to="/register">Join as Service Provider</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Academic Project Context</h4>
        <p className="academic-text">
          <strong>Patuakhali Science and Technology University (PSTU)</strong><br />
          Faculty of Computer Science and Engineering<br />
          Course: System Analysis and Design Sessional (CIT-222)<br />
          Session: 2023-2024
        </p>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} KajBazar Platform. All Rights Reserved.</p>
    </div>
  </footer>
);
