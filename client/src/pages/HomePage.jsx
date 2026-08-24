import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage = () => (
  <div className="home-container">
    <section className="hero-section">
      <h1>KajBazar</h1>
      <h2>Connecting Consumers Directly with Local Skilled Workers</h2>
      <p>Electricians, Plumbers, Mechanics, Carpenters, Painters and more — Verified & Direct Contact.</p>
      <div className="hero-buttons">
        <Link to="/directory" className="btn-primary">Find a Service Provider</Link>
        <Link to="/recommend" className="btn-secondary">Recommend Offline Worker</Link>
      </div>
    </section>

    <section className="features-section">
      <div className="feature-card">
        <h3>🔍 Search & Location Filtering</h3>
        <p>Easily search verified workers by service category, district, and upazila.</p>
      </div>
      <div className="feature-card">
        <h3>📞 Direct Contact</h3>
        <p>Communicate directly with local service providers without intermediaries or platform commission fees.</p>
      </div>
      <div className="feature-card">
        <h3>🤝 Community Driven</h3>
        <p>Recommend offline skilled workers in your community to increase their employment opportunities.</p>
      </div>
    </section>
  </div>
);
