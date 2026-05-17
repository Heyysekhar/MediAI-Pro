import React, { useState, useRef, useEffect } from 'react';
import { chatAPI } from '../services/api';
import { FaPaperPlane, FaMicrophone, FaGlobe } from 'react-icons/fa';

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I'm MediBot 🤖 Your AI health assistant. How can I help you today?\n\nYou can ask me about:\n• Symptoms and diseases\n• Appointment booking\n• Medical reports\n• Emergency help" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [language, setLanguage] = useState('en');
  const [suggestions, setSuggestions] = useState(['I have fever', 'Book appointment', 'Check symptoms', 'Emergency help']);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await chatAPI.sendMessage({ message: msg, language, session_id: sessionId });
      const data = res.data;
      setSessionId(data.session_id);
      setSuggestions(data.suggestions || []);
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ Sorry, I encountered an error. Please try again.' }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } };

  const langs = [
    { code: 'en', label: '🇬🇧 EN' }, { code: 'hi', label: '🇮🇳 HI' },
    { code: 'or', label: '🌏 OR' }, { code: 'bn', label: '🌏 BN' }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800 }}>💬 MediBot - AI Health Assistant</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {langs.map(l => (
            <button key={l.code}
              className={`btn btn-sm ${language === l.code ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setLanguage(l.code)}>{l.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', padding: '16px 20px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🤖</div>
            <div>
              <div style={{ fontWeight: 700 }}>MediBot AI</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>● Online · Multilingual · Available 24/7</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages" style={{ height: '55vh', background: '#f8fafc' }}>
          {messages.map((m, i) => (
            <div key={i} className={`chat-bubble ${m.role === 'user' ? 'user' : 'bot'}`}
              style={{ whiteSpace: 'pre-line' }}>
              {m.role === 'bot' && <span style={{ marginRight: 6 }}>🤖</span>}
              {m.text}
            </div>
          ))}
          {loading && (
            <div className="chat-bubble bot">
              <span>🤖 </span><span style={{ animation: 'pulse 1s infinite' }}>MediBot is thinking...</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div style={{ padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #e2e8f0' }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => send(s)}
                style={{ padding: '4px 12px', borderRadius: 16, border: '1px solid #2563eb',
                  color: '#2563eb', background: 'white', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="chat-input-area">
          <textarea
            className="chat-input" rows={1} placeholder={`Type your health question in ${language === 'hi' ? 'Hindi' : language === 'or' ? 'Odia' : language === 'bn' ? 'Bengali' : 'English'}...`}
            value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            style={{ resize: 'none' }}
          />
          <button className="btn btn-primary" onClick={() => send()} disabled={loading || !input.trim()}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}
