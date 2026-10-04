import React, { useState, useEffect } from 'react';
import { predictionAPI } from '../services/api';
import toast from 'react-hot-toast';

const SYMPTOMS = [
  'fever', 'headache', 'cough', 'chest pain', 'shortness of breath',
  'fatigue', 'nausea', 'joint pain', 'skin rash', 'dizziness',
  'vomiting', 'diarrhea', 'sore throat', 'runny nose', 'body ache',
  'loss of appetite', 'weight loss', 'night sweats', 'back pain', 'abdominal pain',
];

export default function DiseasePredictor() {
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('symptoms');

  // Diabetes form
  const [diabForm, setDiabForm] = useState({
    pregnancies: 0, glucose: 120, blood_pressure: 70, skin_thickness: 25,
    insulin: 80, bmi: 25, diabetes_pedigree: 0.5, age: 30
  });
  const [diabResult, setDiabResult] = useState(null);

  const toggleSymptom = (s) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handlePredict = async () => {
    if (selected.length === 0) { toast.error('Select at least one symptom'); return; }
    setLoading(true);
    try {
      const res = await predictionAPI.predictDisease({ symptoms: selected });
      setResult(res.data);
      toast.success('✅ Prediction complete!');
    } catch (e) { toast.error('Prediction failed'); }
    setLoading(false);
  };

  const handleDiabetes = async () => {
    setLoading(true);
    try {
      const res = await predictionAPI.predictDiabetes(diabForm);
      setDiabResult(res.data);
      toast.success('✅ Diabetes analysis complete!');
    } catch (e) { toast.error('Analysis failed'); }
    setLoading(false);
  };

  const riskColor = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24 }}>🤖 AI Disease Predictor</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['symptoms', 'diabetes', 'heart'].map(tab => (
          <button key={tab} className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab(tab)}>
            {tab === 'symptoms' ? '🤒 Symptoms' : tab === 'diabetes' ? '🩸 Diabetes' : '❤️ Heart Disease'}
          </button>
        ))}
      </div>

      {activeTab === 'symptoms' && (
        <div className="page-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">🤒 Select Your Symptoms</span></div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {SYMPTOMS.map(s => (
                <button key={s} type="button" onClick={() => toggleSymptom(s)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: '2px solid',
                    borderColor: selected.includes(s) ? '#2563eb' : '#e2e8f0',
                    background: selected.includes(s) ? '#dbeafe' : 'white',
                    color: selected.includes(s) ? '#1d4ed8' : '#64748b',
                    cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all 0.2s'
                  }}>
                  {selected.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>
            <div style={{ marginBottom: 12, fontSize: 13, color: '#64748b' }}>
              Selected: {selected.length > 0 ? selected.join(', ') : 'None'}
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={handlePredict} disabled={loading || selected.length === 0}>
              {loading ? '🔄 Analyzing...' : '🔍 Predict Disease'}
            </button>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📊 AI Prediction Result</span></div>
            {result ? (
              <div className={`result-box ${result.risk_level}`}>
                <div className="result-disease">{result.predicted_disease}</div>
                <div className="result-confidence">Confidence: {result.confidence}%</div>
                <div style={{ marginBottom: 12, fontSize: 14 }}>{result.description}</div>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 8, fontSize: 13 }}>
                  <strong>💊 Recommended Action:</strong><br />{result.recommended_action}
                </div>
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontWeight: 700, color: riskColor[result.risk_level] }}>
                    Risk Level: {result.risk_level?.toUpperCase()}
                  </span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={{ fontSize: 64 }}>🤖</div>
                <p>Select symptoms and click Predict to get AI diagnosis</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'diabetes' && (
        <div className="page-grid">
          <div className="card">
            <div className="card-header"><span className="card-title">🩸 Diabetes Risk Assessment</span></div>
            <div className="form-grid">
              {Object.entries(diabForm).map(([key, val]) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{key.replace(/_/g, ' ').toUpperCase()}</label>
                  <input type="number" className="form-input" value={val}
                    onChange={e => setDiabForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))} />
                </div>
              ))}
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }}
              onClick={handleDiabetes} disabled={loading}>
              {loading ? '🔄 Analyzing...' : '🩸 Analyze Diabetes Risk'}
            </button>
          </div>

          <div className="card">
            <div className="card-header"><span className="card-title">📊 Diabetes Result</span></div>
            {diabResult ? (
              <div className={`result-box ${diabResult.risk_level?.toLowerCase()}`}>
                <div className="result-disease">{diabResult.prediction}</div>
                <div style={{ fontSize: 36, fontWeight: 900, marginBottom: 8 }}>
                  {diabResult.risk_percentage}%
                </div>
                <div style={{ marginBottom: 12 }}>Risk Level: <strong>{diabResult.risk_level}</strong></div>
                <div style={{ padding: 12, background: 'rgba(255,255,255,0.7)', borderRadius: 8, fontSize: 13 }}>
                  💊 {diabResult.recommendation}
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
                <div style={{ fontSize: 64 }}>🩸</div>
                <p>Fill in your health data and analyze</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'heart' && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
            <div style={{ fontSize: 64 }}>❤️</div>
            <h3>Heart Disease Predictor</h3>
            <p style={{ marginTop: 8 }}>Input detailed cardiac parameters for AI analysis</p>
            <p style={{ marginTop: 8, fontSize: 13 }}>Use /predict/heart API endpoint with cardiac data</p>
          </div>
        </div>
      )}
    </div>
  );
}
