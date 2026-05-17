import React, { useState, useEffect } from 'react';
import { ocrAPI } from '../services/api';
import toast from 'react-hot-toast';

export default function OCRScanner() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await ocrAPI.getHistory();
      setHistory(res.data || []);
    } catch (e) {
      toast.error('Unable to load OCR records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await ocrAPI.delete(id);
      toast.success('OCR record deleted');
      setHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      toast.error('Delete failed');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>🗑️ OCR Delete</h2>
      <div style={{ marginBottom: 16, padding: 16, background: '#fee2e2', borderRadius: 12, fontSize: 14 }}>
        This page only allows deleting previously scanned OCR reports. Upload and scan functionality has been removed.
      </div>

      <div className="card">
        <div className="card-header"><span className="card-title">OCR Records</span></div>
        {loading ? (
          <div style={{ padding: 24 }}>Loading OCR records...</div>
        ) : history.length === 0 ? (
          <div style={{ padding: 24, color: '#64748b' }}>No OCR records available.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12, padding: 16 }}>
            {history.map((item) => (
              <div key={item.id} style={{ padding: 16, borderRadius: 12, background: '#f8fafc', display: 'grid', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{item.filename || 'OCR record'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : 'No date'}
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} disabled={deletingId === item.id}>
                    {deletingId === item.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
                {item.extracted_values && Object.keys(item.extracted_values).length > 0 && (
                  <div style={{ fontSize: 13, color: '#334155' }}>
                    Extracted values: {Object.entries(item.extracted_values).map(([k, v]) => `${k.replace(/_/g, ' ')}=${v}`).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
