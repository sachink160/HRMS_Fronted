import React, { useState, useEffect } from 'react';
import { Save, Clock, Shield, Mail, Settings as SettingsIcon, Bell, Database, Users, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SystemSettings {
  workingHours: {
    start: string;
    end: string;
    timezone: string;
  };
  attendance: {
    allowManualCheck: boolean;
    autoCheckout: boolean;
    gracePeriod: number; // minutes
    requireLocation: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    enableSSL: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    leaveNotifications: boolean;
    attendanceNotifications: boolean;
    holidayNotifications: boolean;
  };
  system: {
    sessionTimeout: number; // minutes
    maxLoginAttempts: number;
    passwordExpiry: number; // days
    enableAuditLog: boolean;
  };
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    workingHours: {
      start: '09:00',
      end: '18:00',
      timezone: 'UTC'
    },
    attendance: {
      allowManualCheck: false,
      autoCheckout: true,
      gracePeriod: 15,
      requireLocation: false
    },
    email: {
      fromName: 'HRMS',
      fromEmail: 'no-reply@example.com',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      enableSSL: true
    },
    notifications: {
      emailNotifications: true,
      leaveNotifications: true,
      attendanceNotifications: true,
      holidayNotifications: true
    },
    system: {
      sessionTimeout: 480, // 8 hours
      maxLoginAttempts: 5,
      passwordExpiry: 90,
      enableAuditLog: true
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    // Load settings from localStorage or API
    const savedSettings = localStorage.getItem('hrms_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // await settingsService.updateSettings(settings);
      
      // For now, save to localStorage
      localStorage.setItem('hrms_settings', JSON.stringify(settings));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        workingHours: {
          start: '09:00',
          end: '18:00',
          timezone: 'UTC'
        },
        attendance: {
          allowManualCheck: false,
          autoCheckout: true,
          gracePeriod: 15,
          requireLocation: false
        },
        email: {
          fromName: 'HRMS',
          fromEmail: 'no-reply@example.com',
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPassword: '',
          enableSSL: true
        },
        notifications: {
          emailNotifications: true,
          leaveNotifications: true,
          attendanceNotifications: true,
          holidayNotifications: true
        },
        system: {
          sessionTimeout: 480,
          maxLoginAttempts: 5,
          passwordExpiry: 90,
          enableAuditLog: true
        }
      });
      toast.success('Settings reset to default values');
    }
  };

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'attendance', name: 'Attendance', icon: Clock },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'system', name: 'System', icon: Database }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Working Hours</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
            <input 
              type="time" 
              value={settings.workingHours.start} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, start: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
            <input 
              type="time" 
              value={settings.workingHours.end} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, end: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
            <select 
              value={settings.workingHours.timezone} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                workingHours: { ...prev.workingHours, timezone: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="UTC">UTC</option>
              <option value="EST">Eastern Time</option>
              <option value="PST">Pacific Time</option>
              <option value="IST">Indian Standard Time</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAttendanceSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Attendance Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Allow Manual Check-in/out</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Allow employees to manually check in and out</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.attendance.allowManualCheck} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, allowManualCheck: e.target.checked }
              }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Check-out</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Automatically check out employees at end of day</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.attendance.autoCheckout} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, autoCheckout: e.target.checked }
              }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Require Location</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Require GPS location for check-in/out</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.attendance.requireLocation} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, requireLocation: e.target.checked }
              }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Grace Period (minutes)</label>
            <input 
              type="number" 
              min="0" 
              max="60" 
              value={settings.attendance.gracePeriod} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendance: { ...prev.attendance, gracePeriod: parseInt(e.target.value) }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Allowable late arrival time in minutes</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <Mail className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Configuration</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Name</label>
            <input 
              value={settings.email.fromName} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email: { ...prev.email, fromName: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Email</label>
            <input 
              type="email"
              value={settings.email.fromEmail} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email: { ...prev.email, fromEmail: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Host</label>
            <input 
              value={settings.email.smtpHost} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email: { ...prev.email, smtpHost: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Port</label>
            <input 
              type="number"
              value={settings.email.smtpPort} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email: { ...prev.email, smtpPort: parseInt(e.target.value) }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Username</label>
            <input 
              value={settings.email.smtpUser} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email: { ...prev.email, smtpUser: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">SMTP Password</label>
            <input 
              type="password"
              value={settings.email.smtpPassword} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                email: { ...prev.email, smtpPassword: e.target.value }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
                checked={settings.email.enableSSL} 
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  email: { ...prev.email, enableSSL: e.target.checked }
                }))} 
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">Enable SSL/TLS</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notification Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Enable email notifications system-wide</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.notifications.emailNotifications} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, emailNotifications: e.target.checked }
              }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Leave Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notify about leave applications and approvals</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.notifications.leaveNotifications} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, leaveNotifications: e.target.checked }
              }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Attendance Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notify about attendance issues and reports</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.notifications.attendanceNotifications} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, attendanceNotifications: e.target.checked }
              }))} 
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Holiday Notifications</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Notify about upcoming holidays</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.notifications.holidayNotifications} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                notifications: { ...prev.notifications, holidayNotifications: e.target.checked }
              }))} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Security Settings</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Timeout (minutes)</label>
            <input 
              type="number" 
              min="30" 
              max="1440" 
              value={settings.system.sessionTimeout} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, sessionTimeout: parseInt(e.target.value) }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Auto-logout after inactivity</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Max Login Attempts</label>
            <input 
              type="number" 
              min="3" 
              max="10" 
              value={settings.system.maxLoginAttempts} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, maxLoginAttempts: parseInt(e.target.value) }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Account lockout threshold</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password Expiry (days)</label>
            <input 
              type="number" 
              min="30" 
              max="365" 
              value={settings.system.passwordExpiry} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, passwordExpiry: parseInt(e.target.value) }
              }))} 
              className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Force password change interval</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Audit Log</label>
              <p className="text-xs text-gray-500 dark:text-gray-400">Log all system activities for security</p>
            </div>
            <input 
              type="checkbox" 
              className="h-4 w-4 text-indigo-600 dark:text-indigo-400" 
              checked={settings.system.enableAuditLog} 
              onChange={(e) => setSettings(prev => ({
                ...prev,
                system: { ...prev.system, enableAuditLog: e.target.checked }
              }))} 
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">System Information</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Database Status</h4>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-sm text-green-600 dark:text-green-400">Connected</span>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">System Uptime</h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">99.9%</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Users</h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">24</span>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Storage Used</h4>
            <span className="text-sm text-gray-600 dark:text-gray-400">2.4 GB / 10 GB</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'attendance':
        return renderAttendanceSettings();
      case 'email':
        return renderEmailSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'security':
        return renderSecuritySettings();
      case 'system':
        return renderSystemSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 dark:from-indigo-800 dark:to-indigo-900 rounded-lg p-6 text-white transition-colors duration-200">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-indigo-100 dark:text-indigo-200">Configure system preferences and application settings</p>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center`}
              >
                <tab.icon className="-ml-0.5 mr-2 h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button 
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          <AlertCircle className="h-4 w-4 mr-2" />
          Reset to Default
        </button>
        <button 
          onClick={handleSave}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;


