import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to={user ? '/shelf' : '/'} className="navbar-logo">
          <span className="logo-icon">⬡</span>
          <span className="logo-text">BookShelf</span>
        </Link>

        {user ? (
          <>
            <div className="navbar-links">
              <Link to="/search" className={`nav-link ${isActive('/search') ? 'active' : ''}`}>Otkrij</Link>
              <Link to="/shelf" className={`nav-link ${isActive('/shelf') ? 'active' : ''}`}>Moja polica</Link>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Profil</Link>
            </div>
            <div className="navbar-actions">
              <span className="nav-user">
                <span className="nav-avatar">{user.name.charAt(0).toUpperCase()}</span>
                <span className="nav-name">{user.name.split(' ')[0]}</span>
              </span>
              <button onClick={handleLogout} className="btn btn-ghost btn-sm">Odjava</button>
            </div>
            <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Izbornik">
              <span></span><span></span><span></span>
            </button>
            {menuOpen && (
              <div className="mobile-menu">
                <Link to="/search" onClick={() => setMenuOpen(false)} className="mobile-link">Otkrij</Link>
                <Link to="/shelf" onClick={() => setMenuOpen(false)} className="mobile-link">Moja polica</Link>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="mobile-link">Profil</Link>
                <button onClick={handleLogout} className="mobile-link mobile-logout">Odjava</button>
              </div>
            )}
          </>
        ) : (
          <div className="navbar-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Prijava</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Registracija</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
