import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    try {
      const res = await appointmentAPI.getMyAppointments();
      setAppointments(res.data);
    } catch (e) { toast.error('Failed to load appointments'); }
    setLoading(false);
  };

  useEffect(() => { fetchAppointments(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await appointmentAPI.cancel(id);
      toast.success('Appointment cancelled');
      fetchAppointments();
    } catch (e) { toast.error('Failed to cancel'); }
  };

  const statusColor = { pending: 'warning', confirmed: 'success', cancelled: 'danger', completed: 'info' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>📅 My Appointments</h2>
        <Link to="/appointments/book" className="btn btn-primary">➕ Book Appointment</Link>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>⏳ Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 64 }}>📅</div>
            <h3 style={{ margin: '16px 0 8px' }}>No appointments yet</h3>
            <p>Book your first appointment with a doctor</p>
            <Link to="/appointments/book" className="btn btn-primary" style={{ marginTop: 16 }}>Book Now</Link>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Doctor</th><th>Date</th><th>Time</th><th>Reason</th>
                  <th>Type</th><th>Status</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a, i) => (
                  <tr key={i}>
                    <td><strong>Dr. {a.doctor_name}</strong></td>
                    <td>{a.appointment_date}</td>
                    <td>🕐 {a.appointment_time}</td>
                    <td style={{ maxWidth: 150 }}>{a.reason}</td>
                    <td><span className="badge badge-info">{a.appointment_type}</span></td>
                    <td>
                      <span className={`badge badge-${statusColor[a.status] || 'gray'}`}>{a.status}</span>
                    </td>
                    <td>
                      {a.status === 'pending' && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleCancel(a.id)}>
                          Cancel
                        </button>
                      )}
                      {a.meeting_link && a.status !== 'cancelled' && (
                        <a href={a.meeting_link} target="_blank" rel="noreferrer"
                          className="btn btn-secondary btn-sm" style={{ marginLeft: 6 }}>
                          📹 Join
                        </a>
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
