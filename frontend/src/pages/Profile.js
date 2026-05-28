import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBooks, setRecentBooks] = useState([]);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, booksRes] = await Promise.all([
          api.get('/books/stats'),
          api.get('/books?status=finished')
        ]);
        setStats(statsRes.data);
        setRecentBooks(booksRes.data.books.slice(0, 5));
      } catch {}
    };
    fetchData();
  }, []);

  const handleSaveName = async () => {
    if (!name.trim() || name === user.name) { setEditingName(false); return; }
    setSaving(true);
    try {
      const res = await api.put('/users/profile', { name });
      updateUser(res.data.user);
      toast.success('Ime ažurirano!');
      setEditingName(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ažuriranje neuspješno.');
    } finally {
      setSaving(false);
    }
  };

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('hr-HR', { month: 'long', year: 'numeric' })
    : '';

  const STATUS_HR = { reading: 'Čitam', finished: 'Pročitano', want_to_read: 'Želim pročitati' };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-grid">
          <div className="profile-left">
            <div className="profile-avatar-card card fade-up">
              <div className="profile-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="profile-identity">
                {editingName ? (
                  <div className="name-edit">
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      className="form-input" style={{ textAlign: 'center', fontSize: '1rem' }}
                      onKeyDown={e => e.key === 'Enter' && handleSaveName()} autoFocus />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={handleSaveName} disabled={saving}>
                        {saving ? '...' : 'Spremi'}
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setName(user.name); setEditingName(false); }}>
                        Odustani
                      </button>
                    </div>
                  </div>
                ) : (
                  <h2 className="profile-name" onClick={() => setEditingName(true)} title="Klikni za uređivanje">
                    {user?.name}
                    <span className="edit-hint">✏️</span>
                  </h2>
                )}
                <p className="profile-email">{user?.email}</p>
                <p className="profile-joined">Član od {joinDate}</p>
              </div>
            </div>

            {stats && (
              <div className="quick-stats card fade-up">
                <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  Statistike čitanja
                </h3>
                {[
                  { label: 'Knjige u knjižnici', value: stats.total, color: 'var(--text-primary)' },
                  { label: 'Trenutno čitam', value: stats.reading, color: 'var(--status-reading)' },
                  { label: 'Pročitano knjiga', value: stats.finished, color: 'var(--status-finished)' },
                  { label: 'Želim pročitati', value: stats.want_to_read, color: 'var(--status-want)' },
                  { label: 'Pročitano stranica', value: stats.total_pages?.toLocaleString(), color: 'var(--gold)' },
                  { label: 'Prosječna ocjena', value: stats.avg_rating ? `${stats.avg_rating} ★` : '—', color: 'var(--gold)' },
                ].map(s => (
                  <div key={s.label} className="quick-stat-row">
                    <span className="qs-label">{s.label}</span>
                    <span className="qs-value" style={{ color: s.color }}>{s.value ?? 0}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="profile-right">
            <div className="card fade-up" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Nedavno pročitano</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{recentBooks.length} knjiga</span>
              </div>

              {recentBooks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📚</p>
                  <p>Još nema pročitanih knjiga</p>
                </div>
              ) : (
                <div className="recent-books">
                  {recentBooks.map(book => {
                    const cover = book.custom_cover || book.cover_url;
                    return (
                      <div key={book.id} className="recent-book">
                        <div className="recent-cover">
                          {cover ? <img src={cover} alt={book.title} /> : <div className="recent-cover-placeholder">📖</div>}
                        </div>
                        <div className="recent-info">
                          <p className="recent-title">{book.title}</p>
                          <p className="recent-author">{book.author}</p>
                          {book.rating && (
                            <div className="stars" style={{ fontSize: '0.75rem' }}>
                              {[1,2,3,4,5].map(n => (
                                <span key={n} className={`star ${book.rating >= n ? 'filled' : ''}`}>★</span>
                              ))}
                            </div>
                          )}
                          {book.notes && (
                            <p className="recent-notes">"{book.notes.substring(0, 80)}{book.notes.length > 80 ? '...' : ''}"</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {stats && stats.finished > 0 && (
              <div className="achievement-card card fade-up">
                <div className="achievement-icon">🏆</div>
                <div>
                  <h3>Odličan napredak!</h3>
                  <p>Pročitao si <strong style={{ color: 'var(--gold)' }}>{stats.finished} knjigu</strong> i otprilike <strong style={{ color: 'var(--gold)' }}>{stats.total_pages?.toLocaleString()} stranica</strong>. Samo nastavi!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
