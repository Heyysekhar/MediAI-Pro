import React, { useEffect, useState } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getHealthTrends().then(r => setTrends(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const demoBar = [
    { name: 'Jan', appointments: 4 }, { name: 'Feb', appointments: 7 },
    { name: 'Mar', appointments: 5 }, { name: 'Apr', appointments: 9 },
    { name: 'May', appointments: 6 }, { name: 'Jun', appointments: 11 },
  ];

  const pieData = [
    { name: 'Influenza', value: 30, color: '#2563eb' },
    { name: 'Migraine', value: 20, color: '#10b981' },
    { name: 'Gastritis', value: 15, color: '#f59e0b' },
    { name: 'Arthritis', value: 10, color: '#ef4444' },
    { name: 'Others', value: 25, color: '#8b5cf6' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>📊 Health Analytics Dashboard</h2>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: '🤖', label: 'AI Predictions', value: trends?.total_predictions ?? '—', bg: '#dbeafe' },
          { icon: '📅', label: 'Total Appointments', value: '—', bg: '#d1fae5' },
          { icon: '💊', label: 'Prescriptions', value: '—', bg: '#fce7f3' },
          { icon: '📄', label: 'Reports Scanned', value: '—', bg: '#fef3c7' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="page-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">📅 Appointments Per Month</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={demoBar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="appointments" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">🤖 Top Predicted Diseases</span></div>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, value }) => `${name}: ${value}%`}>
                {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {trends?.heart_rate_trend?.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><span className="card-title">❤️ Heart Rate Trend</span></div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={trends.heart_rate_trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
