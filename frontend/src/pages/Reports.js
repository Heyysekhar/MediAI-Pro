import React, { useEffect, useState } from 'react';
import { reportAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [file, setFile] = useState(null);
  const [reportType, setReportType] = useState('lab_report');
  const [loading, setLoading] = useState(false);

  const fetchReports = () => reportAPI.getMyReports().then(r => setReports(r.data)).catch(() => {});
  useEffect(() => { fetchReports(); }, []);

  const handleUpload = async () => {
    if (!file) { toast.error('Select a file'); return; }
    setLoading(true);
    try {
      await reportAPI.upload(file, reportType);
      toast.success('✅ Report uploaded!');
      setFile(null);
      fetchReports();
    } catch { toast.error('Upload failed'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this report?')) return;
    try {
      await reportAPI.delete(id);
      toast.success('Report deleted');
      fetchReports();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>📋 Medical Reports</h2>
      <div className="page-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">📤 Upload Report</span></div>
          <div className="form-group">
            <label className="form-label">📁 Report Type</label>
            <select className="form-input form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="lab_report">🔬 Lab Report</option>
              <option value="xray">🫁 X-Ray</option>
              <option value="scan">🖼️ CT/MRI Scan</option>
              <option value="prescription">💊 Prescription</option>
              <option value="other">📄 Other</option>
            </select>
          </div>
          <div className="upload-zone" onClick={() => document.getElementById('rep-input').click()}>
            <div style={{ fontSize: 48 }}>📄</div>
            <h3>Upload Report File</h3>
            <p>PDF, JPEG, PNG supported</p>
            {file && <p style={{ color: '#2563eb', fontWeight: 600, marginTop: 8 }}>✓ {file.name}</p>}
          </div>
          <input id="rep-input" type="file" accept=".pdf,image/*" style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0])} />
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
            onClick={handleUpload} disabled={loading || !file}>
            {loading ? '⏳ Uploading...' : '📤 Upload Report'}
          </button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📋 My Reports ({reports.length})</span></div>
          {reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
              <div style={{ fontSize: 48 }}>📋</div>
              <p>No reports uploaded yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {reports.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: 10 }}>
                  <span style={{ fontSize: 28 }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.filename || r.stored_filename}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {r.report_type} · {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {r.file_url && (
                      <a href={`http://localhost:8000${r.file_url}`} target="_blank" rel="noreferrer"
                        className="btn btn-outline btn-sm">👁️ View</a>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
