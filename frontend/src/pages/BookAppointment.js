import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [form, setForm] = useState({
    doctor_id: '', appointment_date: '', appointment_time: '', reason: '', appointment_type: 'in-person'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    doctorAPI.getAllDoctors().then(r => setDoctors(r.data)).catch(() => {});
  }, []);

  const handleDoctorDate = async (doctor_id, date) => {
    setForm(f => ({ ...f, doctor_id, appointment_date: date, appointment_time: '' }));
    if (doctor_id && date) {
      try {
        const r = await doctorAPI.getAvailableSlots(doctor_id, date);
        setSlots(r.data.available_slots || []);
      } catch { setSlots([]); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.appointment_time) { toast.error('Please select a time slot'); return; }
    setLoading(true);
    try {
      const res = await appointmentAPI.book(form);
      toast.success('✅ Appointment booked successfully!');
      if (res.data.meeting_link) toast.success(`📹 Video link: ${res.data.meeting_link}`);
      navigate('/appointments');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Booking failed');
    }
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>📅 Book Appointment</h2>

      <div className="page-grid">
        <div className="card">
          <div className="card-header">
            <span className="card-title">👨‍⚕️ Select Doctor & Time</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">👨‍⚕️ Choose Doctor</label>
              <select className="form-input form-select" required
                value={form.doctor_id}
                onChange={e => handleDoctorDate(e.target.value, form.appointment_date)}>
                <option value="">-- Select a Doctor --</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>
                    Dr. {d.full_name} — {d.profile?.specialization || 'General'}
                    {d.profile?.consultation_fee ? ` (₹${d.profile.consultation_fee})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">📆 Date</label>
              <input type="date" className="form-input" min={today} required
                value={form.appointment_date}
                onChange={e => handleDoctorDate(form.doctor_id, e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">🕐 Available Time Slots</label>
              {slots.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: 13 }}>Select doctor and date to see available slots</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {slots.map(slot => (
                    <button key={slot} type="button"
                      onClick={() => setForm(f => ({ ...f, appointment_time: slot }))}
                      className={`btn btn-sm ${form.appointment_time === slot ? 'btn-primary' : 'btn-outline'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">🏥 Appointment Type</label>
              <select className="form-input form-select"
                value={form.appointment_type}
                onChange={e => setForm(f => ({ ...f, appointment_type: e.target.value }))}>
                <option value="in-person">🏥 In-Person Visit</option>
                <option value="video">📹 Video Consultation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">📝 Reason for Visit</label>
              <textarea className="form-input" rows={3} placeholder="Describe your symptoms or reason..."
                value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? '⏳ Booking...' : '✅ Confirm Appointment'}
            </button>
          </form>
        </div>

        {/* Doctor Cards */}
        <div>
          <h3 style={{ marginBottom: 16, fontWeight: 700 }}>👨‍⚕️ Available Doctors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {doctors.slice(0, 6).map((d, i) => (
              <div key={i} className="card" style={{ padding: 16, cursor: 'pointer',
                border: form.doctor_id === d.id ? '2px solid #2563eb' : '1px solid #e2e8f0' }}
                onClick={() => handleDoctorDate(d.id, form.appointment_date)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: '#dbeafe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                  }}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 700 }}>Dr. {d.full_name}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{d.profile?.specialization || 'General Physician'}</div>
                    <div style={{ fontSize: 12, color: '#2563eb' }}>
                      {d.profile?.experience_years ? `${d.profile.experience_years} years exp` : ''}
                      {d.profile?.consultation_fee ? ` · ₹${d.profile.consultation_fee}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
