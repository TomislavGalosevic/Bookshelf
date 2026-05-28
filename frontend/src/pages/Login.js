import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Dobrodošao natrag, ${res.data.user.name.split(' ')[0]}!`);
      navigate('/shelf');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Prijava neuspješna.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card card fade-up">
        <div className="auth-header">
          <div className="auth-logo">⬡</div>
          <h2>Dobrodošao natrag</h2>
          <p>Prijavi se na svoj BookShelf</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" name="email" value={form.email} onChange={handleChange}
              className="form-input" placeholder="ti@primjer.com" required autoComplete="email" />
          </div>
          <div className="form-group">
            <label className="form-label">Lozinka</label>
            <input type="password" name="password" value={form.password} onChange={handleChange}
              className="form-input" placeholder="••••••••" required autoComplete="current-password" />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> : 'Prijava'}
          </button>
        </form>

        <p className="auth-footer">
          Nemaš račun?{' '}
          <Link to="/register" className="auth-link">Registriraj se</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
