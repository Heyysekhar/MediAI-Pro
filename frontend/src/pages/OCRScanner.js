import React, { useState, useEffect } from 'react';
import { ocrAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function OCRScanner() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async () => {
    if (!file) { toast.error('Please upload a report image or PDF'); return; }
    setLoading(true);
    try {
      const res = await ocrAPI.scan(file);
      setResult(res.data);
      toast.success('✅ Report scanned successfully!');
    } catch (e) { toast.error('Scan failed'); }
    setLoading(false);
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>📄 OCR Report Scanner</h2>
      <div style={{ marginBottom: 16, padding: 16, background: '#d1fae5', borderRadius: 12, fontSize: 14 }}>
        🔍 <strong>AI OCR</strong> extracts medical values (Blood Sugar, BP, Hemoglobin, Cholesterol) from your reports automatically.
      </div>
      <div className="page-grid">
        <div className="card">
          <div className="card-header"><span className="card-title">📤 Upload Report</span></div>
          <div className="upload-zone" onClick={() => document.getElementById('ocr-input').click()}>
            <div style={{ fontSize: 56 }}>📄</div>
            <h3>Upload Medical Report</h3>
            <p>Lab reports, prescriptions, diagnostic reports · PDF/JPG/PNG</p>
            {file && <p style={{ marginTop: 8, color: '#2563eb', fontWeight: 600 }}>✓ {file.name}</p>}
          </div>
          <input id="ocr-input" type="file" accept="image/*,.pdf" style={{ display: 'none' }}
            onChange={e => setFile(e.target.files[0])} />
          <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 16 }}
            onClick={handleScan} disabled={loading || !file}>
            {loading ? '🔄 Scanning with OCR...' : '🔍 Scan & Extract Values'}
          </button>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">📊 Extracted Medical Values</span></div>
          {result ? (
            <div>
              {Object.keys(result.extracted_values || {}).length > 0 ? (
                <div>
                  <h4 style={{ marginBottom: 12 }}>📋 Detected Values:</h4>
                  {Object.entries(result.extracted_values).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between',
                      padding: '10px 14px', background: '#f0f9ff', borderRadius: 8, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}</span>
                      <span style={{ fontWeight: 800, color: '#2563eb' }}>{v}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: 16, background: '#fef3c7', borderRadius: 8 }}>
                  ⚠️ No medical values extracted. Ensure image is clear and readable.
                </div>
              )}
              {result.extracted_text && (
                <div style={{ marginTop: 16 }}>
                  <h4 style={{ marginBottom: 8 }}>📝 Extracted Text (Preview):</h4>
                  <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 12,
                    fontFamily: 'monospace', maxHeight: 150, overflowY: 'auto' }}>
                    {result.extracted_text}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 64 }}>🔍</div>
              <p>Upload a report to extract medical values</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
