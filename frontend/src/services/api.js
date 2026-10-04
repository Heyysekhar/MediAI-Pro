import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Request Interceptor (add token) ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response Interceptor (handle 401) ────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  changePassword: (old_password, new_password) =>
    api.put('/auth/change-password', null, { params: { old_password, new_password } }),
};

// ─── Patients ─────────────────────────────────────────────────────────────────
export const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data) => api.put('/patients/profile', data),
  getMedicalHistory: () => api.get('/patients/medical-history'),
  getAllPatients: () => api.get('/patients/all'),
  getPatientById: (id) => api.get(`/patients/${id}`),
};

// ─── Doctors ─────────────────────────────────────────────────────────────────
export const doctorAPI = {
  getAllDoctors: (specialization) => api.get('/doctors/', { params: { specialization } }),
  getProfile: () => api.get('/doctors/profile'),
  updateProfile: (data) => api.put('/doctors/profile', data),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  getAvailableSlots: (doctorId, date) => api.get(`/doctors/${doctorId}/available-slots`, { params: { date } }),
};

// ─── Appointments ─────────────────────────────────────────────────────────────
export const appointmentAPI = {
  book: (data) => api.post('/appointments/book', data),
  getMyAppointments: () => api.get('/appointments/my'),
  getTodayAppointments: () => api.get('/appointments/today'),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, null, { params: { status } }),
  cancel: (id) => api.delete(`/appointments/${id}/cancel`),
};

// ─── Prescriptions ────────────────────────────────────────────────────────────
export const prescriptionAPI = {
  create: (data) => api.post('/prescriptions/create', data),
  getMyPrescriptions: () => api.get('/prescriptions/my'),
  downloadPdf: (id) => api.get(`/prescriptions/${id}/download`, { responseType: 'blob' }),
};

// ─── Reports ─────────────────────────────────────────────────────────────────
export const reportAPI = {
  upload: (file, report_type) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/reports/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: { report_type },
    });
  },
  getMyReports: () => api.get('/reports/my'),
  delete: (id) => api.delete(`/reports/${id}`),
};

// ─── AI Predictions ───────────────────────────────────────────────────────────
export const predictionAPI = {
  predictDisease: (data) => api.post('/predict/disease', data),
  predictDiabetes: (data) => api.post('/predict/diabetes', data),
  predictHeart: (data) => api.post('/predict/heart', data),
  getHistory: () => api.get('/predict/history'),
};

// ─── X-Ray ───────────────────────────────────────────────────────────────────
export const xrayAPI = {
  analyze: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/xray/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getHistory: () => api.get('/xray/history'),
};

// ─── Chatbot ─────────────────────────────────────────────────────────────────
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getHistory: (session_id) => api.get('/chat/history', { params: { session_id } }),
};

// ─── OCR ─────────────────────────────────────────────────────────────────────
export const ocrAPI = {
  scan: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/ocr/scan', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getHistory: () => api.get('/ocr/history'),
};

// ─── Wearables ───────────────────────────────────────────────────────────────
export const wearableAPI = {
  sync: (data) => api.post('/wearables/sync', data),
  getLatest: () => api.get('/wearables/latest'),
  getHeartRate: () => api.get('/wearables/heart-rate'),
  getSleep: () => api.get('/wearables/sleep'),
  getSteps: () => api.get('/wearables/steps'),
  getDashboard: () => api.get('/wearables/dashboard'),
};

// ─── Emergency ───────────────────────────────────────────────────────────────
export const emergencyAPI = {
  check: (vitals) => api.post('/emergency/check', vitals),
  getMyAlerts: () => api.get('/emergency/alerts'),
  getAllAlerts: () => api.get('/emergency/all-alerts'),
  acknowledge: (id) => api.put(`/emergency/alerts/${id}/acknowledge`),
};

// ─── Analytics ───────────────────────────────────────────────────────────────
export const analyticsAPI = {
  getAdminOverview: () => api.get('/analytics/admin/overview'),
  getDoctorDashboard: () => api.get('/analytics/doctor/dashboard'),
  getHealthTrends: () => api.get('/analytics/patient/health-trends'),
};

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationAPI = {
  getAll: () => api.get('/notifications/'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// ─── Voice ───────────────────────────────────────────────────────────────────
export const voiceAPI = {
  transcribe: (file) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/voice/transcribe', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  speak: (text, lang = 'en') => api.post('/voice/speak', null, { params: { text, lang }, responseType: 'blob' }),
  processCommand: (transcript) => api.post('/voice/command', null, { params: { transcript } }),
};

export default api;
