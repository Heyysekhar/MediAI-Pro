import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    analyticsAPI.getAdminOverview().then(r => setStats(r.data)).catch(() => {});
  }, []);

  const cards = stats ? [
    { icon: '👥', label: 'Total Users', value: stats.total_users, bg: '#dbeafe' },
    { icon: '🤒', label: 'Total Patients', value: stats.total_patients, bg: '#d1fae5' },
    { icon: '👨‍⚕️', label: 'Total Doctors', value: stats.total_doctors, bg: '#fce7f3' },
    { icon: '📅', label: 'Total Appointments', value: stats.total_appointments, bg: '#fef3c7' },
    { icon: '🤖', label: 'AI Predictions', value: stats.total_predictions, bg: '#ede9fe' },
    { icon: '🚨', label: 'Emergency Cases', value: stats.emergency_cases, bg: '#fee2e2' },
    { icon: '💬', label: 'Chat Messages', value: stats.active_chats, bg: '#f0fdf4' },
    { icon: '🫁', label: 'X-Ray Scans', value: stats.xray_scans, bg: '#fff7ed' },
  ] : [];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>🛡️ Admin Dashboard</h2>
      <div style={{ padding: '12px 16px', background: '#dbeafe', borderRadius: 10, marginBottom: 24, fontSize: 14 }}>
        🔐 <strong>Admin Panel</strong> — Complete system overview and management
      </div>
      {!stats ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
          <div className="loader" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 16 }}>Loading admin data... (Requires admin role)</p>
        </div>
      ) : (
        <div className="stats-grid">
          {cards.map((c, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: c.bg }}>{c.icon}</div>
              <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
