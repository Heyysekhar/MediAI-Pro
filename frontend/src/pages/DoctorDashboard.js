import React, { useEffect, useState } from 'react';
import { appointmentAPI, analyticsAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function DoctorDashboard() {
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    analyticsAPI.getDoctorDashboard().then(r => setStats(r.data)).catch(() => {});
    appointmentAPI.getTodayAppointments().then(r => setAppointments(r.data)).catch(() => {});
  }, []);

  const handleStatus = async (id, status) => {
    try {
      await appointmentAPI.updateStatus(id, status);
      toast.success(`Appointment ${status}`);
      appointmentAPI.getTodayAppointments().then(r => setAppointments(r.data)).catch(() => {});
    } catch { toast.error('Failed'); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>👨‍⚕️ Doctor Dashboard</h2>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: '📅', label: 'Total Appointments', value: stats?.total_appointments ?? '—', bg: '#dbeafe' },
          { icon: '✅', label: 'Completed', value: stats?.completed_appointments ?? '—', bg: '#d1fae5' },
          { icon: '⏳', label: 'Pending', value: stats?.pending_appointments ?? '—', bg: '#fef3c7' },
          { icon: '💊', label: 'Prescriptions', value: stats?.total_prescriptions ?? '—', bg: '#fce7f3' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📅 Today's Appointments</span>
          <span className="badge badge-info">{new Date().toLocaleDateString()}</span>
        </div>
        {appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
            <div style={{ fontSize: 48 }}>📅</div>
            <p>No appointments today</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Patient</th><th>Time</th><th>Reason</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={i}>
                    <td><strong>{a.patient_name}</strong></td>
                    <td>🕐 {a.appointment_time}</td>
                    <td>{a.reason}</td>
                    <td><span className="badge badge-info">{a.appointment_type}</span></td>
                    <td><span className={`badge badge-${a.status === 'confirmed' ? 'success' : 'warning'}`}>{a.status}</span></td>
                    <td>
                      {a.status === 'pending' && (
                        <>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleStatus(a.id, 'confirmed')} style={{ marginRight: 6 }}>✅ Confirm</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleStatus(a.id, 'cancelled')}>❌ Cancel</button>
                        </>
                      )}
                      {a.status === 'confirmed' && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleStatus(a.id, 'completed')}>✅ Complete</button>
                      )}
                    </td>
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
