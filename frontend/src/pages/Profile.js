import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { patientAPI, doctorAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'patient') patientAPI.getProfile().then(r => setProfile(r.data)).catch(() => {});
    else if (user?.role === 'doctor') doctorAPI.getProfile().then(r => setProfile(r.data)).catch(() => {});
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (user?.role === 'patient') await patientAPI.updateProfile(profile);
      else if (user?.role === 'doctor') await doctorAPI.updateProfile(profile);
      toast.success('✅ Profile updated!');
    } catch { toast.error('Update failed'); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>👤 My Profile</h2>
      <div className="page-grid">
        {/* User Info */}
        <div className="card">
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
              margin: '0 auto 12px', border: '4px solid #2563eb' }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <h3 style={{ fontWeight: 800 }}>{user?.full_name}</h3>
            <p style={{ color: '#64748b' }}>{user?.email}</p>
            <span className="badge badge-info" style={{ marginTop: 6, fontSize: 13 }}>
              {user?.role?.toUpperCase()}
            </span>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Full Name</span>
              <span style={{ fontWeight: 600 }}>{user?.full_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Email</span>
              <span style={{ fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
              <span style={{ color: '#64748b', fontSize: 14 }}>Role</span>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="card">
          <div className="card-header"><span className="card-title">✏️ Edit Profile Details</span></div>
          {user?.role === 'patient' && (
            <div className="form-grid">
              {[
                ['date_of_birth', 'Date of Birth', 'date'],
                ['gender', 'Gender', 'select', ['Male', 'Female', 'Other']],
                ['blood_group', 'Blood Group', 'select', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']],
                ['height', 'Height (cm)', 'number'],
                ['weight', 'Weight (kg)', 'number'],
                ['emergency_contact', 'Emergency Contact Name', 'text'],
                ['emergency_phone', 'Emergency Phone', 'tel'],
              ].map(([key, label, type, options]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  {type === 'select' ? (
                    <select className="form-input form-select" value={profile[key] || ''}
                      onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))}>
                      <option value="">-- Select --</option>
                      {options?.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={type} className="form-input" value={profile[key] || ''}
                      onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
                  )}
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Address</label>
                <textarea className="form-input" rows={2} value={profile.address || ''}
                  onChange={e => setProfile(p => ({ ...p, address: e.target.value }))} />
              </div>
            </div>
          )}

          {user?.role === 'doctor' && (
            <div className="form-grid">
              {[
                ['specialization', 'Specialization', 'text'],
                ['license_number', 'License Number', 'text'],
                ['experience_years', 'Experience (years)', 'number'],
                ['qualification', 'Qualification', 'text'],
                ['hospital_name', 'Hospital', 'text'],
                ['consultation_fee', 'Consultation Fee (₹)', 'number'],
              ].map(([key, label, type]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input type={type} className="form-input" value={profile[key] || ''}
                    onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Bio</label>
                <textarea className="form-input" rows={3} value={profile.bio || ''}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} />
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
            onClick={handleSave} disabled={loading}>
            {loading ? '⏳ Saving...' : '💾 Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
