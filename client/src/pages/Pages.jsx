import React from 'react';

export const HomePage = () => (
  <div className="home-page">
    <h1>Welcome to KajBazar</h1>
    <p>Find trusted, local skilled workers near you directly.</p>
  </div>
);

export const WorkerDirectoryPage = () => (
  <div className="directory-page">
    <h2>Verified Service Provider Directory</h2>
    {/* Filter controls by Category, District, Upazila, Rating */}
    <div className="search-filters">
      <p>Search & Filtering Controls Skeleton</p>
    </div>
    <div className="worker-grid">
      <p>Worker Profiles List Skeleton</p>
    </div>
  </div>
);

export const RecommendWorkerPage = () => (
  <div className="recommend-page">
    <h2>Recommend an Offline Skilled Worker</h2>
    <p>Help expand the local worker directory by submitting skilled offline workers.</p>
  </div>
);

export const AdminDashboardPage = () => (
  <div className="admin-dashboard">
    <h2>Admin Dashboard</h2>
    <p>Worker Verifications & Moderation Dashboard Skeleton</p>
  </div>
);
