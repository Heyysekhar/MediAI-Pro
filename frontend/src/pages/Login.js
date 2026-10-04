import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaHeartbeat } from 'react-icons/fa';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(form.email, form.password);
    setLoading(false);
    if (res.success) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 56, marginBottom: 8 }}>🏥</div>
          <h1>MediAI Pro</h1>
          <p>AI-Powered Healthcare System</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">📧 Email Address</label>
            <input
              type="email" className="form-input" placeholder="doctor@hospital.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
            />
          </div>
          <div className="form-group">
            <label className="form-label">🔒 Password</label>
            <input
              type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Logging in...' : '🚀 Login to Dashboard'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 700 }}>Register here</Link>
        </div>

        {/* Demo credentials */}
        <div style={{ marginTop: 20, padding: 16, background: '#f0f9ff', borderRadius: 8, fontSize: 12 }}>
          <strong>🧪 Demo Credentials:</strong><br />
          Patient: patient@demo.com / demo123<br />
          Doctor: doctor@demo.com / demo123<br />
          Admin: admin@demo.com / demo123
        </div>
      </div>
    </div>
  );
}
