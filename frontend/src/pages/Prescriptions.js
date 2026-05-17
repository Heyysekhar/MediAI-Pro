import React, { useEffect, useState } from 'react';
import { prescriptionAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionAPI.getMyPrescriptions().then(r => setPrescriptions(r.data)).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  }, []);

  const handleDownload = async (id) => {
    try {
      const res = await prescriptionAPI.downloadPdf(id);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `prescription_${id}.pdf`; a.click();
      toast.success('PDF downloaded!');
    } catch { toast.error('Download failed'); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>💊 My Prescriptions</h2>
      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>⏳ Loading prescriptions...</div>
        ) : prescriptions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 64 }}>💊</div>
            <h3 style={{ margin: '16px 0 8px' }}>No prescriptions yet</h3>
            <p>Your prescriptions will appear here after doctor visits</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {prescriptions.map((p, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontWeight: 700 }}>Dr. {p.doctor_name}</h3>
                    <p style={{ fontSize: 13, color: '#64748b' }}>Date: {new Date(p.created_at).toLocaleDateString()}</p>
                    <p style={{ fontSize: 14, marginTop: 4 }}><strong>Diagnosis:</strong> {p.diagnosis}</p>
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => handleDownload(p.id)}>
                    📥 Download PDF
                  </button>
                </div>
                <h4 style={{ marginBottom: 8, fontSize: 14 }}>💊 Medicines:</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {p.medicines?.map((m, j) => (
                    <div key={j} style={{ padding: '6px 12px', background: '#f0f9ff', borderRadius: 8, fontSize: 13 }}>
                      <strong>{m.name}</strong> · {m.dosage} · {m.frequency} · {m.duration}
                    </div>
                  ))}
                </div>
                {p.notes && <p style={{ marginTop: 10, fontSize: 13, color: '#64748b' }}>📝 {p.notes}</p>}
                {p.follow_up_date && <p style={{ marginTop: 6, fontSize: 13, color: '#2563eb' }}>📅 Follow-up: {p.follow_up_date}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
