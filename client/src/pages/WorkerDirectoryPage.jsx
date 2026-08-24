import React, { useState } from 'react';
import { WorkerFilter, WorkerCard } from '../components/WorkerComponents';

export const WorkerDirectoryPage = () => {
  const [filters, setFilters] = useState({});
  
  // Sample mock data matching backend DTO
  const mockWorkers = [
    {
      profile_id: 'd0000000-0000-0000-0000-000000000001',
      worker_name: 'Karim Electrical',
      phone_number: '01811111111',
      district_name: 'Patuakhali',
      upazila_name: 'Dumki',
      experience_years: 8,
      hourly_rate: 350,
      average_rating: 4.5,
      total_reviews: 2,
      service_categories: 'Electrician'
    },
    {
      profile_id: 'd0000000-0000-0000-0000-000000000002',
      worker_name: 'Rahim Plumbing',
      phone_number: '01822222222',
      district_name: 'Patuakhali',
      upazila_name: 'Dumki',
      experience_years: 5,
      hourly_rate: 300,
      average_rating: 5.0,
      total_reviews: 1,
      service_categories: 'Plumber'
    }
  ];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="directory-container">
      <WorkerFilter onFilterChange={handleFilterChange} />
      <div className="worker-list">
        <h2>Verified Workers Directory ({mockWorkers.length})</h2>
        <div className="worker-grid">
          {mockWorkers.map(w => (
            <WorkerCard key={w.profile_id} worker={w} />
          ))}
        </div>
      </div>
    </div>
  );
};
