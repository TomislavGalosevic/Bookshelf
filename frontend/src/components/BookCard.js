import React, { useState } from 'react';
import './BookCard.css';

const STATUS_LABELS = {
  reading: 'Čitam',
  finished: 'Pročitano',
  want_to_read: 'Želim pročitati',
};

const STATUS_ICONS = {
  reading: '📖',
  finished: '✅',
  want_to_read: '🔖',
};

const Stars = ({ rating, onRate }) => (
  <div className="stars">
    {[1, 2, 3, 4, 5].map(n => (
      <span
        key={n}
        className={`star ${rating >= n ? 'filled' : ''}`}
        onClick={() => onRate && onRate(n)}
        title={`${n} zvjezdic${n === 1 ? 'a' : n < 5 ? 'e' : 'a'}`}
      >★</span>
    ))}
  </div>
);

const BookCard = ({ book, onUpdate, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(book.status);
  const [notes, setNotes] = useState(book.notes || '');
  const [pageCount, setPageCount] = useState(book.page_count || '');
  const [saving, setSaving] = useState(false);

  const coverSrc = book.custom_cover
    ? `${process.env.REACT_APP_API_URL?.replace('/api', '') || ''}/uploads/${book.custom_cover.split('/uploads/')[1] || book.custom_cover}`
    : book.cover_url;

  const handleSave = async () => {
    setSaving(true);
    await onUpdate(book.id, { status, notes, page_count: pageCount ? parseInt(pageCount) : null });
    setSaving(false);
    setEditing(false);
  };

  const handleRate = (rating) => {
    onUpdate(book.id, { rating, status: book.status });
  };

  return (
    <div
      className="book-card fade-up"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => { setShowActions(false); setEditing(false); }}
    >
      <div className="book-cover-wrap">
        {coverSrc ? (
          <img src={coverSrc} alt={book.title} className="book-cover" loading="lazy" />
        ) : (
          <div className="book-cover-placeholder">
            <span>📖</span>
            <span className="placeholder-title">{book.title.substring(0, 30)}</span>
          </div>
        )}
        <div className={`book-overlay ${showActions ? 'visible' : ''}`}>
          {!editing ? (
            <div className="overlay-actions">
              <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>
                ✏️ Uredi
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => onDelete(book.id)}>
                🗑️ Ukloni
              </button>
            </div>
          ) : (
            <div className="edit-panel">
              <p className="edit-label">Status</p>
              <div className="status-buttons">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    className={`status-btn ${status === key ? 'active' : ''}`}
                    onClick={() => setStatus(key)}
                  >
                    {STATUS_ICONS[key]} {label}
                  </button>
                ))}
              </div>
              <p className="edit-label" style={{ marginTop: '0.5rem' }}>Ocjena</p>
              <Stars rating={book.rating} onRate={handleRate} />
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Bilješke..."
                className="form-input"
                rows={2}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem', resize: 'none', marginTop: '0.5rem' }}
              />
              <input
                type="number"
                value={pageCount}
                onChange={e => setPageCount(e.target.value)}
                placeholder="Broj stranica..."
                className="form-input"
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.6rem', marginTop: '0.3rem' }}
              />
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving} style={{ flex: 1 }}>
                  {saving ? '...' : '💾 Spremi'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>✕</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="book-info">
        <div className={`status-badge status-${book.status}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', marginBottom: '0.35rem' }}>
          {STATUS_ICONS[book.status]} {STATUS_LABELS[book.status]}
        </div>
        <h4 className="book-title">{book.title}</h4>
        <p className="book-author">{book.author}</p>
        <Stars rating={book.rating} onRate={handleRate} />
      </div>
    </div>
  );
};

export default BookCard;