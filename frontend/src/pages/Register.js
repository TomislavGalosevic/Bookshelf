import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Lozinka mora imati najmanje 6 znakova.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      toast.success('Dobrodošao na BookShelf! 📚');
      navigate('/shelf');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registracija neuspješna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-logo">⬡</div>
          <h2>Kreiraj svoju policu</h2>
          <p>Počni pratiti svoje čitanje</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Ime i prezime</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              className="form-input" placeholder="Ivan Horvat" required autoComplete="name" />
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="form-input" placeholder="ti@primjer.com" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Lozinka</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="form-input" placeholder="Najmanje 6 znakova" required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Kreiraj račun'}
          </button>
        </form>

        <p className="auth-footer">
          Već imaš račun?{' '}
          <Link to="/login" className="auth-link">Prijavi se</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
