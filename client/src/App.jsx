import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar, Footer } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { WorkerDirectoryPage } from './pages/WorkerDirectoryPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { RecommendWorkerPage } from './pages/RecommendWorkerPage';
import { AdminDashboardPage, LoginPage, RegisterPage } from './pages/AuthAndAdminPages';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/directory" element={<WorkerDirectoryPage />} />
                <Route path="/workers/:id" element={<WorkerProfilePage />} />
                <Route path="/my-profile" element={<WorkerProfilePage />} />
                <Route path="/recommend" element={<RecommendWorkerPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
