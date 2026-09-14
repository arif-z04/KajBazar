import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategoriesApi, searchWorkersApi } from '../services/api';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [quickQuery, setQuickQuery] = useState('');
  const [workerCount, setWorkerCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, workerRes] = await Promise.all([
          getCategoriesApi(),
          searchWorkersApi({ pageSize: 1 })
        ]);
        setCategories(catRes.data || []);
        setWorkerCount(workerRes.data?.totalCount || 0);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      }
    };
    loadHomeData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/directory?category=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/directory');
    }
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-inner">
          <span className="hero-pill">🇧🇩 Bangladesh Community Service Directory</span>
          <h1 className="hero-headline">
            Find Trusted Local Skilled Workers in Your Neighborhood
          </h1>
          <p className="hero-subtext">
            Connecting consumers directly with verified electricians, plumbers, carpenters, mechanics, and painters. Direct contact, no commission, zero intermediaries.
          </p>

          <form onSubmit={handleQuickSearch} className="hero-search-bar">
            <input
              type="text"
              placeholder="What service do you need? (e.g. Electrician, Plumber...)"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="hero-input"
            />
            <button type="submit" className="hero-btn-search">
              🔍 Search Workers
            </button>
          </form>

          <div className="hero-cta-buttons">
            <Link to="/directory" className="btn-hero-primary">
              Explore Worker Directory
            </Link>
            <Link to="/recommend" className="btn-hero-secondary">
              Recommend Offline Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Service Categories */}
      <section className="categories-preview-section">
        <div className="section-heading">
          <h2>Browse by Popular Services</h2>
          <p>Find qualified tradespeople specialized in residential and commercial services</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.categoryId}
              to={`/directory?category=${encodeURIComponent(cat.categoryName)}`}
              className="category-card-item"
            >
              <div className="category-icon-wrap">
                {cat.categoryName === 'Electrician' && '⚡'}
                {cat.categoryName === 'Plumber' && '🔧'}
                {cat.categoryName === 'Carpenter' && '🪚'}
                {cat.categoryName === 'Mechanic' && '⚙️'}
                {cat.categoryName === 'Painter' && '🎨'}
                {cat.categoryName === 'Mason' && '🧱'}
                {!['Electrician', 'Plumber', 'Carpenter', 'Mechanic', 'Painter', 'Mason'].includes(cat.categoryName) && '🛠️'}
              </div>
              <h4 className="category-title">{cat.categoryName}</h4>
              <p className="category-desc">{cat.description || 'Reliable local professionals.'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="platform-highlights">
        <div className="section-heading">
          <h2>Why Choose KajBazar?</h2>
          <p>Built to empower local tradespeople and provide transparent services to communities</p>
        </div>

        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-icon">📞</div>
            <h3>Direct Contact (BR-06)</h3>
            <p>
              Connect directly via phone with local workers. No hidden intermediary commissions, booking fees, or communication delays.
            </p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">🛡️</div>
            <h3>Admin-Verified Profiles (BR-03)</h3>
            <p>
              Every service provider undergoes profile verification by platform administrators before appearing in public searches.
            </p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">🤝</div>
            <h3>Community Recommendations (BR-09)</h3>
            <p>
              Recommend skilled offline workers who lack digital access. Help expand employment opportunities across Bangladesh upazilas.
            </p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">⭐</div>
            <h3>Genuine Reviews & Ratings</h3>
            <p>
              Transparent feedback from community members helps you compare experience, hourly rates, and service reliability.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Guide */}
      <section className="how-it-works-section">
        <div className="section-heading">
          <h2>How KajBazar Works</h2>
          <p>Simple, three-step process to get your home or commercial repairs done</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Search & Filter</h4>
            <p>Select your service category and specify your district and upazila to find nearby verified tradespeople.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Direct Call & Discuss</h4>
            <p>Reveal the worker's direct phone number, negotiate requirements and hourly rates directly without middlemen.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Rate & Review</h4>
            <p>After the service is completed, leave a review and star rating to guide other community members.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-banner">
        <h2>Are You a Skilled Service Provider?</h2>
        <p>Join KajBazar today to create your verified professional profile and receive direct calls from customers in your area.</p>
        <Link to="/register" className="btn-cta-register">
          Register as Service Provider
        </Link>
      </section>
    </div>
  );
};
