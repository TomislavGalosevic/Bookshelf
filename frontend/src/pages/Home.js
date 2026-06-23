import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-eyebrow">
            <span className="eyebrow-line"></span>
            <span>Tvoj osobni čitački dnevnik</span>
          </div>
          <h1 className="hero-title">
            Svaka knjiga koju si<br />
            <em>ikad volio,</em><br />
            na jednom mjestu.
          </h1>
          <p className="hero-subtitle">
            Prati svoje čitanje. Otkrivaj nove svjetove. Izgradi svoju osobnu knjižnicu.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/shelf" className="btn btn-primary">Moja polica →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Počni čitati</Link>
                <Link to="/login" className="btn btn-ghost">Prijavi se</Link>
              </>
            )}
          </div>
        </div>
        <div className="hero-books">
          {['📗', '📘', '📕', '📙', '📒'].map((emoji, i) => (
            <div key={i} className="floating-book" style={{ animationDelay: `${i * 0.4}s` }}>
              {emoji}
            </div>
          ))}
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="section-header">
            <div className="gold-line"></div>
            <h2>Sve što ti treba</h2>
            <p>Kompletno iskustvo čitanja u jednoj aplikaciji.</p>
          </div>
          <div className="features-grid">
            {[
              { icon: '🔍', title: 'Otkrivaj knjige', desc: 'Pretraži milijune knjiga putem Google Books API-ja. Pronađi svoju sljedeću omiljenu lektiru.' },
              { icon: '📚', title: 'Prati napredak', desc: 'Organiziraj knjige u "Čitam", "Pročitano" i "Želim pročitati" police.' },
              { icon: '⭐', title: 'Ocijeni i bilježi', desc: 'Ostavi osobne bilješke i ocjene. Izgradi svoju književnu memoriju.' },
              { icon: '📊', title: 'Statistike čitanja', desc: 'Vidi koliko si knjiga i stranica pročitao na jednom mjestu.' },
              { icon: '🔐', title: 'Sigurni račun', desc: 'Tvoji podaci su zaštićeni JWT autentikacijom i šifriranim lozinkama.' },
              { icon: '📱', title: 'Responzivni dizajn', desc: 'Radi savršeno na mobitelu, tabletu i računalu.' },
            ].map((f, i) => (
              <div key={i} className="feature-card card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Spreman za svoju policu?</h2>
          <p>Pridruži se tisućama čitatelja koji prate svoje književno putovanje.</p>
          {!user && (
            <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '0.85rem 2rem' }}>
              Kreiraj svoju policu →
            </Link>
          )}
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-logo">
            <span style={{ color: 'var(--gold)' }}>⬡</span> BookShelf
          </div>
          <p className="footer-copy">Napravljeno s ljubavlju za čitatelje.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
