import { api } from './client';

// Auth Services
export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: { name: string; email: string; phone: string; designation: string; joining_date: string; password: string }) =>
    api.post('/auth/register', userData),
  
  registerAdmin: (userData: { name: string; email: string; phone: string; designation: string; joining_date: string; password: string }) =>
    api.post('/auth/register-admin', userData),
  
  getMe: () =>
    api.get('/auth/me'),
  
  getProfile: () =>
    api.get('/auth/profile'),
  
  updateProfile: (data: { name?: string; phone?: string; designation?: string; joining_date?: string }) =>
    api.put('/auth/profile', data),
};

// User Services
export const userService = {
  // Admin user management
  getUsers: (offset = 0, limit = 10) =>
    api.get('/admin/users', { params: { offset, limit } }),
  
  getUserById: (userId: number) =>
    api.get(`/admin/users/${userId}`),
  
  getUserSummary: (userId: number) =>
    api.get(`/admin/user/${userId}/summary`),
  
  createUser: (userData: { name: string; email: string; phone: string; designation: string; joining_date: string; password: string; role: 'user' | 'admin'; wifi_user_id?: string }) =>
    api.post('/admin/users', userData, {
      params: { role: userData.role }
    }),
  
  updateUser: (userId: number, userData: { name?: string; email?: string; phone?: string; designation?: string; joining_date?: string; role?: 'user' | 'admin'; wifi_user_id?: string }) =>
    api.put(`/admin/users/${userId}`, userData),
  
  activateUser: (userId: number) =>
    api.put(`/admin/users/${userId}/activate`),
  
  deactivateUser: (userId: number) =>
    api.put(`/admin/users/${userId}/deactivate`),
  
  toggleUserStatus: (userId: number) =>
    api.put(`/admin/users/${userId}/toggle-status`),
  
  updateUserRole: (userId: number, newRole: 'user' | 'admin') =>
    api.put(`/admin/users/${userId}/role`, null, {
      params: { new_role: newRole }
    }),
  
  promoteToAdmin: (userId: number) =>
    api.put(`/admin/users/${userId}/promote`),
  
  deleteUser: (userId: number) =>
    api.delete(`/admin/users/${userId}`),
  
  // Regular user services
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (userData: { name?: string; phone?: string; designation?: string; joining_date?: string; wifi_user_id?: string }) =>
    api.put('/users/profile', userData),
  
  listUsers: (offset = 0, limit = 10) =>
    api.get('/users', { params: { offset, limit } }),
  
  // File upload services
  uploadProfileImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/upload-profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadAadhaarFront: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/upload-aadhaar-front', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadAadhaarBack: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/upload-aadhaar-back', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  uploadPan: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/upload-pan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Leave Services
export const leaveService = {
  // User leave operations
  getMyLeaves: (offset = 0, limit = 10) =>
    api.get('/leaves/my-leaves', { params: { offset, limit } }),
  
  applyLeave: (data: { start_date: string; end_date: string; reason: string }) =>
    api.post('/leaves', data),
  
  getLeaveById: (leaveId: number) =>
    api.get(`/leaves/${leaveId}`),
  
  // Admin leave operations
  getAllLeaves: (offset = 0, limit = 10, statusFilter?: string) =>
    api.get('/admin/leaves', { params: { offset, limit, status_filter: statusFilter } }),
  
  getPendingLeaves: (offset = 0, limit = 10) =>
    api.get('/admin/leaves/pending', { params: { offset, limit } }),
  
  approveLeave: (leaveId: number) =>
    api.put(`/admin/leaves/${leaveId}/approve`),
  
  rejectLeave: (leaveId: number) =>
    api.put(`/admin/leaves/${leaveId}/reject`),
  
  updateLeaveStatus: (leaveId: number, status: 'approved' | 'rejected') =>
    status === 'approved' 
      ? api.put(`/admin/leaves/${leaveId}/approve`)
      : api.put(`/admin/leaves/${leaveId}/reject`),
  
  // Reports
  getLeaveReports: (startDate?: string, endDate?: string, statusFilter?: string) =>
    api.get('/admin/reports/leaves', { 
      params: { start_date: startDate, end_date: endDate, status_filter: statusFilter } 
    }),
};

// Email Services
export const emailService = {
  // Email Settings
  getEmailSettings: () =>
    api.get('/email/settings'),
  
  createEmailSettings: (settings: {
    smtp_server: string;
    smtp_port: number;
    smtp_username: string;
    smtp_password: string;
    smtp_use_tls: boolean;
    smtp_use_ssl: boolean;
    from_email: string;
    from_name: string;
    is_active: boolean;
  }) =>
    api.post('/email/settings', settings),
  
  updateEmailSettings: (settingsId: number, settings: {
    smtp_server?: string;
    smtp_port?: number;
    smtp_username?: string;
    smtp_password?: string;
    smtp_use_tls?: boolean;
    smtp_use_ssl?: boolean;
    from_email?: string;
    from_name?: string;
    is_active?: boolean;
  }) =>
    api.put(`/email/settings/${settingsId}`, settings),
  
  testEmailConnection: () =>
    api.post('/email/settings/test-connection'),
  
  // Email Templates
  getEmailTemplates: () =>
    api.get('/email/templates'),
  
  createEmailTemplate: (template: {
    name: string;
    subject: string;
    body: string;
    template_type: string;
    is_active: boolean;
  }) =>
    api.post('/email/templates', template),
  
  updateEmailTemplate: (templateId: number, template: {
    name?: string;
    subject?: string;
    body?: string;
    template_type?: string;
    is_active?: boolean;
  }) =>
    api.put(`/email/templates/${templateId}`, template),
  
  deleteEmailTemplate: (templateId: number) =>
    api.delete(`/email/templates/${templateId}`),
  
  // Email Sending
  sendEmail: (emailData: {
    recipient_email: string;
    recipient_name?: string;
    subject: string;
    body: string;
    template_type?: string;
  }) =>
    api.post('/email/send', emailData),
  
  sendBulkEmails: (emailData: {
    recipient_emails: string[];
    recipient_names?: string[];
    subject: string;
    body: string;
    template_type?: string;
  }) =>
    api.post('/email/send-bulk', emailData),
  
  // Users for Email
  getUsersForEmail: () =>
    api.get('/email/users'),
  
  // Email Logs
  getEmailLogs: (offset = 0, limit = 10, statusFilter?: string) =>
    api.get('/email/logs', { 
      params: { offset, limit, status_filter: statusFilter } 
    }),
};

// Holiday Services
export const holidayService = {
  // User holiday operations
  getHolidays: (offset = 0, limit = 10) =>
    api.get('/holidays', { params: { offset, limit } }),
  
  getUpcomingHolidays: () =>
    api.get('/holidays/upcoming'),
  
  getHolidayById: (holidayId: number) =>
    api.get(`/holidays/${holidayId}`),
  
  // Admin holiday operations
  getAllHolidaysAdmin: (offset = 0, limit = 10) =>
    api.get('/admin/holidays', { params: { offset, limit } }),
  
  addHoliday: (data: { title: string; date: string; description?: string; is_active?: boolean }) =>
    api.post('/holidays', data),
  
  updateHoliday: (holidayId: number, data: { title?: string; date?: string; description?: string; is_active?: boolean }) =>
    api.put(`/holidays/${holidayId}`, data),
  
  deleteHoliday: (holidayId: number) =>
    api.delete(`/holidays/${holidayId}`),
  
  // Bulk operations
  bulkUploadHolidays: (holidays: Array<{ title: string; date: string; description?: string }>) =>
    api.post('/admin/holidays/bulk', holidays),
  
  // Excel operations
  bulkUploadExcel: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/admin/holidays/bulk-excel', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  exportHolidaysExcel: () =>
    api.get('/admin/holidays/export-excel', { responseType: 'blob' }),
};

// Tracking Services
export const trackingService = {
  // User tracking operations
  checkIn: () =>
    api.post('/trackers/check-in'),
  
  checkOut: () =>
    api.post('/trackers/check-out'),
  
  getTodayStatus: () =>
    api.get('/trackers/today-status'),
  
  getTodayTracking: () =>
    api.get('/trackers/today'),
  
  getMyTracking: (offset = 0, limit = 10) =>
    api.get('/trackers/my-tracking', { params: { offset, limit } }),
  
  getMyAttendance: (offset = 0, limit = 30) =>
    api.get('/trackers/my-attendance', { params: { offset, limit } }),
  
  // Admin tracking operations
  getAllTracking: (offset = 0, limit = 10) =>
    api.get('/trackers', { params: { offset, limit } }),
  
  getAllTrackingAdmin: (offset = 0, limit = 10, dateFilter?: string) =>
    api.get('/admin/tracking', { params: { offset, limit, date_filter: dateFilter } }),
  
  getTrackingByUser: (userId: number, offset = 0, limit = 10) =>
    api.get(`/trackers/user/${userId}`, { params: { offset, limit } }),
  
  // Reports
  getAttendanceReport: (startDate?: string, endDate?: string) =>
    api.get('/admin/reports/attendance', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
};

// Admin Services
export const adminService = {
  // Dashboard
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  // User Management
  getUsers: (offset = 0, limit = 10) =>
    api.get('/admin/users', { params: { offset, limit } }),
  
  getUserById: (userId: number) =>
    api.get(`/admin/users/${userId}`),
  
  getUserSummary: (userId: number) =>
    api.get(`/admin/user/${userId}/summary`),
  
  createUser: (userData: { name: string; email: string; phone: string; designation: string; joining_date: string; password: string; role: 'user' | 'admin' }) =>
    api.post('/admin/users', userData, { params: { role: userData.role } }),
  
  updateUser: (userId: number, userData: { name?: string; email?: string; phone?: string; designation?: string; joining_date?: string; role?: 'user' | 'admin' }) =>
    api.put(`/admin/users/${userId}`, userData),
  
  activateUser: (userId: number) =>
    api.put(`/admin/users/${userId}/activate`),
  
  deactivateUser: (userId: number) =>
    api.put(`/admin/users/${userId}/deactivate`),
  
  toggleUserStatus: (userId: number) =>
    api.put(`/admin/users/${userId}/toggle-status`),
  
  updateUserRole: (userId: number, newRole: 'user' | 'admin') =>
    api.put(`/admin/users/${userId}/role`, null, { params: { new_role: newRole } }),
  
  promoteUser: (userId: number) =>
    api.put(`/admin/users/${userId}/promote`),
  
  deleteUser: (userId: number) =>
    api.delete(`/admin/users/${userId}`),

  // Document approvals (super admin)
  approveDocument: (userId: number, docType: 'profile'|'aadhaar_front'|'aadhaar_back'|'pan') =>
    api.put(`/admin/users/${userId}/documents/${docType}/approve`),
  rejectDocument: (userId: number, docType: 'profile'|'aadhaar_front'|'aadhaar_back'|'pan', reason?: string) =>
    api.put(`/admin/users/${userId}/documents/${docType}/reject`, { reason }),

  // Super admin uploads on behalf of users
  uploadUserProfileImage: (userId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/admin/users/${userId}/upload-profile-image`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadUserAadhaarFront: (userId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/admin/users/${userId}/upload-aadhaar-front`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadUserAadhaarBack: (userId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/admin/users/${userId}/upload-aadhaar-back`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadUserPan: (userId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/admin/users/${userId}/upload-pan`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  
  // Leave Management
  getAllLeaves: (offset = 0, limit = 10, statusFilter?: string) =>
    api.get('/admin/leaves', { params: { offset, limit, status_filter: statusFilter } }),
  
  getPendingLeaves: (offset = 0, limit = 10) =>
    api.get('/admin/leaves/pending', { params: { offset, limit } }),
  
  approveLeave: (leaveId: number) =>
    api.put(`/admin/leaves/${leaveId}/approve`),
  
  rejectLeave: (leaveId: number) =>
    api.put(`/admin/leaves/${leaveId}/reject`),
  
  // Holiday Management
  getAllHolidays: (offset = 0, limit = 10) =>
    api.get('/admin/holidays', { params: { offset, limit } }),
  
  createHoliday: (data: { title: string; date: string; description?: string }) =>
    api.post('/holidays', data),
  
  updateHoliday: (holidayId: number, data: { title?: string; date?: string; description?: string }) =>
    api.put(`/holidays/${holidayId}`, data),
  
  deleteHoliday: (holidayId: number) =>
    api.delete(`/holidays/${holidayId}`),
  
  bulkCreateHolidays: (holidays: Array<{ title: string; date: string; description?: string }>) =>
    api.post('/admin/holidays/bulk', holidays),
  
  // Tracking Management
  getAllTracking: (offset = 0, limit = 10, dateFilter?: string) =>
    api.get('/admin/tracking', { params: { offset, limit, date_filter: dateFilter } }),
  
  getTrackingByUser: (userId: number, offset = 0, limit = 10) =>
    api.get(`/trackers/user/${userId}`, { params: { offset, limit } }),
  
  // Reports
  getAttendanceReport: (startDate?: string, endDate?: string) =>
    api.get('/admin/reports/attendance', { 
      params: { start_date: startDate, end_date: endDate } 
    }),
  
  getLeaveReports: (startDate?: string, endDate?: string, statusFilter?: string) =>
    api.get('/admin/reports/leaves', { 
      params: { start_date: startDate, end_date: endDate, status_filter: statusFilter } 
    }),
};