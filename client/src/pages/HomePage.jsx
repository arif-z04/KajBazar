import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategoriesApi, searchWorkersApi } from '../services/api';
import { WorkerCard, WorkerDetailModal } from '../components/WorkerComponents';
import {
  Button,
  Card,
  Skeleton,
  WorkerCardSkeleton
} from '../components/common';
import {
  Search,
  Zap,
  Wrench,
  Hammer,
  Cog,
  Paintbrush,
  BrickWall,
  Sparkles,
  PhoneCall,
  ShieldCheck,
  Users,
  Star,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';

const getCategoryIcon = (categoryName) => {
  const lower = (categoryName || '').toLowerCase();
  if (lower.includes('electric')) return <Zap size={24} />;
  if (lower.includes('plumb')) return <Wrench size={24} />;
  if (lower.includes('carpent')) return <Hammer size={24} />;
  if (lower.includes('mechanic')) return <Cog size={24} />;
  if (lower.includes('paint')) return <Paintbrush size={24} />;
  if (lower.includes('mason')) return <BrickWall size={24} />;
  return <Sparkles size={24} />;
};

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredWorkers, setFeaturedWorkers] = useState([]);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quickQuery, setQuickQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const [catRes, workerRes] = await Promise.all([
          getCategoriesApi(),
          searchWorkersApi({ pageSize: 6 })
        ]);
        setCategories(catRes.data || []);
        setFeaturedWorkers(workerRes.data?.workers || []);
        setTotalWorkers(workerRes.data?.totalCount || 0);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickQuery.trim()) params.set('q', quickQuery.trim());
    if (selectedCategory) params.set('category', selectedCategory);

    const queryStr = params.toString();
    navigate(queryStr ? `/directory?${queryStr}` : '/directory');
  };

  return (
    <div className="home-page-container">
      {/* 1. Hero Section */}
      <section className="hero-banner-new">
        <div className="hero-content">
          <div className="hero-pill">
            <ShieldCheck size={16} />
            <span>Direct Service Directory for Bangladesh</span>
          </div>

          <h1 className="hero-headline">
            Find Trusted Local <span>Skilled Workers</span> Near You
          </h1>

          <p className="hero-subtext">
            Connect directly with verified electricians, plumbers, mechanics, carpenters, and technicians in your upazila. Free direct phone calling with zero commission fees.
          </p>

          <form onSubmit={handleQuickSearch} className="hero-search-card" role="search">
            <div className="hero-search-input-wrap">
              <Search size={20} className="hero-search-icon" />
              <input
                type="text"
                placeholder="Search tradesperson, skill, or keyword..."
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                aria-label="Search worker keyword"
              />
            </div>

            <select
              className="hero-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by Category"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryName}>
                  {c.categoryName}
                </option>
              ))}
            </select>

            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Search}
              style={{ padding: '0.65rem 1.35rem' }}
            >
              Search
            </Button>
          </form>

          {/* Quick pills */}
          <div className="hero-quick-tags">
            <span>Popular services:</span>
            {categories.slice(0, 5).map((c) => (
              <button
                key={c.categoryId}
                type="button"
                className="hero-quick-pill"
                onClick={() => navigate(`/directory?category=${encodeURIComponent(c.categoryName)}`)}
              >
                {c.categoryName}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Platform Highlights Ribbon */}
      <section className="hero-stats-ribbon" aria-label="Platform Statistics">
        <div className="stat-item">
          <div className="stat-icon-wrap stat-icon-blue">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="stat-number">{loading ? '...' : totalWorkers}</div>
            <div className="stat-label">Verified Providers</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-wrap stat-icon-green">
            <PhoneCall size={22} />
          </div>
          <div>
            <div className="stat-number">100% Free</div>
            <div className="stat-label">Direct Phone Calling</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-wrap stat-icon-amber">
            <Star size={22} />
          </div>
          <div>
            <div className="stat-number">Real Ratings</div>
            <div className="stat-label">Community Reviews</div>
          </div>
        </div>

        <div className="stat-item">
          <div className="stat-icon-wrap stat-icon-indigo">
            <MapPin size={22} />
          </div>
          <div>
            <div className="stat-number">All Districts</div>
            <div className="stat-label">Bangladesh Nationwide</div>
          </div>
        </div>
      </section>

      {/* 3. Browse By Category */}
      <section>
        <div className="section-header">
          <span className="section-tag">Directory Categories</span>
          <h2 className="section-title">Explore by Specialized Trade</h2>
          <p className="section-desc">
            Browse verified professionals by skill trade to find the exact help your home or project needs.
          </p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.categoryId}
              to={`/directory?category=${encodeURIComponent(cat.categoryName)}`}
              className="category-card"
            >
              <div className="category-icon-box">
                {getCategoryIcon(cat.categoryName)}
              </div>
              <div className="category-info">
                <h4>{cat.categoryName}</h4>
                <p>{cat.description || 'Reliable certified local technicians.'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Featured Verified Workers */}
      <section>
        <div className="section-header">
          <span className="section-tag">Featured Professionals</span>
          <h2 className="section-title">Recently Verified Local Workers</h2>
          <p className="section-desc">
            Vetted tradespeople with confirmed identities and active contact availability.
          </p>
        </div>

        {loading ? (
          <div className="worker-cards-grid">
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
            <WorkerCardSkeleton />
          </div>
        ) : featuredWorkers.length === 0 ? (
          <div className="kb-empty-state">
            <Users size={36} />
            <h3 className="kb-empty-title">Directory Populating</h3>
            <p className="kb-empty-description">
              New service provider profiles are currently being verified by administrators.
            </p>
          </div>
        ) : (
          <div className="worker-cards-grid">
            {featuredWorkers.map((worker) => (
              <WorkerCard
                key={worker.profileId}
                worker={worker}
                onViewDetails={(profileId) => setSelectedProfileId(profileId)}
              />
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <Button
            variant="outline"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/directory')}
          >
            Explore Complete Directory
          </Button>
        </div>
      </section>

      {/* 5. How KajBazar Works */}
      <section>
        <div className="section-header">
          <span className="section-tag">Simple Process</span>
          <h2 className="section-title">How KajBazar Works</h2>
          <p className="section-desc">
            Connect directly with skilled workers in your local community in three straightforward steps.
          </p>
        </div>

        <div className="how-it-works-grid">
          <div className="step-box">
            <div className="step-badge">1</div>
            <h4>Search & Filter</h4>
            <p>
              Choose your needed trade category, select your district and upazila to find local certified workers nearest to your home.
            </p>
          </div>

          <div className="step-box">
            <div className="step-badge">2</div>
            <h4>Direct Phone Call</h4>
            <p>
              Click to reveal the worker's direct phone number. Discuss project requirements, schedules, and hourly rates directly without intermediary fees.
            </p>
          </div>

          <div className="step-box">
            <div className="step-badge">3</div>
            <h4>Review & Recommend</h4>
            <p>
              Rate the work quality after completion to help neighbors make informed decisions, or recommend trusted offline tradespeople.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Platform Trust & Quality Pillars */}
      <section>
        <div className="section-header">
          <span className="section-tag">Trust & Safety</span>
          <h2 className="section-title">Why Communities Trust KajBazar</h2>
          <p className="section-desc">
            Designed to bridge the digital divide and support honest local labor across Bangladesh.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrap">
              <PhoneCall size={22} />
            </div>
            <div className="feature-content">
              <h4>Direct Customer-to-Worker Connection</h4>
              <p>
                No commission cuts, no bidding fees, and no locked chat systems. You talk directly with the tradesperson doing your work.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <ShieldCheck size={22} />
            </div>
            <div className="feature-content">
              <h4>Administrative Profile Vetting</h4>
              <p>
                Every service provider's phone and service details are reviewed by platform administrators before publication.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Users size={22} />
            </div>
            <div className="feature-content">
              <h4>Offline Worker Recommendation</h4>
              <p>
                Recommend skilled electricians, masons, and technicians who don't have internet access so they gain community visibility.
              </p>
            </div>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrap">
              <Star size={22} />
            </div>
            <div className="feature-content">
              <h4>Authentic Customer Reviews</h4>
              <p>
                Transparent feedback submitted by real local consumers to maintain high craftsmanship standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA for Providers */}
      <section className="cta-banner-new">
        <div className="cta-text">
          <h2>Are You a Skilled Tradesperson or Technician?</h2>
          <p>
            Create your verified professional profile on KajBazar today. Get direct calls from customers in your upazila with zero platform commission.
          </p>
        </div>
        <div className="cta-actions">
          <Button
            variant="primary"
            size="lg"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => navigate('/register')}
            style={{ backgroundColor: '#2563eb' }}
          >
            Register as Service Provider
          </Button>
        </div>
      </section>

      {/* Worker Detail Modal */}
      {selectedProfileId && (
        <WorkerDetailModal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          onReviewSubmitted={() => {
            // Re-fetch featured workers
            searchWorkersApi({ pageSize: 6 }).then((res) => {
              setFeaturedWorkers(res.data?.workers || []);
            });
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
