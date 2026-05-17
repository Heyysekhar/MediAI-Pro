import React, { useState, useCallback } from 'react';
import { xrayAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function XRayAnalysis() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('image/')) handleFile(f);
    else toast.error('Please drop an image file');
  }, []);

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please upload an X-Ray image first'); return; }
    setLoading(true);
    try {
      const res = await xrayAPI.analyze(file);
      setResult(res.data);
      toast.success('✅ X-Ray analysis complete!');
    } catch (e) { toast.error('Analysis failed. Please try again.'); }
    setLoading(false);
  };

  const classColor = { Normal: '#10b981', Pneumonia: '#ef4444', Tuberculosis: '#7f1d1d' };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>🫁 AI X-Ray Analysis</h2>

      <div style={{ marginBottom: 16, padding: 16, background: '#dbeafe', borderRadius: 12, fontSize: 14 }}>
        🤖 <strong>CNN Deep Learning Model</strong> analyzes chest X-Rays for Pneumonia, Tuberculosis, and Normal conditions.
        Upload a JPEG/PNG chest X-Ray image.
      </div>

      <div className="page-grid">
        <div>
          {/* Upload Zone */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-header"><span className="card-title">📤 Upload X-Ray</span></div>
            <div
              className={`upload-zone ${dragging ? 'dragging' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('xray-input').click()}
            >
              {preview ? (
                <img src={preview} alt="X-Ray preview"
                  style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'contain' }} />
              ) : (
                <>
                  <div style={{ fontSize: 56, marginBottom: 12 }}>🫁</div>
                  <h3>Drop X-Ray image here</h3>
                  <p>or click to browse · JPEG, PNG supported</p>
                </>
              )}
            </div>
            <input id="xray-input" type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])} />

            {file && (
              <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                📎 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </div>
            )}

            <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }}
              onClick={handleAnalyze} disabled={loading || !file}>
              {loading ? '🔄 Analyzing X-Ray with CNN...' : '🔍 Analyze X-Ray'}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="card">
          <div className="card-header"><span className="card-title">📊 AI Analysis Result</span></div>
          {loading && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="loader" style={{ margin: '0 auto', borderTopColor: '#2563eb' }} />
              <p style={{ marginTop: 16, color: '#64748b' }}>CNN model analyzing X-Ray...</p>
            </div>
          )}
          {result && !loading && (
            <div>
              <div style={{
                textAlign: 'center', padding: 24, borderRadius: 12, marginBottom: 20,
                background: result.class === 'Normal' ? '#d1fae5' : '#fee2e2',
                border: `2px solid ${classColor[result.class] || '#e2e8f0'}`
              }}>
                <div style={{ fontSize: 56, marginBottom: 8 }}>
                  {result.class === 'Normal' ? '✅' : '⚠️'}
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: classColor[result.class] }}>
                  {result.class}
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, marginTop: 4 }}>
                  Confidence: {result.confidence}%
                </div>
              </div>

              {result.all_predictions && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ marginBottom: 12, fontWeight: 700 }}>📊 All Predictions:</h4>
                  {Object.entries(result.all_predictions).map(([cls, pct]) => (
                    <div key={cls} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{cls}</span>
                        <span>{pct}%</span>
                      </div>
                      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: classColor[cls] || '#2563eb', borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ padding: 16, background: '#f0f9ff', borderRadius: 8, fontSize: 14 }}>
                <strong>💊 Recommendation:</strong><br />{result.recommendation}
              </div>
              {result.note && (
                <div style={{ marginTop: 8, padding: 12, background: '#fef3c7', borderRadius: 8, fontSize: 12 }}>
                  ℹ️ {result.note}
                </div>
              )}
            </div>
          )}
          {!result && !loading && (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 64 }}>🫁</div>
              <p>Upload and analyze an X-Ray image to see results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
