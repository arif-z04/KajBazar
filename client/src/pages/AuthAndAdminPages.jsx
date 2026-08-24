import React from 'react';

export const AdminDashboardPage = () => {
  return (
    <div className="admin-container">
      <h2>Admin Dashboard & Moderation</h2>
      
      <div className="admin-metrics">
        <div className="metric-box">
          <h4>Total Workers</h4>
          <p>25</p>
        </div>
        <div className="metric-box">
          <h4>Verified Workers</h4>
          <p>20</p>
        </div>
        <div className="metric-box warning">
          <h4>Pending Verifications</h4>
          <p>3</p>
        </div>
        <div className="metric-box info">
          <h4>Pending Recommendations</h4>
          <p>2</p>
        </div>
      </div>

      <section className="admin-section">
        <h3>Pending Worker Profile Verifications</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Worker Name</th>
              <th>Category</th>
              <th>Location</th>
              <th>Experience</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Kamal Hossain</td>
              <td>Mechanic</td>
              <td>Dumki, Patuakhali</td>
              <td>6 Years</td>
              <td>
                <button className="btn-approve">Approve</button>
                <button className="btn-reject">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );
};

export const LoginPage = () => (
  <div className="auth-container">
    <h2>Login to KajBazar</h2>
    <form className="auth-form">
      <div className="form-group">
        <label>Email Address</label>
        <input type="email" placeholder="enter your email..." required />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" placeholder="enter password..." required />
      </div>
      <button type="submit" className="btn-primary">Login</button>
    </form>
  </div>
);

export const RegisterPage = () => (
  <div className="auth-container">
    <h2>Create a KajBazar Account</h2>
    <form className="auth-form">
      <div className="form-group">
        <label>Full Name</label>
        <input type="text" placeholder="Full name..." required />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="Email address..." required />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input type="text" placeholder="017xxxxxxxx..." required />
      </div>
      <div className="form-group">
        <label>Account Role</label>
        <select>
          <option value="Consumer">Consumer (Find Workers)</option>
          <option value="ServiceProvider">Service Provider (Skilled Worker)</option>
        </select>
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" placeholder="Choose password..." required />
      </div>
      <button type="submit" className="btn-primary">Register Account</button>
    </form>
  </div>
);
