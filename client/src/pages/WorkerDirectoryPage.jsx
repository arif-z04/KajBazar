import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { WorkerFilter, WorkerCard, WorkerDetailModal } from '../components/WorkerComponents';
import { searchWorkersApi } from '../services/api';

export const WorkerDirectoryPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || '';

  const [filters, setFilters] = useState({
    category: initialCategory || null,
    districtId: null,
    upazilaId: null,
    minRating: null,
    page: 1,
    pageSize: 9
  });

  const [workers, setWorkers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await searchWorkersApi(filters);
      setWorkers(res.data.workers || []);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch verified worker directory:", err);
      setWorkers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: null,
      districtId: null,
      upazilaId: null,
      minRating: null,
      page: 1,
      pageSize: 9
    });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="directory-page-container">
      <div className="directory-header-banner">
        <h2>Verified Service Provider Directory (BR-03)</h2>
        <p>Browse certified local workers in Bangladesh. Contact professionals directly with no middleman fees.</p>
      </div>

      <WorkerFilter
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
      />

      <div className="directory-results-section">
        <div className="results-summary-bar">
          <span className="results-count">
            Showing <strong>{workers.length}</strong> of <strong>{totalCount}</strong> verified workers
          </span>
          {filters.category && (
            <span className="active-filter-badge">Category: {filters.category}</span>
          )}
        </div>

        {loading ? (
          <div className="directory-loading">
            <div className="spinner"></div>
            <p>Fetching verified worker profiles from directory...</p>
          </div>
        ) : workers.length === 0 ? (
          <div className="directory-empty-card">
            <div className="empty-icon">🔍</div>
            <h3>No Verified Workers Found Matching Your Criteria</h3>
            <p>Try adjusting your category, district, or rating filters to broaden your search.</p>
            <button onClick={handleResetFilters} className="btn-reset-empty">
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="worker-cards-grid">
            {workers.map(w => (
              <WorkerCard
                key={w.profileId}
                worker={w}
                onViewDetails={(profileId) => setSelectedProfileId(profileId)}
              />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="pagination-bar">
            <button
              onClick={() => handlePageChange(filters.page - 1)}
              disabled={filters.page <= 1}
              className="btn-page"
            >
              ← Previous
            </button>
            <span className="page-indicator">
              Page {filters.page} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(filters.page + 1)}
              disabled={filters.page >= totalPages}
              className="btn-page"
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Worker Detail & Review Modal */}
      {selectedProfileId && (
        <WorkerDetailModal
          profileId={selectedProfileId}
          onClose={() => setSelectedProfileId(null)}
          onReviewSubmitted={fetchWorkers}
        />
      )}
    </div>
  );
};
