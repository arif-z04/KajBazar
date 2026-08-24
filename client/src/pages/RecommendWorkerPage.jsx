import React, { useState } from 'react';

export const RecommendWorkerPage = () => {
  const [formData, setFormData] = useState({
    workerName: '',
    phoneNumber: '',
    category: 'Electrician',
    district: 'Patuakhali',
    upazila: 'Dumki',
    notes: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="recommend-container">
      <h2>Recommend an Offline Skilled Worker</h2>
      <p>Do you know a reliable local worker who is not yet on KajBazar? Submit their details so our team can verify and list them!</p>

      {submitted ? (
        <div className="alert-success">
          ✅ Thank you! Your recommendation has been submitted to the admin for review.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="recommend-form">
          <div className="form-group">
            <label>Worker Full Name *</label>
            <input type="text" required value={formData.workerName} onChange={e => setFormData({...formData, workerName: e.target.value})} placeholder="e.g. Jamal Hossain" />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input type="text" required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} placeholder="e.g. 01712345678" />
          </div>

          <div className="form-group">
            <label>Service Skill Category *</label>
            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="Electrician">Electrician</option>
              <option value="Plumber">Plumber</option>
              <option value="Carpenter">Carpenter</option>
              <option value="Mechanic">Mechanic</option>
              <option value="Painter">Painter</option>
            </select>
          </div>

          <div className="form-group">
            <label>District *</label>
            <select value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})}>
              <option value="Patuakhali">Patuakhali</option>
              <option value="Dhaka">Dhaka</option>
              <option value="Barishal">Barishal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Upazila *</label>
            <select value={formData.upazila} onChange={e => setFormData({...formData, upazila: e.target.value})}>
              <option value="Dumki">Dumki</option>
              <option value="Mirzaganj">Mirzaganj</option>
              <option value="Sadar">Sadar</option>
            </select>
          </div>

          <div className="form-group">
            <label>Additional Notes / Experience</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Brief details about their work..." />
          </div>

          <button type="submit" className="btn-primary">Submit Recommendation</button>
        </form>
      )}
    </div>
  );
};
