# Volume 04: Frontend React.js & Vite Developer Guide
## The Complete Handbook for the KajBazar User Interface

---

## 📖 Introduction: The Face of the Platform

If the backend server is the engine and the database is the fuel tank, then the **Frontend** is the steering wheel, dashboard, leather seats, and windshield. It is the only part of your application that everyday humans actually see, touch, and experience.

In this volume, we will break down the **React 18 Single Page Application (SPA)** that powers KajBazar. We will explain how React works, explore modern Vite tooling, understand global state management via the Context API, examine responsive UI components, and trace how API calls are made and rendered in the browser.

---

## 📑 Table of Contents

1. [React 18 & Modern Web Development for Beginners](#1-react-18--modern-web-development-for-beginners)
   - 1.1 What is a Single Page Application (SPA)?
   - 1.2 What is JSX? (HTML Inside JavaScript)
   - 1.3 State vs. Props: The Core React Concepts
   - 1.4 The Essential React Hooks Explained Simply (`useState`, `useEffect`, `useContext`, `useNavigate`)
   - 1.5 Why We Use Vite Instead of Old Create-React-App
2. [Frontend Project Structure Walkthrough](#2-frontend-project-structure-walkthrough)
   - 2.1 File Map of `client/`
   - 2.2 Entry Points: `index.html` and `src/index.jsx`
   - 2.3 Routing Architecture: `App.jsx` with React Router DOM v6
3. [Global State & Authentication: `AuthContext.jsx`](#3-global-state--authentication-authcontextjsx)
   - 3.1 Why Global State is Necessary
   - 3.2 Persistent Login via `localStorage`
   - 3.3 The Context Provider & Custom Hook (`useAuth`)
   - 3.4 Role-Based Guarding: Showing Different Views to Consumers vs. Admins
4. [Centralized HTTP Client: `services/api.js`](#4-centralized-http-client-servicesapijs)
   - 4.1 What is Axios?
   - 4.2 The Automatic JWT Bearer Request Interceptor
   - 4.3 Error Handling and Auto-Logout Interceptor
   - 4.4 Full API Service Catalog
5. [Key UI Components Deep Dive with Full Source Code](#5-key-ui-components-deep-dive-with-full-source-code)
   - 5.1 `Navigation.jsx`: Dynamic Top Bar with Role Indicators
   - 5.2 `WorkerCard`: Profile Cards & The Direct Phone Reveal Button (`BR-06`)
   - 5.3 `WorkerFilter`: Multi-Select District, Upazila & Category Dropdowns (`BR-05`)
   - 5.4 `WorkerDetailModal`: Reviews List & Star Rating Submission Form (`BR-07`, `BR-08`)
6. [Page-by-Page Feature Walkthrough](#6-page-by-page-feature-walkthrough)
   - 6.1 `HomePage.jsx`: Hero Search, Live Counters, Category Showcase
   - 6.2 `WorkerDirectoryPage.jsx`: Real-Time Directory with Instant Filtering
   - 6.3 `RecommendWorkerPage.jsx`: Offline Worker Referral Form (`BR-09`)
   - 6.4 `LoginPage.jsx` & `RegisterPage.jsx`: Account Creation & Authentication
   - 6.5 `AdminDashboardPage.jsx`: 5-Tab Operational Command Center
7. [Styling & Design System: `App.css`](#7-styling--design-system-appcss)
   - 7.1 Modern CSS Variables (Colors, Spacing, Shadows, Radii)
   - 7.2 Responsive Layout with CSS Grid & Flexbox
   - 7.3 Mobile-First Media Queries
8. [Building for Production (`npm run build`)](#8-building-for-production-npm-run-build)
9. [Conclusion & Next Steps](#9-conclusion--next-steps)

---

## 1. React 18 & Modern Web Development for Beginners

### 1.1 What is a Single Page Application (SPA)?
In old-school websites from the 1990s and 2000s, every time you clicked a link:
1. The entire screen flashed white.
2. The browser threw away everything in memory.
3. The server generated a brand-new HTML page from scratch and sent it over the wire.
4. The browser re-downloaded images, stylesheets, and scripts all over again.

In a **Single Page Application (SPA)** like KajBazar:
- The browser downloads one single HTML shell (`index.html`) on your first visit.
- When you click "Find Workers" or "Admin Dashboard", **no full page reload happens**!
- JavaScript simply swaps the components on your screen in a split-second. The user experiences an app as fluid and snappy as a native mobile application.

### 1.2 What is JSX? (HTML Inside JavaScript)
Traditionally, developers kept HTML and JavaScript in separate files. React combines them into **JSX (JavaScript XML)**:
```jsx
function WelcomeBanner({ userName }) {
  return (
    <div className="banner">
      <h2>Welcome back, {userName}!</h2>
      <p>Find trusted local skilled workers across Bangladesh.</p>
    </div>
  );
}
```
Inside `{}` curly braces, you can write any valid JavaScript expression (variables, mathematical calculations, loops, conditional ternaries).

### 1.3 State vs. Props: The Core React Concepts
- **`props` (Inputs passed from outside)**: Think of props like arguments to a function. A parent component passes props down to a child component. Props are read-only.
- **`state` (Memory held inside the component)**: Think of state like a component's personal notebook. When the state changes (e.g. the user selects "Dumki"), React automatically re-draws the screen to reflect the change.

### 1.4 The Essential React Hooks Explained Simply
1. **`useState(initialValue)`**: Creates a piece of state. Returns `[value, setValue]`. Whenever you call `setValue(newValue)`, React re-renders the component with the new value.
2. **`useEffect(callback, dependencies)`**: Runs code *after* the component has rendered. Perfect for fetching data from the backend API:
   ```jsx
   useEffect(() => {
     api.get('/categories').then(res => setCategories(res.data));
   }, []); // Empty array means: run once when page loads!
   ```
3. **`useContext(Context)`**: Allows any component anywhere in the tree to read global values (like the logged-in user) without passing props through 10 intermediate components.
4. **`useNavigate()`**: Programmatically redirects the user to a new URL (e.g. sending them to the login page after logging out).

### 1.5 Why We Use Vite Instead of Old Create-React-App
Older React projects used Create-React-App (Webpack). Webpack bundled hundreds of files before starting, taking 30 to 60 seconds just to start the local development server.

**Vite** is powered by native browser ES Modules and `esbuild` (written in Golang):
- Starts the development server in under **200 milliseconds**!
- Instant Hot Module Replacement (HMR): When you edit a line of CSS or JSX, Vite updates that specific component in your browser in 50 milliseconds without losing your page state!
- Production build finishes in ~1 second.

---

## 2. Frontend Project Structure Walkthrough

### 2.1 File Map of `client/`
```
client/
├── index.html                  # HTML entry template
├── package.json                # Dependencies and build scripts
├── vite.config.js              # Vite configuration & React plugin
└── src/
    ├── index.jsx               # React 18 DOM mount point
    ├── App.jsx                 # Routing and layout master wrapper
    ├── context/
    │   └── AuthContext.jsx     # Global user session & JWT storage
    ├── services/
    │   └── api.js              # Axios HTTP client with Bearer interceptor
    ├── components/
    │   ├── Navigation.jsx      # Top navigation header
    │   └── WorkerComponents.jsx# WorkerCard, WorkerFilter, DetailModal
    ├── pages/
    │   ├── HomePage.jsx        # Landing page
    │   ├── WorkerDirectoryPage.jsx # Worker search directory
    │   ├── WorkerProfilePage.jsx   # Individual worker view
    │   ├── RecommendWorkerPage.jsx # Community nomination form
    │   └── AuthAndAdminPages.jsx   # Login, Register, Admin Dashboard
    └── styles/
        └── App.css             # Unified CSS design system
```

---

## 3. Global State & Authentication: `AuthContext.jsx`

### 3.1 Why Global State is Necessary
When a user logs in on `/login`, how does the `<Navigation />` component know to show their name instead of "Login"? How does the `<WorkerCard />` know whether to enable the "Write Review" button?
Without global state, you would have to pass user info through 10 layers of components (called "prop drilling").

### 3.2 Persistent Login via `localStorage`
When the backend returns a JWT token, we save the token and user object into browser `localStorage`. When the user closes the browser tab and returns tomorrow, our app reads `localStorage` and automatically restores their logged-in session!

### 3.3 Full Source Code of `AuthContext.jsx`:
```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on app launch
    const savedToken = localStorage.getItem('kajbazar_token');
    const savedUser = localStorage.getItem('kajbazar_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('kajbazar_token', authToken);
    localStorage.setItem('kajbazar_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('kajbazar_token');
    localStorage.removeItem('kajbazar_user');
  };

  const hasRole = (role) => {
    return user && user.role && user.role.toLowerCase() === role.toLowerCase();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAuthenticated: !!token }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook for instant access anywhere in the app
export const useAuth = () => useContext(AuthContext);
```

---

## 4. Centralized HTTP Client: `services/api.js`

### 4.1 What is Axios?
Axios is a promise-based HTTP client for JavaScript. It simplifies sending GET, POST, PUT, and DELETE requests, and automatically parses JSON responses.

### 4.2 Full Source Code of `api.js`:
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Automatically inject JWT token into outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kajbazar_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('kajbazar_token');
      localStorage.removeItem('kajbazar_user');
    }
    return Promise.reject(error);
  }
);

export const getCategoriesApi = () => api.get('/categories');
export const getDistrictsApi = () => api.get('/geography/districts');
export const getUpazilasApi = (districtId) => api.get(`/geography/districts/${districtId}/upazilas`);
export const searchWorkersApi = (params) => api.get('/workers/search', { params });
export const getWorkerByIdApi = (id) => api.get(`/workers/${id}`);
export const submitReviewApi = (data) => api.post('/reviews', data);
export const submitRecommendationApi = (data) => api.post('/recommendations', data);
export const loginApi = (data) => api.post('/auth/login', data);
export const registerApi = (data) => api.post('/auth/register', data);
export const getAdminStatsApi = () => api.get('/admin/stats');
export const getPendingWorkersApi = () => api.get('/admin/workers/pending');
export const verifyWorkerApi = (profileId) => api.put(`/admin/workers/${profileId}/verify`);

export default api;
```

---

## 5. Key UI Components Deep Dive with Full Source Code

### 5.1 `Navigation.jsx`
Displays the brand logo, primary links, and dynamic actions based on user authentication and role:
- If logged in as **Admin**, shows an extra glowing badge link: **"Admin Dashboard"**.
- If logged in, shows user's name and a **"Logout"** button.
- If guest, shows **"Log In"** and **"Register"** buttons.

### 5.2 `WorkerCard.jsx` & Phone Number Reveal (`BR-06`)
In Bangladesh, workers do not want complicated in-app messaging apps that require mobile data. They want direct telephone calls.

```jsx
export function WorkerCard({ worker, onSelect }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="worker-card">
      <div className="worker-header">
        <h3>{worker.workerName}</h3>
        <span className="rating-badge">★ {worker.averageRating.toFixed(1)} ({worker.totalReviews})</span>
      </div>

      <p className="worker-location">📍 {worker.upazilaName}, {worker.districtName}</p>
      
      <div className="categories-list">
        {worker.categories.map((c, i) => (
          <span key={i} className="category-tag">{c}</span>
        ))}
      </div>

      <div className="worker-footer">
        <div className="rate-info">
          <span className="rate-amount">{worker.hourlyRate} BDT</span>
          <span className="rate-unit">/ hr</span>
        </div>

        {revealed ? (
          <a href={`tel:${worker.phoneNumber}`} className="btn-call-active">
            📞 {worker.phoneNumber}
          </a>
        ) : (
          <button onClick={() => setRevealed(true)} className="btn-reveal-call">
            📞 Contact Worker
          </button>
        )}
      </div>
    </div>
  );
}
```
*Notice: When clicked, the button changes to a direct `tel:` mobile phone link!*

---

## 6. Page-by-Page Feature Walkthrough

### 6.1 `HomePage.jsx`
- **Hero Section**: Large search banner with immediate calls to action.
- **Platform Counter Badges**: Displays real-time database counts:
  - Total Verified Service Providers
  - Total Districts & Upazilas Covered
  - Customer Reviews Written
- **Category Grid**: Instant one-click shortcuts to popular trades (Electrical, Plumbing, Appliance Repair, Carpentry, Painting).

### 6.2 `WorkerDirectoryPage.jsx`
- The core marketplace directory.
- Features the multi-column filter on the left (or top on mobile).
- Displays grid of verified worker cards matching the search criteria.
- Shows instant empty state when no workers match: *"No verified workers found in this area. Try adjusting your filters."*

### 6.3 `RecommendWorkerPage.jsx` (`BR-09`)
- Many elderly, highly-skilled tradespeople in rural Bangladesh do not have smartphones.
- Any registered community member can recommend an offline worker by providing their name, trade, phone number, and location.
- Submissions enter the Admin Review queue.

### 6.5 `AdminDashboardPage.jsx`
A complete administrative control center with 5 interactive tabs:
1. **Overview**: Key platform metrics and activity graphs.
2. **Worker Approvals (`BR-10`)**: Pending worker profiles awaiting admin verification. Admins can inspect National ID numbers, review work history, and click **"Approve & Verify"** or **"Reject"**.
3. **Offline Recommendations**: Community-submitted workers awaiting admin phone calls. Admins can update status to *CONTACTED* or *ONBOARDED*.
4. **Taxonomy Management (`BR-11`)**: Create new service categories, districts, and upazilas on the fly.
5. **System Audit Trail (`BR-14`)**: Real-time table of all administrative actions with timestamps and IP addresses.

---

## 7. Styling & Design System: `App.css`

KajBazar uses a modern, zero-dependency, pure CSS design system defined in [`src/styles/App.css`](file:///home/noir/Desktop/PROJECTS/Kajbazar/client/src/styles/App.css).

### 7.1 Modern CSS Variables
```css
:root {
  --primary: #0284c7;        /* Energetic sky blue */
  --primary-hover: #0369a1;
  --secondary: #0f172a;      /* Deep slate */
  --accent: #f59e0b;         /* Gold star rating */
  --success: #10b981;        /* Verified emerald badge */
  --danger: #ef4444;         /* Suspended / Alert */
  --bg-main: #f8fafc;        /* Crisp modern background */
  --bg-card: #ffffff;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### 7.2 Mobile-First Responsive Breakpoints
Our CSS uses clean CSS Grid that automatically collapses on smaller screens:
```css
.worker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    gap: 1rem;
  }
  .filter-container {
    grid-template-columns: 1fr;
  }
}
```

---

## 8. Building for Production (`npm run build`)

To compile the React application into optimized static HTML, JavaScript, and CSS bundles:

```bash
cd client
npm run build
```

Vite creates a `dist/` directory containing minified, tree-shaken, production-ready assets:
```
dist/
├── index.html                  (0.45 kB)
├── assets/
│   ├── index-Dk39fA.css        (12.30 kB │ gzip: 3.10 kB)
│   └── index-B82kL9.js         (194.20 kB │ gzip: 61.40 kB)
```
These static files can be served directly by Nginx, Cloudflare, or AWS S3 at lightning speed.

---

## 9. Conclusion & Next Steps

You now know how the entire frontend user interface is structured and how it interacts with the backend.

Next, let's explore how we test every feature to guarantee zero bugs and rock-solid reliability:
👉 **[Volume 05: Testing Guide & Test Suites](05-testing-guide-and-test-suites.md)**
