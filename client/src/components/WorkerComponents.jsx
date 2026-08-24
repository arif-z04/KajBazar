import React, { useState } from 'react';

export const WorkerCard = ({ worker }) => {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div className="worker-card">
      <div className="worker-header">
        <h3>{worker.worker_name}</h3>
        <span className="rating-badge">⭐ {worker.average_rating || '5.0'} ({worker.total_reviews || 0})</span>
      </div>
      <p className="worker-location">📍 {worker.upazila_name}, {worker.district_name}</p>
      <div className="category-tags">
        <span className="tag">{worker.service_categories || 'Skilled Worker'}</span>
      </div>
      <p className="worker-experience">Experience: {worker.experience_years} Years</p>
      <p className="worker-rate">Rate: ৳{worker.hourly_rate || 'Negotiable'} / hr</p>
      <div className="worker-actions">
        {showPhone ? (
          <a href={`tel:${worker.phone_number}`} className="btn-call">📞 {worker.phone_number}</a>
        ) : (
          <button onClick={() => setShowPhone(true)} className="btn-contact">Contact Worker</button>
        )}
      </div>
    </div>
  );
};

export const WorkerFilter = ({ onFilterChange }) => {
  return (
    <div className="filter-panel">
      <h3>Find Local Skilled Workers</h3>
      <div className="filter-group">
        <input type="text" placeholder="Search by service (e.g. Electrician)..." onChange={(e) => onFilterChange('category', e.target.value)} />
        <select onChange={(e) => onFilterChange('district', e.target.value)}>
          <option value="">All Districts</option>
          <option value="Patuakhali">Patuakhali</option>
          <option value="Dhaka">Dhaka</option>
          <option value="Barishal">Barishal</option>
        </select>
        <select onChange={(e) => onFilterChange('upazila', e.target.value)}>
          <option value="">All Upazilas</option>
          <option value="Dumki">Dumki</option>
          <option value="Mirzaganj">Mirzaganj</option>
          <option value="Sadar">Sadar</option>
        </select>
        <select onChange={(e) => onFilterChange('minRating', e.target.value)}>
          <option value="0">Any Rating</option>
          <option value="4">4.0+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>
    </div>
  );
};
