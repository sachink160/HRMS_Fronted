import { api } from './client';

// Auth Services
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: { name: string; phone?: string }) =>
    api.put('/auth/profile', data),
};

// User Services
export const userService = {
  getUsers: () =>
    api.get('/admin/users'),
  
  toggleUserStatus: (userId: number) =>
    api.put(`/admin/users/${userId}/toggle-status`),
  
  promoteToAdmin: (userId: number) =>
    api.put(`/admin/users/${userId}/promote`),
};

// Leave Services
export const leaveService = {
  getMyLeaves: () =>
    api.get('/leaves/my-leaves'),
  
  applyLeave: (data: { start_date: string; end_date: string; reason: string }) =>
    api.post('/leaves/', data),
  
  getAllLeaves: () =>
    api.get('/admin/leaves'),
  
  updateLeaveStatus: (leaveId: number, status: 'approved' | 'rejected') =>
    status === 'approved' 
      ? api.put(`/admin/leaves/${leaveId}/approve`)
      : api.put(`/admin/leaves/${leaveId}/reject`),
  
  getLeaveReports: () =>
    api.get('/admin/reports/leaves'),
};

// Holiday Services
export const holidayService = {
  getHolidays: () =>
    api.get('/holidays'),
  
  addHoliday: (data: { name: string; date: string; type: string }) =>
    api.post('/admin/holidays', data),
  
  deleteHoliday: (holidayId: number) =>
    api.delete(`/admin/holidays/${holidayId}`),
  
  bulkUploadHolidays: (file: FormData) =>
    api.post('/admin/holidays/bulk-upload', file, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Tracking Services
export const trackingService = {
  checkIn: () =>
    api.post('/trackers/check-in'),
  
  checkOut: () =>
    api.post('/trackers/check-out'),
  
  getTodayStatus: () =>
    api.get('/trackers/today-status'),
  
  getMyAttendance: () =>
    api.get('/trackers/my-attendance'),
  
  getAllAttendance: () =>
    api.get('/trackers/'),
  
  getAttendanceByUser: (userId: number, date?: string) =>
    api.get(`/trackers/user/${userId}`, {
      params: { date },
    }),
};

// Admin Services
export const adminService = {
  getDashboard: () =>
    api.get('/admin/dashboard'),
};