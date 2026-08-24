import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">🛠️ KajBazar</Link>
      </div>
      <ul className="navbar-links">
        <li><Link to="/directory">Find Workers</Link></li>
        <li><Link to="/recommend">Recommend Worker</Link></li>
        {user?.role === 'Admin' && <li><Link to="/admin">Admin Dashboard</Link></li>}
        {isAuthenticated ? (
          <>
            <li className="user-greeting">Hi, {user?.name || 'User'}</li>
            <li><button className="btn-logout" onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register" className="btn-register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export const Footer = () => (
  <footer className="footer">
    <p>&copy; 2026 KajBazar - Community-Driven Service Provider Directory Platform. Patuakhali Science and Technology University.</p>
  </footer>
);
