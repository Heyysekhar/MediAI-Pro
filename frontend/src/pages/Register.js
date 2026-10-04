import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'patient', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register({
      ...form,
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
    });
    setLoading(false);
    if (res.success) navigate('/login');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏥</div>
          <h1>Create Account</h1>
          <p>Join MediAI Pro Healthcare Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">👤 Full Name</label>
            <input type="text" className="form-input" placeholder="Dr. John Doe"
              value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">📧 Email</label>
            <input type="email" className="form-input" placeholder="john@example.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">📱 Phone</label>
            <input type="tel" className="form-input" placeholder="+91 9876543210"
              value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">🔒 Password</label>
            <input type="password" className="form-input" placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
          </div>
          <div className="form-group">
            <label className="form-label">🎭 Register As</label>
            <select className="form-input form-select" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="patient">🤒 Patient</option>
              <option value="doctor">👨‍⚕️ Doctor</option>
              <option value="admin">🛡️ Admin</option>
            </select>
          </div>

          <button type="submit" className="btn btn-secondary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Creating account...' : '✅ Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Login here</Link>
        </div>
      </div>
    </div>
  );
}
