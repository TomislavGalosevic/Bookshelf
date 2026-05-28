import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import Shelf from './pages/Shelf';
import Profile from './pages/Profile';
import './index.css';

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="loading-center" style={{ minHeight: '60vh' }}>
        <div className="spinner"></div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Loading...</span>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
};

// Public-only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/shelf" replace />;
};

const AppRoutes = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
      <Route path="/shelf" element={<ProtectedRoute><Shelf /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e1c18',
            color: '#f5f0e8',
            border: '1px solid rgba(201, 150, 58, 0.2)',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.875rem',
          },
          success: {
            iconTheme: { primary: '#c9963a', secondary: '#0f0e0c' }
          }
        }}
      />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
