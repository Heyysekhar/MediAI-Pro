import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome, FaCalendarAlt, FaPills, FaFileAlt, FaBrain,
  FaXRay, FaComments, FaCamera, FaHeartbeat, FaExclamationTriangle,
  FaChartBar, FaUserMd, FaShieldAlt, FaMicrophone,
  FaSignOutAlt, FaUser, FaBars, FaTimes, FaBell
} from 'react-icons/fa';

const navItems = [
  { section: 'MAIN' },
  { to: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
  { to: '/profile', icon: <FaUser />, label: 'My Profile' },

  { section: 'HEALTHCARE' },
  { to: '/appointments', icon: <FaCalendarAlt />, label: 'Appointments' },
  { to: '/prescriptions', icon: <FaPills />, label: 'Prescriptions' },
  { to: '/reports', icon: <FaFileAlt />, label: 'Medical Reports' },

  { section: 'AI FEATURES' },
  { to: '/predict', icon: <FaBrain />, label: 'Disease Predictor' },
  { to: '/xray', icon: <FaXRay />, label: 'X-Ray Analysis' },
  { to: '/chat', icon: <FaComments />, label: 'AI Chatbot' },
  { to: '/ocr', icon: <FaCamera />, label: 'OCR Scanner' },

  { section: 'MONITORING' },
  { to: '/wearables', icon: <FaHeartbeat />, label: 'Wearables' },
  { to: '/emergency', icon: <FaExclamationTriangle />, label: 'Emergency' },
  { to: '/analytics', icon: <FaChartBar />, label: 'Analytics' },
];

const doctorItems = [
  { to: '/doctor-dashboard', icon: <FaUserMd />, label: 'Doctor Dashboard' },
];

const adminItems = [
  { to: '/admin-dashboard', icon: <FaShieldAlt />, label: 'Admin Dashboard' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const allItems = [
    ...navItems,
    ...(user?.role === 'doctor' ? [{ section: 'DOCTOR' }, ...doctorItems] : []),
    ...(user?.role === 'admin' ? [{ section: 'ADMIN' }, ...adminItems] : []),
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span style={{ fontSize: 28 }}>🏥</span>
          <div>
            <h1>MediAI Pro</h1>
            <span>AI Healthcare System</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {allItems.map((item, i) => {
            if (item.section) return <div key={i} className="nav-section">{item.section}</div>;
            return (
              <NavLink
                key={i} to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon} {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: '#2563eb', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 14
            }}>
              {user?.full_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>{user?.full_name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm" style={{ width: '100%' }}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', display: 'none' }}
              className="menu-btn"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <span className="topbar-title">🏥 MediAI Pro</span>
          </div>
          <div className="topbar-right">
            <NavLink to="/emergency" style={{ color: '#ef4444', fontSize: 20 }} title="Emergency">
              <FaExclamationTriangle />
            </NavLink>
            <NavLink to="/chat" style={{ color: '#2563eb', fontSize: 20 }} title="Chatbot">
              <FaComments />
            </NavLink>
            <div className="user-badge">
              👤 {user?.full_name}
              <span className="role-badge">{user?.role}</span>
            </div>
          </div>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
