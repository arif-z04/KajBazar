import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkerFilter, WorkerCard, WorkerDetailModal } from '../components/WorkerComponents';
import { searchWorkersApi } from '../services/api';
import {
  Button,
  EmptyState,
  WorkerCardSkeleton
} from '../components/common';
import { Search, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';

export const WorkerDirectoryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get('category') || null;
  const districtParam = searchParams.get('districtId') ? parseInt(searchParams.get('districtId'), 10) : null;
  const upazilaParam = searchParams.get('upazilaId') ? parseInt(searchParams.get('upazilaId'), 10) : null;
  const minRatingParam = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')) : null;
  const pageParam = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) : 1;
  const queryParam = searchParams.get('q') || '';

  const [workers, setWorkers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const filters = {
    category: categoryParam,
    districtId: districtParam,
    upazilaId: upazilaParam,
    minRating: minRatingParam,
    page: pageParam,
    pageSize: 9
  };

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await searchWorkersApi(filters);
      let list = res.data.workers || [];

      // If client provided a quick keyword search query 'q', filter by worker name or category or bio
      if (queryParam.trim()) {
        const q = queryParam.toLowerCase().trim();
        list = list.filter(w =>
          (w.workerName && w.workerName.toLowerCase().includes(q)) ||
          (w.bio && w.bio.toLowerCase().includes(q)) ||
          (w.categories && w.categories.some(c => c.toLowerCase().includes(q)))
        );
      }

      setWorkers(list);
      setTotalCount(res.data.totalCount || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch verified worker directory:", err);
      setError("Unable to load workers at this time. Please check your connection and try again.");
      setWorkers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [categoryParam, districtParam, upazilaParam, minRatingParam, pageParam, queryParam]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const updateParam = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === undefined) {
      nextParams.delete(key);
    } else {
      nextParams.set(key, value);
    }
    // Always reset to page 1 on filter change
    if (key !== 'page') {
      nextParams.delete('page');
    }
    setSearchParams(nextParams);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      updateParam('page', newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const hasActiveFilters = Boolean(categoryParam || districtParam || upazilaParam || minRatingParam || queryParam);

  return (
    <div className="directory-layout-wrapper">
      {/* Header Banner */}
      <div className="directory-header-banner">
        <h1>Verified Service Provider Directory</h1>
        <p>Browse certified local technicians and skilled tradespeople across Bangladesh. Direct phone calling with no intermediary fees.</p>
      </div>

      {/* Filter Card Component */}
      <WorkerFilter
        filters={filters}
        onFilterChange={updateParam}
        onReset={handleResetFilters}
      />

      {/* Results Summary & Active Filter Tags */}
      <div className="results-summary-row">
        <span className="results-count-text">
          Showing <strong>{workers.length}</strong> of <strong>{totalCount}</strong> verified service providers
        </span>

        {hasActiveFilters && (
          <div className="active-filters-list">
            {categoryParam && (
              <span className="category-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Category: {categoryParam}
                <button type="button" onClick={() => updateParam('category', null)} aria-label="Remove category filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {minRatingParam && (
              <span className="category-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ⭐ {minRatingParam}+ Stars
                <button type="button" onClick={() => updateParam('minRating', null)} aria-label="Remove rating filter">
                  <X size={12} />
                </button>
              </span>
            )}
            {queryParam && (
              <span className="category-tag-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                Keyword: "{queryParam}"
                <button type="button" onClick={() => updateParam('q', null)} aria-label="Remove query filter">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Main Results Body */}
      {error ? (
        <div className="kb-empty-state">
          <div className="kb-confirm-icon-box kb-confirm-danger">
            <AlertCircle size={28} />
          </div>
          <h3 className="kb-empty-title">Error Loading Directory</h3>
          <p className="kb-empty-description">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchWorkers}>
            Try Again
          </Button>
        </div>
      ) : loading ? (
        <div className="worker-cards-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <WorkerCardSkeleton key={i} />
          ))}
        </div>
      ) : workers.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Verified Workers Found"
          description="We couldn't find any service providers matching your selected criteria. Try broadening your location or category filters."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="worker-cards-grid">
          {workers.map((w) => (
            <WorkerCard
              key={w.profileId}
              worker={w}
              onViewDetails={(profileId) => setSelectedProfileId(profileId)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && !loading && (
        <nav className="pagination-container" aria-label="Pagination">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page <= 1}
            aria-label="Previous Page"
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>

          <span className="pagination-page-info">
            Page {filters.page} of {totalPages}
          </span>

          <button
            type="button"
            className="pagination-btn"
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page >= totalPages}
            aria-label="Next Page"
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </nav>
      )}

      {/* Worker Detail Modal */}
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

export default WorkerDirectoryPage;
