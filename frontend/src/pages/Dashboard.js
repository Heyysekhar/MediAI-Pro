import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, predictionAPI, analyticsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, predictions: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, preds] = await Promise.all([
          appointmentAPI.getMyAppointments(),
          predictionAPI.getHistory(),
        ]);
        setAppointments(appts.data.slice(0, 5));
        setStats({ appointments: appts.data.length, predictions: preds.data.length });
      } catch (e) { console.log(e); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const demoChart = [
    { day: 'Mon', hr: 72 }, { day: 'Tue', hr: 78 }, { day: 'Wed', hr: 65 },
    { day: 'Thu', hr: 82 }, { day: 'Fri', hr: 70 }, { day: 'Sat', hr: 68 }, { day: 'Sun', hr: 74 },
  ];

  const quickActions = [
    { to: '/appointments/book', icon: '📅', label: 'Book Appointment', color: '#dbeafe' },
    { to: '/predict', icon: '🤖', label: 'Check Symptoms', color: '#d1fae5' },
    { to: '/xray', icon: '🫁', label: 'X-Ray Analysis', color: '#fce7f3' },
    { to: '/chat', icon: '💬', label: 'Ask MediBot', color: '#fef3c7' },
    { to: '/ocr', icon: '📄', label: 'Scan Report', color: '#ede9fe' },
    { to: '/wearables', icon: '⌚', label: 'Health Vitals', color: '#ffedd5' },
    { to: '/emergency', icon: '🚨', label: 'Emergency', color: '#fee2e2' },
    { to: '/analytics', icon: '📊', label: 'Analytics', color: '#f0fdf4' },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)',
        borderRadius: 16, padding: '28px 32px', color: 'white', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>
            Welcome back, {user?.full_name}! 👋
          </h2>
          <p style={{ opacity: 0.8, fontSize: 15 }}>
            Your health dashboard is ready. Stay healthy with AI-powered care.
          </p>
        </div>
        <div style={{ fontSize: 64 }}>🏥</div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { icon: '📅', label: 'Appointments', value: stats.appointments, bg: '#dbeafe', color: '#1d4ed8' },
          { icon: '🤖', label: 'AI Predictions', value: stats.predictions, bg: '#d1fae5', color: '#065f46' },
          { icon: '💊', label: 'Prescriptions', value: '—', bg: '#fce7f3', color: '#9d174d' },
          { icon: '📄', label: 'Reports', value: '—', bg: '#fef3c7', color: '#92400e' },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
            <div className="stat-info">
              <h3>{loading ? '...' : s.value}</h3>
              <p>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="page-grid">
        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚡ Quick Actions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {quickActions.map((a, i) => (
              <Link key={i} to={a.to} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                background: a.color, borderRadius: 10, textDecoration: 'none',
                color: '#1e293b', fontWeight: 600, fontSize: 13, transition: 'transform 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <span style={{ fontSize: 22 }}>{a.icon}</span> {a.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Heart Rate Chart */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">❤️ Heart Rate (This Week)</span>
            <Link to="/wearables" className="btn btn-outline btn-sm">View All</Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={demoChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="hr" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="card" style={{ marginTop: 24 }}>
        <div className="card-header">
          <span className="card-title">📅 Recent Appointments</span>
          <Link to="/appointments" className="btn btn-primary btn-sm">View All</Link>
        </div>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📅</div>
            <p>No appointments yet.</p>
            <Link to="/appointments/book" className="btn btn-primary" style={{ marginTop: 12 }}>
              Book Your First Appointment
            </Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Type</th></tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={i}>
                    <td><strong>Dr. {a.doctor_name}</strong></td>
                    <td>{a.appointment_date}</td>
                    <td>{a.appointment_time}</td>
                    <td>
                      <span className={`badge badge-${a.status === 'confirmed' ? 'success' : a.status === 'cancelled' ? 'danger' : 'warning'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td><span className="badge badge-info">{a.appointment_type}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
