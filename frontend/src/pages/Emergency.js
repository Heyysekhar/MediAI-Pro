import React, { useState, useEffect } from 'react';
import { emergencyAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Emergency() {
  const [vitals, setVitals] = useState({ heart_rate: '', spo2: '', blood_pressure_systolic: '' });
  const [result, setResult] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    emergencyAPI.getMyAlerts().then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  const handleCheck = async () => {
    const data = {};
    Object.entries(vitals).forEach(([k, v]) => { if (v) data[k] = parseFloat(v); });
    if (Object.keys(data).length === 0) { toast.error('Enter at least one vital'); return; }
    setLoading(true);
    try {
      const res = await emergencyAPI.check(data);
      setResult(res.data);
      if (res.data.is_emergency) toast.error(`🚨 EMERGENCY DETECTED! Risk: ${res.data.risk_score}%`);
      else toast.success(`✅ Vitals OK. Risk Score: ${res.data.risk_score}`);
    } catch { toast.error('Check failed'); }
    setLoading(false);
  };

  const levelColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };

  return (
    <div>
      <div style={{ background: '#fee2e2', border: '2px solid #ef4444', borderRadius: 12,
        padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 28 }}>🚨</span>
        <div>
          <strong>Emergency? Call 108 immediately!</strong><br />
          <span style={{ fontSize: 13 }}>This AI tool assists but does NOT replace emergency services.</span>
        </div>
        <a href="tel:108" className="btn btn-danger" style={{ marginLeft: 'auto' }}>📞 Call 108</a>
      </div>

      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>🚨 AI Emergency Detection</h2>

      <div className="page-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">🩺 Enter Current Vitals</span></div>
          {[
            ['heart_rate', '❤️ Heart Rate (bpm)', '72', 'Normal: 60-100'],
            ['spo2', '🫀 SpO2 (%)', '98', 'Normal: >95%'],
            ['blood_pressure_systolic', '🩺 Systolic BP (mmHg)', '120', 'Normal: <120'],
          ].map(([key, label, ph, note]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label} <span style={{ color: '#64748b', fontSize: 12 }}>({note})</span></label>
              <input type="number" className="form-input" placeholder={ph}
                value={vitals[key]} onChange={e => setVitals(v => ({ ...v, [key]: e.target.value }))} />
            </div>
          ))}
          <button className="btn btn-danger btn-lg" style={{ width: '100%' }}
            onClick={handleCheck} disabled={loading}>
            {loading ? '🔄 Analyzing...' : '🚨 Check Emergency Risk'}
          </button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📊 Risk Assessment</span></div>
          {result ? (
            <div>
              <div style={{
                textAlign: 'center', padding: 24, borderRadius: 12, marginBottom: 20,
                background: result.is_emergency ? '#fee2e2' : '#d1fae5',
                border: `3px solid ${levelColor[result.level]}`
              }}>
                <div style={{ fontSize: 56 }}>{result.is_emergency ? '🚨' : '✅'}</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: levelColor[result.level] }}>
                  Risk Score: {result.risk_score}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4, textTransform: 'uppercase' }}>
                  Level: {result.level}
                </div>
              </div>
              {result.reasons?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 8, fontWeight: 700 }}>⚠️ Issues Detected:</h4>
                  {result.reasons.map((r, i) => (
                    <div key={i} style={{ padding: '8px 12px', background: '#fee2e2', borderRadius: 8, marginBottom: 6, fontSize: 14 }}>
                      ⚠️ {r}
                    </div>
                  ))}
                </div>
              )}
              <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
                🏥 {result.action}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 64 }}>🩺</div>
              <p>Enter vitals and check emergency risk</p>
            </div>
          )}
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header"><span className="card-title">🔔 Recent Emergency Alerts</span></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Risk Score</th><th>Level</th><th>Status</th></tr></thead>
              <tbody>
                {alerts.slice(0, 10).map((a, i) => (
                  <tr key={i}>
                    <td>{new Date(a.timestamp).toLocaleString()}</td>
                    <td><strong>{a.risk_score}</strong></td>
                    <td><span className={`badge badge-${a.level === 'low' ? 'success' : 'danger'}`}>{a.level}</span></td>
                    <td><span className={`badge badge-${a.acknowledged ? 'success' : 'warning'}`}>
                      {a.acknowledged ? 'Acknowledged' : 'Pending'}
                    </span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
