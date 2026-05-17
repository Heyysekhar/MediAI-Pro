import React, { useState, useEffect } from 'react';
import { wearableAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

export default function Wearables() {
  const [vitals, setVitals] = useState(null);
  const [hrData, setHrData] = useState([]);
  const [form, setForm] = useState({ heart_rate: '', spo2: '', steps: '', calories: '', sleep_hours: '',
    blood_pressure_systolic: '', blood_pressure_diastolic: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    wearableAPI.getLatest().then(r => setVitals(r.data)).catch(() => {});
    wearableAPI.getHeartRate().then(r => setHrData(r.data)).catch(() => {});
  }, []);

  const handleSync = async () => {
    const data = {};
    Object.entries(form).forEach(([k, v]) => { if (v) data[k] = parseFloat(v); });
    if (Object.keys(data).length === 0) { toast.error('Enter at least one vital'); return; }
    setLoading(true);
    try {
      const res = await wearableAPI.sync(data);
      toast.success('✅ Vitals synced!');
      if (res.data.alerts?.length) res.data.alerts.forEach(a => toast.error(a));
      wearableAPI.getLatest().then(r => setVitals(r.data)).catch(() => {});
    } catch { toast.error('Sync failed'); }
    setLoading(false);
  };

  const vitalCards = [
    { key: 'heart_rate', icon: '❤️', label: 'Heart Rate', unit: 'bpm', normal: '60-100', color: '#fee2e2' },
    { key: 'spo2', icon: '🫀', label: 'SpO2', unit: '%', normal: '>95%', color: '#dbeafe' },
    { key: 'steps', icon: '👟', label: 'Steps', unit: 'steps', normal: '>8000', color: '#d1fae5' },
    { key: 'sleep_hours', icon: '😴', label: 'Sleep', unit: 'hrs', normal: '7-9 hrs', color: '#ede9fe' },
    { key: 'calories', icon: '🔥', label: 'Calories', unit: 'kcal', normal: 'Active', color: '#fef3c7' },
    { key: 'blood_pressure_systolic', icon: '🩺', label: 'Systolic BP', unit: 'mmHg', normal: '<120', color: '#ffedd5' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>⌚ Wearable Health Monitor</h2>

      {/* Current Vitals */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {vitalCards.map((v, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: v.color }}>{v.icon}</div>
            <div className="stat-info">
              <h3>{vitals?.[v.key] ?? '—'} <span style={{ fontSize: 14 }}>{vitals?.[v.key] ? v.unit : ''}</span></h3>
              <p>{v.label}</p>
              <p style={{ fontSize: 11, color: '#64748b' }}>Normal: {v.normal}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="page-grid">
        {/* Sync Form */}
        <div className="card">
          <div className="card-header"><span className="card-title">📡 Sync Wearable Data</span></div>
          <div className="form-grid">
            {[
              ['heart_rate', '❤️ Heart Rate (bpm)', '72'],
              ['spo2', '🫀 SpO2 (%)', '98'],
              ['steps', '👟 Steps', '8000'],
              ['calories', '🔥 Calories (kcal)', '450'],
              ['sleep_hours', '😴 Sleep (hours)', '7.5'],
              ['blood_pressure_systolic', '🩺 Systolic BP (mmHg)', '120'],
              ['blood_pressure_diastolic', '🩺 Diastolic BP (mmHg)', '80'],
            ].map(([key, label, placeholder]) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type="number" className="form-input" placeholder={placeholder}
                  value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }}
            onClick={handleSync} disabled={loading}>
            {loading ? '🔄 Syncing...' : '📡 Sync to Dashboard'}
          </button>
        </div>

        {/* Heart Rate Chart */}
        <div className="card">
          <div className="card-header"><span className="card-title">❤️ Heart Rate History</span></div>
          {hrData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={hrData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="timestamp" tickFormatter={v => new Date(v).toLocaleDateString()} tick={{ fontSize: 10 }} />
                <YAxis domain={[40, 120]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 48 }}>❤️</div>
              <p>Sync vitals to see heart rate chart</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
