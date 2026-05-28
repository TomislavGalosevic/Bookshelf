import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import BookCard from '../components/BookCard';
import './Shelf.css';

const FILTERS = [
  { key: 'all', label: 'Sve knjige', icon: '📚' },
  { key: 'reading', label: 'Čitam', icon: '📖' },
  { key: 'finished', label: 'Pročitano', icon: '✅' },
  { key: 'want_to_read', label: 'Želim pročitati', icon: '🔖' },
];

const ShelfPage = () => {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchBooks = useCallback(async () => {
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const res = await api.get(`/books${params}`);
      setBooks(res.data.books);
    } catch {
      toast.error('Učitavanje neuspješno.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/books/stats');
      setStats(res.data);
    } catch {}
  };

  useEffect(() => { setLoading(true); fetchBooks(); }, [fetchBooks]);
  useEffect(() => { fetchStats(); }, [books]);

  const handleUpdate = async (id, data) => {
    try {
      const res = await api.put(`/books/${id}`, data);
      setBooks(prev => prev.map(b => b.id === id ? res.data.book : b));
      toast.success('Spremljeno!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ažuriranje neuspješno.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Ukloniti ovu knjigu s police?')) return;
    try {
      await api.delete(`/books/${id}`);
      setBooks(prev => prev.filter(b => b.id !== id));
      toast.success('Knjiga uklonjena.');
    } catch {
      toast.error('Uklanjanje neuspješno.');
    }
  };

  return (
    <div className="shelf-page">
      <div className="container">
        {stats && (
          <div className="stats-bar fade-up">
            {[
              { label: 'Ukupno', value: stats.total, icon: '📚' },
              { label: 'Čitam', value: stats.reading, icon: '📖' },
              { label: 'Pročitano', value: stats.finished, icon: '✅' },
              { label: 'Stranica', value: stats.total_pages?.toLocaleString() || 0, icon: '📄' },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-icon">{s.icon}</span>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="shelf-header fade-up">
          <div>
            <div className="gold-line" style={{ marginBottom: '0.75rem' }}></div>
            <h1>Moja polica</h1>
          </div>
          <Link to="/search" className="btn btn-primary btn-sm">+ Dodaj knjige</Link>
        </div>

        <div className="filter-tabs fade-up">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`filter-tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              <span>{f.icon}</span>
              <span>{f.label}</span>
              {stats && (
                <span className="filter-count">
                  {f.key === 'all' ? stats.total : stats[f.key] || 0}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <span>Učitavanje police...</span>
          </div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>
              {filter === 'all' ? 'Tvoja polica je prazna' :
               filter === 'reading' ? 'Trenutno ne čitaš ništa' :
               filter === 'finished' ? 'Još nisi ništa pročitao' :
               'Nema knjiga na listi'}
            </h3>
            <p style={{ marginBottom: '1.5rem' }}>Dodaj knjige putem stranice za otkrivanje.</p>
            <Link to="/search" className="btn btn-primary">Otkrij knjige</Link>
          </div>
        ) : (
          <div className="books-grid fade-up">
            {books.map(book => (
              <BookCard
                key={book.id}
                book={book}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShelfPage;
