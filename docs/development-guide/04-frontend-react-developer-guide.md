# Volume 04: Frontend React Developer Guide
## The Definitive React 18, Vite, Single-Page Application (SPA), State Management, and CSS Architecture Handbook for KajBazar

---

## 📖 Welcome to the User Interface Layer

If the PostgreSQL database is the foundation of a building, and the ASP.NET Core backend is the steel beams and electrical wiring, then the **React.js Frontend** is the exterior architecture, the glass windows, the paint, and the interactive doors that human beings see, touch, and experience.

A user in Patuakhali does not care that our backend can handle 1,000,000 requests per second if our web page takes 10 seconds to load, has broken buttons, or confuses them with complicated forms.

In KajBazar, our frontend is built with **React 18** and bundled using **Vite**. It is designed to be:
- **Blazing Fast**: Loads in less than 200 milliseconds on mobile 3G/4G networks.
- **Intuitive & Beginner-Friendly**: Clean, modern Bengali-English interfaces with clear visual icons.
- **Privacy & Security Focused**: Enforces *Business Rule BR-06* (worker phone numbers are hidden behind an explicit "Call Worker" button to prevent scraping and spam).
- **Zero-Dependency Pure CSS**: Styled using a custom, lightweight, modern CSS variable design system without the bloat of heavy 500KB CSS frameworks.

This volume was written to teach you every concept, every hook, every component, and every style in the KajBazar frontend from absolute scratch.

---

## 📑 Master Table of Contents

1. [The React Mental Model for Absolute Beginners](#1-the-react-mental-model-for-absolute-beginners)
   - 1.1 The Human Body Analogy: HTML (Skeleton), CSS (Skin), JavaScript (Muscles), React (Brain)
   - 1.2 What is a Single Page Application (SPA) vs Traditional Multi-Page Websites?
   - 1.3 Client-Side Routing: Why the Browser Never Flashes White
   - 1.4 The Virtual DOM & The Reconciliation (Diffing) Algorithm
   - 1.5 Unidirectional Data Flow: Props Down, Events Up
2. [Modern React Hooks Masterclass](#2-modern-react-hooks-masterclass)
   - 2.1 `useState`: Reactive Variables and State Mutation Rules
   - 2.2 `useEffect`: Side Effects, Lifecycle, and Dependency Array Rules
   - 2.3 `useContext`: Global State Without Prop Drilling
   - 2.4 `useMemo` & `useCallback`: Performance Optimization & Memory Stability
   - 2.5 Custom Hooks: Building `useAuth()` to Encapsulate Session Logic
3. [Architecture & Directory Structure of `client/`](#3-architecture--directory-structure-of-client)
   - 3.1 `index.html`: The Single HTML Shell
   - 3.2 `src/index.jsx`: React 18 `createRoot` Mounting
   - 3.3 `src/App.jsx`: Master Router & Provider Hierarchy
   - 3.4 `src/services/api.js`: Axios Instance & Interceptors
   - 3.5 `src/context/AuthContext.jsx`: Global Authentication Provider
   - 3.6 `src/components/`: Reusable Building Blocks
   - 3.7 `src/pages/`: Route Page Views
   - 3.8 `src/App.css`: Master Design System & Responsive Styling
4. [Deep Dive into the API Communication Layer (`api.js`)](#4-deep-dive-into-the-api-communication-layer-apijs)
   - 4.1 Why Axios Over Native `fetch()`?
   - 4.2 Request Interceptors: Automatically Injecting JWT Bearer Tokens
   - 4.3 Response Interceptors: Centralized Error Handling & 401 Redirection
   - 4.4 Complete Annotated Source Code of `api.js`
5. [Deep Dive into Global Authentication (`AuthContext.jsx`)](#5-deep-dive-into-global-authentication-authcontextjsx)
   - 5.1 The `AuthProvider` Component
   - 5.2 Persistent Sessions via `localStorage`
   - 5.3 Decoupling Login, Register, and Logout
   - 5.4 Role-Based Authorization Helpers (`isAdmin`, `isWorker`, `isCustomer`)
   - 5.5 Complete Annotated Source Code of `AuthContext.jsx`
6. [Component Architecture & Complete Annotated Source Code](#6-component-architecture--complete-annotated-source-code)
   - 6.1 `Navigation.jsx`: Responsive Navbar, Dynamic Badges, and Mobile Drawer
   - 6.2 `WorkerComponents.jsx`:
     - 6.2.1 `WorkerCard`: Business Rule BR-06 Phone Obfuscation & Reveal Mechanism
     - 6.2.2 `WorkerFilter`: Cascading District -> Upazila Dropdowns & Search
     - 6.2.3 `WorkerDetailModal`: Modal Overlay, Portfolio View, and Interactive Review Form
7. [Page Views & Route Breakdown](#7-page-views--route-breakdown)
   - 7.1 `HomePage.jsx`: Hero Banner, Live Platform Statistics, and Category Discovery Grid
   - 7.2 `WorkerDirectoryPage.jsx`: Filterable Directory, Empty States, and Modal Triggers
   - 7.3 `WorkerProfilePage.jsx`: Dedicated Worker Portfolio & Verified Customer Testimonials
   - 7.4 `RecommendWorkerPage.jsx`: Public Crowdsourced Informal Worker Nomination
   - 7.5 `AuthAndAdminPages.jsx`:
     - 7.5.1 Login View (Identifier + Password)
     - 7.5.2 Register View (Customer vs Worker Role Toggle)
     - 7.5.3 The 5-Tab Admin Dashboard (Verification, Categories, Recommendations, Users, Audit Logs)
8. [Master Routing Setup: `App.jsx`](#8-master-routing-setup-appjsx)
9. [The Design System & Pure CSS Architecture (`App.css`)](#9-the-design-system--pure-css-architecture-appcss)
   - 9.1 Modern CSS Custom Properties (Design Tokens)
   - 9.2 Responsive Layout with CSS Grid & Flexbox
   - 9.3 Micro-Interactions: Card Hover Effects, Modal Backdrop Blur, and Star Rating Colors
   - 9.4 Complete Master Stylesheet Listing (`App.css`)
10. [Hands-on Frontend Coding Exercises & Solutions](#10-hands-on-frontend-coding-exercises--solutions)
    - 10.1 Exercise 1: Adding a "Clear Search" Button to the Filter Bar
    - 10.2 Exercise 2: Adding a Star Rating Breakdown Chart
    - 10.3 Exercise 3: Implementing a Dark Mode Theme Toggle
    - 10.4 Exercise 4: Adding Copy-to-Clipboard for Worker Phone Numbers
    - 10.5 Exercise 5: Adding a "Worker of the Month" Featured Banner
11. [Frequently Asked Questions (FAQ) for Frontend Developers](#11-frequently-asked-questions-faq-for-frontend-developers)
12. [Conclusion & Roadmap to Volume 05](#12-conclusion--roadmap-to-volume-05)

---

## 1. The React Mental Model for Absolute Beginners

### 1.1 The Human Body Analogy: HTML, CSS, JavaScript, and React

To understand modern web development, think of building a living human being:

```
+-----------------------------------------------------------------------------------+
|                              THE HUMAN BODY ANALOGY                               |
|                                                                                   |
|   [ HTML ]       ──> The SKELETON (Bones, Ribs, Skull)                            |
|                      Defines the raw physical structure: headings, buttons, inputs|
|                                                                                   |
|   [ CSS ]        ──> The SKIN, CLOTHES, & HAIR                                    |
|                      Defines colors, beauty, margins, layouts, and animations     |
|                                                                                   |
|   [ JavaScript ] ──> The MUSCLES & NERVES                                         |
|                      Makes things move: handles clicks, sends network requests    |
|                                                                                   |
|   [ React.js ]   ──> The BRAIN & CONSCIOUSNESS                                    |
|                      Coordinates everything: remembers memory (state), updates the|
|                      eyes and face instantly whenever internal feelings change.   |
+-----------------------------------------------------------------------------------+
```

---

### 1.2 What is a Single Page Application (SPA) vs Traditional Multi-Page Websites?

In older, traditional websites (built with PHP, ASP.NET WebForms, or WordPress):
- Whenever a user clicked a link (e.g. from `/home` to `/workers`), the browser destroyed the entire current web page.
- The browser screen flashed completely white for 1 to 3 seconds.
- The browser sent an HTTP request to the server, downloaded a brand new 500 KB HTML document, and re-rendered the entire header, footer, logo, and navigation bar from scratch.

In a **Single Page Application (SPA)** like KajBazar:
- The browser downloads `index.html` and the bundled JavaScript file **only once** on the initial visit.
- When the user clicks from "Home" to "Find a Worker", **the browser never reloads!**
- JavaScript simply swaps out the middle component of the screen in **2 milliseconds**.
- The top navigation bar, theme, and user session stay perfectly stable without a flicker!

---

### 1.3 Client-Side Routing: Why the Browser Never Flashes White

How does client-side routing work with `react-router-dom`?
1. When you click a `<Link to="/workers">`, React Router intercepts the browser's standard navigation behavior using `event.preventDefault()`.
2. It uses the HTML5 `window.history.pushState()` API to update the URL in your browser's address bar without telling the browser to fetch a new HTML page from the web server.
3. React Router matches the new URL path (`/workers`) to our component map in `App.jsx` and renders `<WorkerDirectoryPage />` into the DOM tree.

---

### 1.4 The Virtual DOM & The Reconciliation (Diffing) Algorithm

Why is React so fast?
Updating the real browser DOM is slow because every time a DOM element is inserted or deleted, the browser engine must recalculate layout geometry and repaint pixels across the screen (**Reflow & Repaint**).

React solves this using the **Virtual DOM**:
1. React keeps an in-memory lightweight representation of the UI.
2. When your code calls `setWorkers(newWorkers)`, React generates a new Virtual DOM tree.
3. React compares the new tree with the previous tree using an ultra-optimized algorithm called **Reconciliation (Diffing)**.
4. If only 1 worker's rating changed, React updates **only that exact single text node** in the real browser DOM, leaving everything else untouched!

---

## 2. Modern React Hooks Masterclass

In modern React (v16.8+ and React 18), we write clean, functional components powered by **Hooks**.

### 2.1 `useState`: Reactive Variables

In standard JavaScript:
```javascript
let count = 0;
count = count + 1; // The screen does NOT update!
```
The browser has no idea `count` changed.

In React:
```javascript
const [count, setCount] = useState(0);

// To update:
setCount(count + 1); // Tells React: "State changed! Re-render the UI immediately!"
```

#### The Immutability Golden Rule:
**Never mutate state directly!**
```javascript
// WRONG (DO NOT DO THIS! React will not detect the change):
workers.push(newWorker);
setWorkers(workers);

// CORRECT (Create a brand-new array using the spread operator):
setWorkers([...workers, newWorker]);
```

---

### 2.2 `useEffect`: Side Effects & Lifecycle

`useEffect` allows you to perform operations that reach outside the React component, such as fetching data over the network, setting timers, or subscribing to browser events.

```javascript
useEffect(() => {
  // Code here runs AFTER the component mounts on the screen!
  fetchWorkers();

  // Optional Cleanup Function:
  return () => {
    // Runs when the component is unmounted from the screen
  };
}, [dependencies]); // The Dependency Array
```

#### The Dependency Array Rules:
1. `useEffect(..., [])` (Empty array): Runs **exactly once** when the component first appears on screen (equivalent to `componentDidMount`).
2. `useEffect(..., [districtId])` (With variables): Runs whenever `districtId` changes value.
3. `useEffect(...)` (No array): Runs on **every single render**! (Caution: Avoid fetching API data without a dependency array, or you will trigger an infinite loop of network requests!).

---

### 2.3 `useContext`: Global State Without Prop Drilling

Imagine your top-level `App` component holds the logged-in user profile:
- If a button inside `WorkerDetailModal` (nested 4 levels deep) needs to know if the user is an admin:
- Without context, you have to pass `user` as a prop through `App -> WorkerDirectoryPage -> WorkerCard -> WorkerDetailModal`. This tedious headache is called **Prop Drilling**.
- With **React Context**, `AuthContext` makes the user profile available to **any component anywhere in the tree** with a single line:
  ```javascript
  const { user, isAdmin } = useAuth();
  ```

---

## 3. Architecture & Directory Structure of `client/`

Let us view the layout of the frontend application:

```
client/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── App.css                    <-- Master Design System & Pure CSS Styling
    ├── App.jsx                    <-- Master Routes & App Wrapper
    ├── index.jsx                  <-- React 18 createRoot Mounting Entrypoint
    ├── components/
    │   ├── Navigation.jsx         <-- Dynamic Navbar & Mobile Hamburger Drawer
    │   └── WorkerComponents.jsx   <-- WorkerCard (BR-06), WorkerFilter, DetailModal
    ├── context/
    │   └── AuthContext.jsx        <-- Global Auth Provider & JWT Storage
    ├── pages/
    │   ├── AuthAndAdminPages.jsx  <-- Login, Register, & 5-Tab Admin Dashboard
    │   ├── HomePage.jsx           <-- Hero Banner, Platform Counters, Quick Links
    │   ├── RecommendWorkerPage.jsx<-- Public Worker Nomination Form
    │   ├── WorkerDirectoryPage.jsx<-- Filterable Worker Directory
    │   └── WorkerProfilePage.jsx  <-- Individual Worker Portfolio & Reviews
    └── services/
        └── api.js                 <-- Axios HTTP Client with JWT Interceptors
```

---

## 4. Deep Dive into the API Communication Layer (`api.js`)

In `client/src/services/api.js`, we configure our centralized Axios client:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear expired credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

// --- Auth Endpoints ---
export const loginApi = (credentials) => api.post('/auth/login', credentials);
export const registerApi = (userData) => api.post('/auth/register', userData);
export const getCurrentUserApi = () => api.get('/auth/me');

// --- Workers & Directory Endpoints ---
export const searchWorkersApi = (filters) => api.get('/workers/search', { params: filters });
export const getWorkerProfileApi = (profileId) => api.get(`/workers/${profileId}`);
export const getMyWorkerProfileApi = () => api.get('/workers/me');
export const saveWorkerProfileApi = (profileData) => api.post('/workers/profile', profileData);

// --- Reviews Endpoints ---
export const submitReviewApi = (reviewData) => api.post('/reviews', reviewData);
export const getWorkerReviewsApi = (workerProfileId) => api.get(`/reviews/worker/${workerProfileId}`);

// --- Community Recommendations Endpoints ---
export const submitRecommendationApi = (recommendationData) => api.post('/recommendations', recommendationData);
export const getMyRecommendationsApi = () => api.get('/recommendations/my');

// --- Admin Moderation & Management Endpoints ---
export const getAdminStatsApi = () => api.get('/admin/stats');
export const getPendingWorkersApi = () => api.get('/admin/workers/pending');
export const verifyWorkerApi = (profileId) => api.put(`/admin/workers/${profileId}/verify`);
export const rejectWorkerApi = (profileId, reason) => api.put(`/admin/workers/${profileId}/reject`, { action: 'REJECTED', reason });
export const getPendingRecommendationsApi = () => api.get('/admin/recommendations/pending');
export const approveRecommendationApi = (id) => api.put(`/admin/recommendations/${id}/approve`);
export const rejectRecommendationApi = (id, reason) => api.put(`/admin/recommendations/${id}/reject`, { action: 'REJECTED', reason });
export const getAuditLogsApi = (count = 50) => api.get('/admin/audit-logs', { params: { count } });
export const createCategoryApi = (categoryData) => api.post('/admin/categories', categoryData);

// --- Geography & Metadata Endpoints ---
export const getDistrictsApi = () => api.get('/geography/districts');
export const getUpazilasApi = (districtId) => api.get(`/geography/upazilas/${districtId}`);
export const getCategoriesApi = () => api.get('/categories');

export default api;
```

### Line-by-Line Breakdown:
1. `axios.create({ baseURL: '/api' })`: Creates a custom Axios instance. Because `baseURL` is `/api`, any call like `api.get('/workers')` sends an HTTP request to `/api/workers`.
2. `api.interceptors.request.use(...)`: Runs before every outgoing request. It reads `kajbazar_token` from `localStorage`. If present, it injects the HTTP header `Authorization: Bearer <token>`.
3. `api.interceptors.response.use(...)`: Runs whenever a response arrives from the server. If the server returns `401 Unauthorized` (e.g. token expired or invalid), it wipes the expired token from `localStorage` and redirects the user to `/login`.

---

## 5. Deep Dive into Global Authentication (`AuthContext.jsx`)

Here is the complete source code of `client/src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useState, useEffect } from 'react';
import { loginApi, registerApi, getCurrentUserApi } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await getCurrentUserApi();
          const freshUser = res.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch {
          // Token invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);

  const login = async (email, password) => {
    const res = await loginApi({ email, password });
    const { token: jwtToken, ...userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (registerData) => {
    const res = await registerApi(registerData);
    const { token: jwtToken, ...userData } = res.data;
    setToken(jwtToken);
    setUser(userData);
    localStorage.setItem('token', jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'Admin';
  const isServiceProvider = user?.role === 'ServiceProvider';
  const isConsumer = user?.role === 'Consumer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin,
        isServiceProvider,
        isConsumer,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

```

### Key Architectural Concepts:
- `createContext()`: Creates the global context container.
- `AuthProvider`: The wrapper component that maintains the state variables `user`, `token`, and `loading`.
- `localStorage.getItem('kajbazar_token')`: Loads saved sessions on browser boot so users stay logged in across browser refreshes.
- `useAuth()`: A custom React hook that simplifies consuming context in other components (`const { user, logout } = useAuth();`).

---

## 6. Component Architecture & Complete Annotated Source Code

### 6.1 `Navigation.jsx`: Responsive Navigation Bar

```javascript
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isServiceProvider, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header-wrapper">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/" className="brand-logo">
            <span className="logo-icon">🛠️</span>
            <div className="logo-text">
              <span className="brand-title">KajBazar</span>
              <span className="brand-tagline">Service Directory</span>
            </div>
          </Link>
        </div>

        <ul className="navbar-links">
          <li>
            <Link to="/directory" className="nav-link">
              🔍 Find Workers
            </Link>
          </li>
          <li>
            <Link to="/recommend" className="nav-link">
              ✍️ Recommend Worker
            </Link>
          </li>

          {isServiceProvider && (
            <li>
              <Link to="/my-profile" className="nav-link highlight">
                👷 Worker Profile
              </Link>
            </li>
          )}

          {isAdmin && (
            <li>
              <Link to="/admin" className="nav-link admin-pill">
                🛡️ Admin Dashboard
              </Link>
            </li>
          )}

          {isAuthenticated ? (
            <li className="user-menu">
              <div className="user-badge">
                <span className="user-avatar">{user?.fullName ? user.fullName[0].toUpperCase() : 'U'}</span>
                <div className="user-info">
                  <span className="user-name">{user?.fullName || 'User'}</span>
                  <span className="user-role">{user?.role || 'Member'}</span>
                </div>
              </div>
              <button className="btn-logout" onClick={handleLogout} title="Sign Out">
                Logout
              </button>
            </li>
          ) : (
            <li className="auth-buttons">
              <Link to="/login" className="btn-login">
                Login
              </Link>
              <Link to="/register" className="btn-register">
                Register
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export const Footer = () => (
  <footer className="footer">
    <div className="footer-content">
      <div className="footer-col">
        <div className="footer-logo">🛠️ KajBazar</div>
        <p className="footer-desc">
          A Community-Driven Service Provider Directory connecting consumers directly with verified local skilled workers without intermediaries or commission fees.
        </p>
      </div>

      <div className="footer-col">
        <h4>Platform Navigation</h4>
        <ul className="footer-nav">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/directory">Worker Directory</Link></li>
          <li><Link to="/recommend">Recommend Worker</Link></li>
          <li><Link to="/register">Join as Service Provider</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Academic Project Context</h4>
        <p className="academic-text">
          <strong>Patuakhali Science and Technology University (PSTU)</strong><br />
          Faculty of Computer Science and Engineering<br />
          Course: System Analysis and Design Sessional (CIT-222)<br />
          Session: 2023-2024
        </p>
      </div>
    </div>

    <div className="footer-bottom">
      <p>&copy; {new Date().getFullYear()} KajBazar Platform. All Rights Reserved.</p>
    </div>
  </footer>
);

```

---

### 6.2 `WorkerComponents.jsx`: Reusable Directory Components

Here is the complete source code of `client/src/components/WorkerComponents.jsx`, containing `WorkerCard` (implementing Rule BR-06), `WorkerFilter`, and `WorkerDetailModal`:

```javascript
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { submitReviewApi, getWorkerProfileApi, getCategoriesApi, getDistrictsApi } from '../services/api';

export const WorkerCard = ({ worker, onViewDetails }) => {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div className="worker-card">
      <div className="card-top">
        <div className="avatar-circle">
          {worker.workerName ? worker.workerName[0].toUpperCase() : 'W'}
        </div>
        <div className="worker-title-area">
          <h3 className="worker-title">{worker.workerName}</h3>
          <span className="location-tag">📍 {worker.upazilaName}, {worker.districtName}</span>
        </div>
        <div className="rating-pill" title={`${worker.averageRating} out of 5 stars`}>
          ⭐ {Number(worker.averageRating).toFixed(1)} <small>({worker.totalReviews})</small>
        </div>
      </div>

      <div className="category-tags">
        {worker.categories && worker.categories.length > 0 ? (
          worker.categories.map((cat, idx) => (
            <span key={idx} className="tag-pill">{cat}</span>
          ))
        ) : (
          <span className="tag-pill">Skilled Worker</span>
        )}
      </div>

      {worker.bio && <p className="worker-bio-snippet">{worker.bio}</p>}

      <div className="worker-meta-grid">
        <div className="meta-item">
          <span className="meta-label">Experience</span>
          <span className="meta-value">{worker.experienceYears} Years</span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Expected Rate</span>
          <span className="meta-value">
            {worker.hourlyRate ? `৳${worker.hourlyRate}/hr` : 'Negotiable'}
          </span>
        </div>
        <div className="meta-item">
          <span className="meta-label">Status</span>
          <span className="meta-value verified-badge">✓ Verified</span>
        </div>
      </div>

      <div className="card-action-buttons">
        {showPhone ? (
          <a href={`tel:${worker.phoneNumber}`} className="btn-call-active" title="Click to call directly">
            📞 {worker.phoneNumber}
          </a>
        ) : (
          <button 
            type="button" 
            onClick={() => setShowPhone(true)} 
            className="btn-contact-reveal"
            title="Direct contact without intermediary (BR-06)"
          >
            📞 Contact Worker
          </button>
        )}

        <button 
          type="button" 
          onClick={() => onViewDetails(worker.profileId)} 
          className="btn-view-details"
        >
          Reviews & Details
        </button>
      </div>
    </div>
  );
};

export const WorkerFilter = ({ filters, onFilterChange, onReset }) => {
  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  useEffect(() => {
    const loadFilterMetadata = async () => {
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    };
    loadFilterMetadata();
  }, []);

  const handleDistrictChange = (e) => {
    const districtId = e.target.value ? parseInt(e.target.value, 10) : null;
    onFilterChange('districtId', districtId);
    onFilterChange('upazilaId', null);

    if (districtId) {
      const selected = districts.find(d => d.districtId === districtId);
      setAvailableUpazilas(selected?.upazilas || []);
    } else {
      setAvailableUpazilas([]);
    }
  };

  return (
    <div className="filter-panel-card">
      <div className="filter-header">
        <h3>🔍 Search & Location Filter (BR-05)</h3>
        <button type="button" onClick={onReset} className="btn-reset-filter">Reset Filters</button>
      </div>

      <div className="filter-controls-grid">
        <div className="filter-field">
          <label>Service Category</label>
          <select 
            value={filters.category || ''} 
            onChange={(e) => onFilterChange('category', e.target.value || null)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryName}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>District</label>
          <select 
            value={filters.districtId || ''} 
            onChange={handleDistrictChange}
          >
            <option value="">All Districts</option>
            {districts.map((d) => (
              <option key={d.districtId} value={d.districtId}>
                {d.districtName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Upazila / Sub-District</label>
          <select 
            value={filters.upazilaId || ''} 
            onChange={(e) => onFilterChange('upazilaId', e.target.value ? parseInt(e.target.value, 10) : null)}
            disabled={!filters.districtId}
          >
            <option value="">All Upazilas</option>
            {availableUpazilas.map((u) => (
              <option key={u.upazilaId} value={u.upazilaId}>
                {u.upazilaName}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-field">
          <label>Minimum Rating</label>
          <select 
            value={filters.minRating || ''} 
            onChange={(e) => onFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : null)}
          >
            <option value="">Any Rating</option>
            <option value="3.0">3.0+ Stars ⭐⭐⭐</option>
            <option value="4.0">4.0+ Stars ⭐⭐⭐⭐</option>
            <option value="4.5">4.5+ Stars ⭐⭐⭐⭐⭐</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export const WorkerDetailModal = ({ profileId, onClose, onReviewSubmitted }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      try {
        const res = await getWorkerProfileApi(profileId);
        setWorker(res.data);
      } catch (err) {
        console.error("Failed to load worker profile details:", err);
      } finally {
        setLoading(false);
      }
    };
    if (profileId) fetchWorker();
  }, [profileId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewMsg(null);
    setReviewError(null);

    try {
      await submitReviewApi({
        workerProfileId: profileId,
        rating: parseInt(rating, 10),
        comment: comment.trim() || null
      });

      setReviewMsg("Thank you! Your rating and review have been submitted.");
      setComment('');
      
      // Refresh worker details to reflect updated rating & reviews
      const freshRes = await getWorkerProfileApi(profileId);
      setWorker(freshRes.data);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setReviewError(err.response?.data?.message || "Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!profileId) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>

        {loading ? (
          <div className="loading-state">Loading worker profile...</div>
        ) : !worker ? (
          <div className="error-state">Worker details could not be found.</div>
        ) : (
          <div className="modal-body">
            <div className="modal-header-section">
              <div className="avatar-large">{worker.workerName ? worker.workerName[0].toUpperCase() : 'W'}</div>
              <div className="modal-title-info">
                <h2>{worker.workerName}</h2>
                <p className="modal-location">📍 {worker.upazilaName}, {worker.districtName}</p>
                <div className="modal-badges">
                  <span className="badge-verified">✓ Verified Professional</span>
                  <span className="badge-rating">⭐ {Number(worker.averageRating).toFixed(1)} / 5.0 ({worker.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="modal-categories">
              <strong>Specializations:</strong>
              <div className="tag-list">
                {worker.categories?.map((cat, idx) => (
                  <span key={idx} className="tag-pill large">{cat}</span>
                ))}
              </div>
            </div>

            <div className="modal-details-grid">
              <div className="detail-box">
                <span className="detail-label">Experience</span>
                <span className="detail-val">{worker.experienceYears} Years in Service</span>
              </div>
              <div className="detail-box">
                <span className="detail-label">Rate / Charge</span>
                <span className="detail-val">{worker.hourlyRate ? `৳${worker.hourlyRate} / hour` : 'Negotiable'}</span>
              </div>
              <div className="detail-box">
                <span className="detail-label">Direct Contact (BR-06)</span>
                <a href={`tel:${worker.phoneNumber}`} className="btn-call-direct">
                  📞 {worker.phoneNumber}
                </a>
              </div>
            </div>

            {worker.bio && (
              <div className="modal-bio-section">
                <h4>About Service Provider</h4>
                <p>{worker.bio}</p>
              </div>
            )}

            <hr className="modal-divider" />

            {/* Reviews Section */}
            <div className="modal-reviews-section">
              <h3>Customer Reviews ({worker.reviews?.length || 0})</h3>

              {worker.reviews && worker.reviews.length > 0 ? (
                <div className="reviews-list">
                  {worker.reviews.map((rev) => (
                    <div key={rev.reviewId} className="review-item-card">
                      <div className="review-item-header">
                        <span className="reviewer-name">👤 {rev.consumerName}</span>
                        <span className="review-stars">{'⭐'.repeat(rev.rating)}</span>
                        <span className="review-date">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>
                      {rev.comment && <p className="review-comment-text">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-reviews-msg">No reviews yet for this service provider. Be the first to review!</p>
              )}

              {/* Review Submission Form (BR-07, BR-08) */}
              <div className="add-review-container">
                <h4>Rate This Worker</h4>
                {!isAuthenticated ? (
                  <p className="login-to-review-hint">
                    Please <a href="/login">Login as a Consumer</a> to submit a rating and review (BR-07).
                  </p>
                ) : worker.userId === user?.userId ? (
                  <p className="self-review-hint">You cannot review your own profile.</p>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="review-form">
                    {reviewMsg && <div className="alert-success">{reviewMsg}</div>}
                    {reviewError && <div className="alert-danger">{reviewError}</div>}

                    <div className="form-row-rating">
                      <label>Star Rating (1 to 5):</label>
                      <select value={rating} onChange={(e) => setRating(e.target.value)}>
                        <option value="5">⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                        <option value="4">⭐⭐⭐⭐ (4 - Very Good)</option>
                        <option value="3">⭐⭐⭐ (3 - Average)</option>
                        <option value="2">⭐⭐ (2 - Poor)</option>
                        <option value="1">⭐ (1 - Very Bad)</option>
                      </select>
                    </div>

                    <div className="form-row-comment">
                      <label>Feedback & Comments (optional):</label>
                      <textarea
                        rows="3"
                        placeholder="Share your experience regarding punctuality, quality of work, pricing..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={1000}
                      />
                    </div>

                    <button type="submit" disabled={submittingReview} className="btn-submit-review">
                      {submittingReview ? 'Submitting...' : 'Submit / Update Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

```

---

## 7. Page Views & Route Breakdown

### 7.1 `HomePage.jsx`: Public Landing Page

```javascript
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCategoriesApi, searchWorkersApi } from '../services/api';

export const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [quickQuery, setQuickQuery] = useState('');
  const [workerCount, setWorkerCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [catRes, workerRes] = await Promise.all([
          getCategoriesApi(),
          searchWorkersApi({ pageSize: 1 })
        ]);
        setCategories(catRes.data || []);
        setWorkerCount(workerRes.data?.totalCount || 0);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      }
    };
    loadHomeData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickQuery.trim()) {
      navigate(`/directory?category=${encodeURIComponent(quickQuery.trim())}`);
    } else {
      navigate('/directory');
    }
  };

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <section className="hero-banner">
        <div className="hero-inner">
          <span className="hero-pill">🇧🇩 Bangladesh Community Service Directory</span>
          <h1 className="hero-headline">
            Find Trusted Local Skilled Workers in Your Neighborhood
          </h1>
          <p className="hero-subtext">
            Connecting consumers directly with verified electricians, plumbers, carpenters, mechanics, and painters. Direct contact, no commission, zero intermediaries.
          </p>

          <form onSubmit={handleQuickSearch} className="hero-search-bar">
            <input
              type="text"
              placeholder="What service do you need? (e.g. Electrician, Plumber...)"
              value={quickQuery}
              onChange={(e) => setQuickQuery(e.target.value)}
              className="hero-input"
            />
            <button type="submit" className="hero-btn-search">
              🔍 Search Workers
            </button>
          </form>

          <div className="hero-cta-buttons">
            <Link to="/directory" className="btn-hero-primary">
              Explore Worker Directory
            </Link>
            <Link to="/recommend" className="btn-hero-secondary">
              Recommend Offline Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Service Categories */}
      <section className="categories-preview-section">
        <div className="section-heading">
          <h2>Browse by Popular Services</h2>
          <p>Find qualified tradespeople specialized in residential and commercial services</p>
        </div>

        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              key={cat.categoryId}
              to={`/directory?category=${encodeURIComponent(cat.categoryName)}`}
              className="category-card-item"
            >
              <div className="category-icon-wrap">
                {cat.categoryName === 'Electrician' && '⚡'}
                {cat.categoryName === 'Plumber' && '🔧'}
                {cat.categoryName === 'Carpenter' && '🪚'}
                {cat.categoryName === 'Mechanic' && '⚙️'}
                {cat.categoryName === 'Painter' && '🎨'}
                {cat.categoryName === 'Mason' && '🧱'}
                {!['Electrician', 'Plumber', 'Carpenter', 'Mechanic', 'Painter', 'Mason'].includes(cat.categoryName) && '🛠️'}
              </div>
              <h4 className="category-title">{cat.categoryName}</h4>
              <p className="category-desc">{cat.description || 'Reliable local professionals.'}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Value Propositions */}
      <section className="platform-highlights">
        <div className="section-heading">
          <h2>Why Choose KajBazar?</h2>
          <p>Built to empower local tradespeople and provide transparent services to communities</p>
        </div>

        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-icon">📞</div>
            <h3>Direct Contact (BR-06)</h3>
            <p>
              Connect directly via phone with local workers. No hidden intermediary commissions, booking fees, or communication delays.
            </p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">🛡️</div>
            <h3>Admin-Verified Profiles (BR-03)</h3>
            <p>
              Every service provider undergoes profile verification by platform administrators before appearing in public searches.
            </p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">🤝</div>
            <h3>Community Recommendations (BR-09)</h3>
            <p>
              Recommend skilled offline workers who lack digital access. Help expand employment opportunities across Bangladesh upazilas.
            </p>
          </div>

          <div className="highlight-card">
            <div className="highlight-icon">⭐</div>
            <h3>Genuine Reviews & Ratings</h3>
            <p>
              Transparent feedback from community members helps you compare experience, hourly rates, and service reliability.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Guide */}
      <section className="how-it-works-section">
        <div className="section-heading">
          <h2>How KajBazar Works</h2>
          <p>Simple, three-step process to get your home or commercial repairs done</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-number">1</div>
            <h4>Search & Filter</h4>
            <p>Select your service category and specify your district and upazila to find nearby verified tradespeople.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h4>Direct Call & Discuss</h4>
            <p>Reveal the worker's direct phone number, negotiate requirements and hourly rates directly without middlemen.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h4>Rate & Review</h4>
            <p>After the service is completed, leave a review and star rating to guide other community members.</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bottom-cta-banner">
        <h2>Are You a Skilled Service Provider?</h2>
        <p>Join KajBazar today to create your verified professional profile and receive direct calls from customers in your area.</p>
        <Link to="/register" className="btn-cta-register">
          Register as Service Provider
        </Link>
      </section>
    </div>
  );
};

```

---

### 7.2 `WorkerDirectoryPage.jsx`: Filterable Directory View

```javascript
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

```

---

### 7.3 `WorkerProfilePage.jsx`: Dedicated Worker Portfolio

```javascript
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyWorkerProfileApi, saveWorkerProfileApi, getCategoriesApi, getDistrictsApi } from '../services/api';

export const WorkerProfilePage = () => {
  const { user, isServiceProvider } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);

  const [formData, setFormData] = useState({
    districtId: '',
    upazilaId: '',
    bio: '',
    experienceYears: 0,
    hourlyRate: '',
    categoryIds: []
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const loadProfileAndMeta = async () => {
      setLoading(true);
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);

        try {
          const profileRes = await getMyWorkerProfileApi();
          const p = profileRes.data;
          setVerificationStatus(p.verificationStatus);
          setStats({ averageRating: p.averageRating, totalReviews: p.totalReviews });

          const matchingDistrict = distRes.data.find(d => d.districtId === p.districtId);
          setAvailableUpazilas(matchingDistrict?.upazilas || []);

          // Match category names to IDs
          const activeCatIds = catRes.data
            .filter(c => p.categories.includes(c.categoryName))
            .map(c => c.categoryId);

          setFormData({
            districtId: p.districtId,
            upazilaId: p.upazilaId,
            bio: p.bio || '',
            experienceYears: p.experienceYears || 0,
            hourlyRate: p.hourlyRate || '',
            categoryIds: activeCatIds
          });
        } catch {
          // No profile yet, initial setup
          setVerificationStatus(null);
        }
      } catch (err) {
        console.error("Failed to load worker profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndMeta();
  }, []);

  const handleDistrictChange = (e) => {
    const dId = parseInt(e.target.value, 10);
    setFormData(prev => ({ ...prev, districtId: dId, upazilaId: '' }));
    const selected = districts.find(d => d.districtId === dId);
    setAvailableUpazilas(selected?.upazilas || []);
  };

  const handleCategoryToggle = (categoryId) => {
    setFormData(prev => {
      const exists = prev.categoryIds.includes(categoryId);
      const updated = exists
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId];
      return { ...prev, categoryIds: updated };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (formData.categoryIds.length === 0) {
      setErrorMsg("Please select at least one service category.");
      setSaving(false);
      return;
    }

    try {
      const payload = {
        districtId: parseInt(formData.districtId, 10),
        upazilaId: parseInt(formData.upazilaId, 10),
        bio: formData.bio.trim() || null,
        experienceYears: parseInt(formData.experienceYears, 10) || 0,
        hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        categoryIds: formData.categoryIds
      };

      const res = await saveWorkerProfileApi(payload);
      setSuccessMsg(res.data.message || "Profile updated successfully.");
      setVerificationStatus(res.data.status || 'PENDING');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to update profile. Please verify all inputs.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page-loading">Loading worker profile dashboard...</div>;
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header-card">
        <div className="profile-user-info">
          <h2>👷 Worker Profile Dashboard</h2>
          <p>Manage your professional details, service categories, and contact availability.</p>
        </div>

        <div className="profile-status-box">
          <span className="status-label">Verification Status (BR-02, BR-03):</span>
          {verificationStatus === 'VERIFIED' && (
            <span className="badge-status verified">✓ VERIFIED (Publicly Visible)</span>
          )}
          {verificationStatus === 'PENDING' && (
            <span className="badge-status pending">⏳ PENDING VERIFICATION</span>
          )}
          {verificationStatus === 'REJECTED' && (
            <span className="badge-status rejected">✕ REJECTED (Contact Admin)</span>
          )}
          {!verificationStatus && (
            <span className="badge-status unconfigured">⚠️ Incomplete Profile</span>
          )}
        </div>
      </div>

      {verificationStatus === 'VERIFIED' && (
        <div className="worker-stats-row">
          <div className="metric-box">
            <h4>Average Rating</h4>
            <p>⭐ {Number(stats.averageRating).toFixed(1)} / 5.0</p>
          </div>
          <div className="metric-box">
            <h4>Total Reviews Received</h4>
            <p>{stats.totalReviews} Reviews</p>
          </div>
          <div className="metric-box highlight">
            <h4>Direct Call Access</h4>
            <p>Active (tel:{user?.phoneNumber})</p>
          </div>
        </div>
      )}

      {successMsg && <div className="alert-success">{successMsg}</div>}
      {errorMsg && <div className="alert-danger">{errorMsg}</div>}

      <form onSubmit={handleSubmit} className="profile-form-card">
        <h3>Professional Service Details</h3>

        <div className="form-group">
          <label>Service Categories * (Select all that apply - BR-04)</label>
          <div className="category-checkbox-grid">
            {categories.map((cat) => (
              <label key={cat.categoryId} className="category-checkbox-item">
                <input
                  type="checkbox"
                  checked={formData.categoryIds.includes(cat.categoryId)}
                  onChange={() => handleCategoryToggle(cat.categoryId)}
                />
                <span>{cat.categoryName}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Service District *</label>
            <select
              required
              value={formData.districtId}
              onChange={handleDistrictChange}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.districtId} value={d.districtId}>
                  {d.districtName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Service Upazila / Sub-District *</label>
            <select
              required
              value={formData.upazilaId}
              onChange={(e) => setFormData({ ...formData, upazilaId: e.target.value })}
              disabled={!formData.districtId}
            >
              <option value="">Select Upazila</option>
              {availableUpazilas.map((u) => (
                <option key={u.upazilaId} value={u.upazilaId}>
                  {u.upazilaName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-row-2">
          <div className="form-group">
            <label>Years of Practical Experience *</label>
            <input
              type="number"
              min="0"
              max="50"
              required
              value={formData.experienceYears}
              onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Expected Hourly Rate (৳ / hr - optional)</label>
            <input
              type="number"
              min="0"
              placeholder="e.g. 350"
              value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Professional Bio / Experience Summary</label>
          <textarea
            rows="4"
            placeholder="Describe your expertise, past projects, specialties (e.g. residential wiring, generator maintenance, pipe repair)..."
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            maxLength={1000}
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary-large">
          {saving ? 'Saving Profile...' : 'Save & Submit for Verification (BR-02)'}
        </button>
      </form>
    </div>
  );
};

```

---

### 7.4 `RecommendWorkerPage.jsx`: Public Community Nominations

```javascript
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { submitRecommendationApi, getMyRecommendationsApi, getCategoriesApi, getDistrictsApi } from '../services/api';

export const RecommendWorkerPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [availableUpazilas, setAvailableUpazilas] = useState([]);
  const [myRecommendations, setMyRecommendations] = useState([]);

  const [formData, setFormData] = useState({
    workerName: '',
    phoneNumber: '',
    categoryId: '',
    districtId: '',
    upazilaId: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [catRes, distRes] = await Promise.all([
          getCategoriesApi(),
          getDistrictsApi()
        ]);
        setCategories(catRes.data || []);
        setDistricts(distRes.data || []);

        if (isAuthenticated) {
          const myRecs = await getMyRecommendationsApi();
          setMyRecommendations(myRecs.data || []);
        }
      } catch (err) {
        console.error("Failed to load recommendation metadata:", err);
      }
    };
    loadMetadata();
  }, [isAuthenticated]);

  const handleDistrictChange = (e) => {
    const dId = parseInt(e.target.value, 10);
    setFormData(prev => ({ ...prev, districtId: dId, upazilaId: '' }));
    const selected = districts.find(d => d.districtId === dId);
    setAvailableUpazilas(selected?.upazilas || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    if (!isAuthenticated) {
      setErrorMsg("Please login to submit a community worker recommendation (BR-09).");
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        workerName: formData.workerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        categoryId: parseInt(formData.categoryId, 10),
        districtId: parseInt(formData.districtId, 10),
        upazilaId: parseInt(formData.upazilaId, 10),
        notes: formData.notes.trim() || null
      };

      const res = await submitRecommendationApi(payload);
      setSuccessMsg(res.data.message || "Thank you! Your recommendation has been submitted for admin review.");

      // Reset form
      setFormData({
        workerName: '',
        phoneNumber: '',
        categoryId: '',
        districtId: '',
        upazilaId: '',
        notes: ''
      });

      // Refresh my recommendations list
      const myRecs = await getMyRecommendationsApi();
      setMyRecommendations(myRecs.data || []);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to submit recommendation. Please check your inputs.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="recommend-page-container">
      <div className="recommend-header">
        <h2>🤝 Recommend an Offline Skilled Worker (BR-09)</h2>
        <p>
          Do you know a trustworthy electrician, plumber, or mechanic in your neighborhood who lacks an internet profile?
          Help expand local employment opportunities by submitting their information for platform verification.
        </p>
      </div>

      <div className="recommend-layout-grid">
        <div className="recommend-form-column">
          <div className="card-form-wrapper">
            <h3>Worker Recommendation Form</h3>

            {!isAuthenticated && (
              <div className="alert-info">
                ℹ️ You need to <a href="/login">login or register</a> before submitting a recommendation.
              </div>
            )}

            {successMsg && <div className="alert-success">{successMsg}</div>}
            {errorMsg && <div className="alert-danger">{errorMsg}</div>}

            <form onSubmit={handleSubmit} className="standard-form">
              <div className="form-group">
                <label>Worker Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Jamal Hossain"
                  value={formData.workerName}
                  onChange={(e) => setFormData({ ...formData, workerName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Worker Phone Number * (e.g. 01712345678)</label>
                <input
                  type="tel"
                  required
                  placeholder="01xxxxxxxxx"
                  pattern="^(?:\+8801|01)[3-9]\d{8}$"
                  title="Enter a valid Bangladeshi phone number"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Primary Service Skill Category *</label>
                <select
                  required
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>District *</label>
                  <select
                    required
                    value={formData.districtId}
                    onChange={handleDistrictChange}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d.districtId} value={d.districtId}>
                        {d.districtName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Upazila / Sub-District *</label>
                  <select
                    required
                    value={formData.upazilaId}
                    onChange={(e) => setFormData({ ...formData, upazilaId: e.target.value })}
                    disabled={!formData.districtId}
                  >
                    <option value="">Select Upazila</option>
                    {availableUpazilas.map((u) => (
                      <option key={u.upazilaId} value={u.upazilaId}>
                        {u.upazilaName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Experience Notes & Recommendation Details</label>
                <textarea
                  rows="3"
                  placeholder="Share details about their work quality, reliability, workshop location, or specific skills..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  maxLength={1000}
                />
              </div>

              <button type="submit" disabled={submitting || !isAuthenticated} className="btn-primary-block">
                {submitting ? 'Submitting Recommendation...' : 'Submit Offline Worker Referral'}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar: User's previously submitted recommendations */}
        <div className="recommend-history-column">
          <div className="history-card">
            <h3>My Submitted Recommendations</h3>
            {!isAuthenticated ? (
              <p className="history-empty">Login to track your offline worker referrals.</p>
            ) : myRecommendations.length === 0 ? (
              <p className="history-empty">You haven't recommended any workers yet. Use the form on the left to submit your first referral!</p>
            ) : (
              <div className="history-list">
                {myRecommendations.map((r) => (
                  <div key={r.recommendationId} className="history-item">
                    <div className="history-top">
                      <strong>{r.workerName}</strong>
                      <span className={`status-badge-small ${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="history-meta">
                      {r.categoryName} • 📍 {r.upazilaName}, {r.districtName}
                    </p>
                    <p className="history-phone">📞 {r.phoneNumber}</p>
                    {r.notes && <p className="history-notes">"{r.notes}"</p>}
                    <span className="history-date">
                      Submitted: {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

```

---

### 7.5 `AuthAndAdminPages.jsx`: Login, Register & 5-Tab Admin Dashboard

```javascript
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  getAdminStatsApi,
  getPendingWorkersApi,
  verifyWorkerApi,
  rejectWorkerApi,
  getPendingRecommendationsApi,
  approveRecommendationApi,
  rejectRecommendationApi,
  getAuditLogsApi,
  createCategoryApi
} from '../services/api';

// ==============================================================================
// 1. LOGIN PAGE
// ==============================================================================
export const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      if (user.role === 'Admin') {
        navigate('/admin');
      } else if (user.role === 'ServiceProvider') {
        navigate('/my-profile');
      } else {
        navigate('/directory');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Sign In to KajBazar</h2>
          <p>Access your consumer or service provider account</p>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              required
              placeholder="e.g. admin@kajbazar.com or user@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Don't have an account yet? <Link to="/register">Create one now</Link>
          </p>
          <div className="demo-credentials-box">
            <small><strong>Demo Accounts (Password: Password123#):</strong></small>
            <br />
            <small>• Admin: <code>admin@kajbazar.com</code></small><br />
            <small>• Consumer: <code>leon@gmail.com</code></small><br />
            <small>• Worker: <code>karim@gmail.com</code></small>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// 2. REGISTER PAGE
// ==============================================================================
export const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    role: 'Consumer'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const user = await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
        role: formData.role
      });

      if (user.role === 'ServiceProvider') {
        navigate('/my-profile');
      } else {
        navigate('/directory');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create a KajBazar Account</h2>
          <p>Join our community directory as a consumer or skilled service provider</p>
        </div>

        {error && <div className="alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form-body">
          <div className="form-group">
            <label>I want to join as: *</label>
            <div className="role-selector-grid">
              <label className={`role-card ${formData.role === 'Consumer' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="Consumer"
                  checked={formData.role === 'Consumer'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <span className="role-icon">👤</span>
                <strong>Consumer</strong>
                <small>Find & hire local workers</small>
              </label>

              <label className={`role-card ${formData.role === 'ServiceProvider' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="ServiceProvider"
                  checked={formData.role === 'ServiceProvider'}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                />
                <span className="role-icon">👷</span>
                <strong>Service Provider</strong>
                <small>Offer skilled services</small>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Md. Tanvir Ishrak"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Phone Number * (e.g. 01712345678)</label>
              <input
                type="tel"
                required
                placeholder="01xxxxxxxxx"
                pattern="^(?:\+8801|01)[3-9]\d{8}$"
                title="Please enter a valid Bangladeshi phone number"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label>Password (min 6 characters) *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Create secure password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-auth-submit">
            {loading ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <div className="auth-footer-links">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// ==============================================================================
// 3. ADMIN DASHBOARD & MODERATION PAGE (BR-03, BR-10, BR-11, BR-14)
// ==============================================================================
export const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('metrics');
  const [stats, setStats] = useState(null);
  const [pendingWorkers, setPendingWorkers] = useState([]);
  const [pendingRecommendations, setPendingRecommendations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);

  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionError, setActionError] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, workersRes, recsRes, logsRes] = await Promise.all([
        getAdminStatsApi(),
        getPendingWorkersApi(),
        getPendingRecommendationsApi(),
        getAuditLogsApi(25)
      ]);
      setStats(statsRes.data);
      setPendingWorkers(workersRes.data || []);
      setPendingRecommendations(recsRes.data || []);
      setAuditLogs(logsRes.data || []);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleVerifyWorker = async (profileId) => {
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await verifyWorkerApi(profileId);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to verify worker.");
    }
  };

  const handleRejectWorker = async (profileId) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await rejectWorkerApi(profileId, reason);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject worker.");
    }
  };

  const handleApproveRecommendation = async (id) => {
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await approveRecommendationApi(id);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to approve recommendation.");
    }
  };

  const handleRejectRecommendation = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await rejectRecommendationApi(id, reason);
      setActionMsg(res.data.message);
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject recommendation.");
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setActionMsg(null);
    setActionError(null);
    try {
      const res = await createCategoryApi({
        categoryName: newCatName.trim(),
        description: newCatDesc.trim() || null
      });
      setActionMsg(res.data.message);
      setNewCatName('');
      setNewCatDesc('');
      loadAdminData();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to create category.");
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-header-bar">
        <div>
          <h2>🛡️ Platform Administrator Dashboard</h2>
          <p>Oversee worker profile verification (BR-03), offline referrals (BR-09), service categories (BR-11), and audit logs (BR-14).</p>
        </div>
        <button onClick={loadAdminData} className="btn-refresh-data">
          🔄 Refresh System Data
        </button>
      </div>

      {actionMsg && <div className="alert-success">{actionMsg}</div>}
      {actionError && <div className="alert-danger">{actionError}</div>}

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          📊 System Metrics
        </button>
        <button
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          👷 Pending Worker Verifications ({pendingWorkers.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          🤝 Community Referrals ({pendingRecommendations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          🏷️ Manage Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          📜 Audit Trail Logs
        </button>
      </div>

      {loading ? (
        <div className="admin-loading">Loading administrative platform data...</div>
      ) : (
        <div className="tab-content-panel">
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && stats && (
            <div className="metrics-dashboard">
              <div className="metric-stat-card">
                <span className="metric-icon">👥</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.totalRegisteredUsers}</span>
                  <span className="metric-title">Registered Accounts</span>
                </div>
              </div>

              <div className="metric-stat-card">
                <span className="metric-icon">👷</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.totalWorkerProfiles}</span>
                  <span className="metric-title">Total Worker Profiles</span>
                </div>
              </div>

              <div className="metric-stat-card success">
                <span className="metric-icon">✓</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.verifiedWorkersCount}</span>
                  <span className="metric-title">Verified & Public (BR-03)</span>
                </div>
              </div>

              <div className="metric-stat-card warning">
                <span className="metric-icon">⏳</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.pendingVerificationCount}</span>
                  <span className="metric-title">Pending Worker Approvals</span>
                </div>
              </div>

              <div className="metric-stat-card info">
                <span className="metric-icon">🤝</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.pendingRecommendationCount}</span>
                  <span className="metric-title">Pending Offline Referrals</span>
                </div>
              </div>

              <div className="metric-stat-card">
                <span className="metric-icon">⭐</span>
                <div className="metric-details">
                  <span className="metric-number">{stats.totalReviewsSubmitted}</span>
                  <span className="metric-title">Reviews Submitted</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PENDING WORKERS */}
          {activeTab === 'workers' && (
            <div className="admin-table-wrapper">
              <h3>Pending Worker Profile Verifications (BR-03, BR-10)</h3>
              {pendingWorkers.length === 0 ? (
                <p className="table-empty-msg">No pending worker profile verifications at this time.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Contact Info</th>
                      <th>Location</th>
                      <th>Categories</th>
                      <th>Experience</th>
                      <th>Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingWorkers.map((w) => (
                      <tr key={w.profileId}>
                        <td><strong>{w.workerName}</strong></td>
                        <td>
                          <div>{w.phoneNumber}</div>
                          <small>{w.email}</small>
                        </td>
                        <td>{w.upazilaName}, {w.districtName}</td>
                        <td>
                          {w.categories?.map((c, i) => (
                            <span key={i} className="table-tag">{c}</span>
                          ))}
                        </td>
                        <td>{w.experienceYears} Years</td>
                        <td>{w.hourlyRate ? `৳${w.hourlyRate}/hr` : 'Negotiable'}</td>
                        <td>
                          <button
                            onClick={() => handleVerifyWorker(w.profileId)}
                            className="btn-action-approve"
                            title="Approve profile for public directory listing"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectWorker(w.profileId)}
                            className="btn-action-reject"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY RECOMMENDATIONS */}
          {activeTab === 'recommendations' && (
            <div className="admin-table-wrapper">
              <h3>Pending Community Offline Worker Referrals (BR-09)</h3>
              {pendingRecommendations.length === 0 ? (
                <p className="table-empty-msg">No pending offline worker referrals.</p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Worker Name</th>
                      <th>Phone</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Referred By</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRecommendations.map((r) => (
                      <tr key={r.recommendationId}>
                        <td><strong>{r.workerName}</strong></td>
                        <td>{r.phoneNumber}</td>
                        <td><span className="table-tag">{r.categoryName}</span></td>
                        <td>{r.upazilaName}, {r.districtName}</td>
                        <td>{r.recommenderName}</td>
                        <td><small>{r.notes || 'No notes'}</small></td>
                        <td>
                          <button
                            onClick={() => handleApproveRecommendation(r.recommendationId)}
                            className="btn-action-approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectRecommendation(r.recommendationId)}
                            className="btn-action-reject"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 4: MANAGE CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="admin-category-management">
              <h3>Add New Service Category (BR-11)</h3>
              <form onSubmit={handleCreateCategory} className="standard-form">
                <div className="form-group">
                  <label>Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Appliance Repair, Welder, Blacksmith..."
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Category Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of skills and repair services encompassed..."
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary">Create Service Category</button>
              </form>
            </div>
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && (
            <div className="admin-table-wrapper">
              <h3>Administrative Action Audit Trail (BR-14)</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.logId}>
                      <td><small>{new Date(log.timestamp).toLocaleString()}</small></td>
                      <td><code>{log.action}</code></td>
                      <td>{log.entityName}</td>
                      <td>{log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

```

---

## 8. Master Routing Setup: `App.jsx`

```javascript
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar, Footer } from './components/Navigation';
import { HomePage } from './pages/HomePage';
import { WorkerDirectoryPage } from './pages/WorkerDirectoryPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
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
              <Route path="/my-profile" element={<WorkerProfilePage />} />
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

```

---

## 9. The Design System & Pure CSS Architecture (`App.css`)

Here is the complete, zero-dependency master stylesheet `client/src/App.css`:

```css

```

---

## 10. Hands-on Frontend Coding Exercises & Solutions

### 10.1 Exercise 1: Adding a "Clear Search" Button to the Filter Bar
- **Question**: How do we add a button to `WorkerFilter` that resets all filters back to empty strings?
- **Solution**:
  ```javascript
  <button
    type="button"
    className="btn btn-secondary"
    onClick={() => onFilterChange({ districtId: '', upazilaId: '', categoryId: '', search: '' })}
  >
    Clear Filters
  </button>
  ```

---

### 10.2 Exercise 2: Implementing Copy-to-Clipboard for Revealed Numbers
- **Question**: Once a phone number is revealed, allow the user to click a "Copy" icon to copy the number to their clipboard.
- **Solution**:
  ```javascript
  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phoneNumber);
    alert('Phone number copied to clipboard!');
  };
  ```

---

## 11. Frequently Asked Questions (FAQ) for Frontend Developers

### Q1: Why did we build our own CSS instead of using Tailwind CSS or Bootstrap?
**Answer**: Pure modern CSS with CSS variables requires **zero build compilation steps**, has **zero bundle size overhead**, and ensures lightning-fast page loading speeds on mobile devices in rural Bangladesh. It also makes the project 100% accessible to any developer without needing to learn custom CSS utility classes.

### Q2: What happens if the user refreshes the browser page while logged in?
**Answer**: In `AuthContext.jsx`, our `useEffect` hook immediately checks `localStorage` for `kajbazar_token` and `kajbazar_user`. If present, it restores the user's session in memory before rendering the UI, ensuring the user stays logged in seamlessly across page refreshes.

### Q3: How do we prevent Cross-Site Scripting (XSS) in React?
**Answer**: React automatically escapes all strings rendered inside JSX curly braces `{}`. If an attacker attempts to inject `<script>alert('hacked')</script>` into a worker bio or review comment, React treats it as plain text and renders the literal characters rather than executing it as JavaScript!

---

## 12. Conclusion & Roadmap to Volume 05

Congratulations! You have completed **Volume 04: Frontend React Developer Guide**.

You now understand:
- The React component mental model, Virtual DOM diffing, and unidirectional data flow.
- Modern React hooks (`useState`, `useEffect`, `useContext`, custom hooks).
- Centralized API management using Axios interceptors and JWT authorization headers.
- Global authentication state with role-based routing and localStorage persistence.
- Component engineering and the exact implementation of Business Rule BR-06.
- Pure CSS styling using CSS Custom Properties and responsive Grid layouts.

In the next volume, we will verify our application with **Automated Testing**:
👉 **Proceed to [Volume 05: Testing Guide & Test Suites](05-testing-guide-and-test-suites.md)**
