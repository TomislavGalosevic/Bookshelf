import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import './Search.css';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [adding, setAdding] = useState({});

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    try {
      const res = await api.get(`/books/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.books);
      setSearched(true);
    } catch (err) {
      toast.error('Pretraživanje neuspješno. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  const addToShelf = async (book, status) => {
    const key = `${book.google_books_id}-${status}`;
    setAdding(p => ({ ...p, [key]: true }));
    try {
      await api.post('/books', { ...book, status });
      const labels = { want_to_read: 'Želim pročitati', reading: 'Čitam', finished: 'Pročitano' };
      toast.success(`Dodano u "${labels[status]}"!`);
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg?.includes('already')) toast('Već je na tvojoj polici!', { icon: '📚' });
      else toast.error(msg || 'Dodavanje neuspješno.');
    } finally {
      setAdding(p => ({ ...p, [key]: false }));
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <div className="search-header fade-up">
          <div className="gold-line"></div>
          <h1>Otkrij knjige</h1>
          <p>Pretraži milijune knjiga putem Google Books</p>
        </div>

        <form onSubmit={handleSearch} className="search-bar-wrap fade-up">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Pretraži po naslovu, autoru ili ISBN-u..."
              className="search-input"
              autoFocus
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '...' : 'Pretraži'}
            </button>
          </div>
        </form>

        {loading && (
          <div className="loading-center">
            <div className="spinner"></div>
            <span>Pretraživanje knjiga...</span>
          </div>
        )}

        {searched && !loading && results.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>Nema rezultata</h3>
            <p>Pokušaj s drugačijim pojmom pretrage</p>
          </div>
        )}

        {results.length > 0 && !loading && (
          <div className="search-results fade-up">
            <p className="results-count">{results.length} rezultata za "<strong>{query}</strong>"</p>
            <div className="results-list">
              {results.map((book, i) => (
                <div key={book.google_books_id || i} className="result-card card" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="result-cover">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} loading="lazy" />
                    ) : (
                      <div className="result-cover-placeholder">📖</div>
                    )}
                  </div>
                  <div className="result-info">
                    <h3 className="result-title">{book.title}</h3>
                    <p className="result-author">{book.author}</p>
                    {(book.published_year || book.page_count || book.genre) && (
                      <div className="result-meta">
                        {book.published_year && <span>{book.published_year}</span>}
                        {book.page_count && <span>{book.page_count} stranica</span>}
                        {book.genre && <span>{book.genre.split(',')[0]}</span>}
                      </div>
                    )}
                    {book.description && (
                      <p className="result-desc">{book.description.substring(0, 180)}...</p>
                    )}
                    <div className="result-actions">
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => addToShelf(book, 'want_to_read')}
                        disabled={adding[`${book.google_books_id}-want_to_read`]}>
                        🔖 Želim pročitati
                      </button>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => addToShelf(book, 'reading')}
                        disabled={adding[`${book.google_books_id}-reading`]}>
                        📖 Čitam
                      </button>
                      <button className="btn btn-primary btn-sm"
                        onClick={() => addToShelf(book, 'finished')}
                        disabled={adding[`${book.google_books_id}-finished`]}>
                        ✅ Pročitano
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div className="search-suggestions">
            <p>Popularne pretrage:</p>
            <div className="suggestion-tags">
              {['Dostojevski', 'Sapiens', 'Harry Potter', 'Dune', 'Atomske navike', 'Alkeničar'].map(s => (
                <button key={s} className="suggestion-tag" onClick={() => setQuery(s)}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
