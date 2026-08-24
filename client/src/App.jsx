import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { WorkerDirectoryPage } from './pages/WorkerDirectoryPage';
import { RecommendWorkerPage } from './pages/RecommendWorkerPage';
import { AdminDashboardPage, LoginPage, RegisterPage } from './pages/AuthAndAdminPages';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-layout">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/directory" element={<WorkerDirectoryPage />} />
              <Route path="/recommend" element={<RecommendWorkerPage />} />
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
