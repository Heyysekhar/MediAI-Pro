import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Appointments from './pages/Appointments';
import BookAppointment from './pages/BookAppointment';
import Prescriptions from './pages/Prescriptions';
import Reports from './pages/Reports';
import DiseasePredictor from './pages/DiseasePredictor';
import XRayAnalysis from './pages/XRayAnalysis';
import Chatbot from './pages/Chatbot';
import OCRScanner from './pages/OCRScanner';
import Wearables from './pages/Wearables';
import Emergency from './pages/Emergency';
import Analytics from './pages/Analytics';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';

import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import './index.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Loading MediAI Pro...</p>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/book" element={<BookAppointment />} />
          <Route path="/prescriptions" element={<Prescriptions />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/predict" element={<DiseasePredictor />} />
          <Route path="/xray" element={<XRayAnalysis />} />
          <Route path="/chat" element={<Chatbot />} />
          <Route path="/ocr" element={<OCRScanner />} />
          <Route path="/wearables" element={<Wearables />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '10px', background: '#333', color: '#fff' },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
