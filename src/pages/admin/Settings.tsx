import React, { useState } from 'react';
import { Save, Clock, Shield, Mail } from 'lucide-react';

export const Settings: React.FC = () => {
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });
  const [attendance, setAttendance] = useState({ allowManualCheck: false });
  const [email, setEmail] = useState({ fromName: 'HRMS', fromEmail: 'no-reply@example.com' });

  const handleSave = () => {
    // Placeholder: wire to backend when endpoints exist
    // You can persist to localStorage for now so UI feels responsive
    const payload = { workingHours, attendance, email };
    localStorage.setItem('hrms_settings', JSON.stringify(payload));
    alert('Settings saved');
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-indigo-100">Configure attendance and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Working Hours</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">Start</label>
              <input type="time" value={workingHours.start} onChange={(e) => setWorkingHours({ ...workingHours, start: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">End</label>
              <input type="time" value={workingHours.end} onChange={(e) => setWorkingHours({ ...workingHours, end: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Attendance</h3>
          </div>
          <label className="inline-flex items-center">
            <input type="checkbox" className="h-4 w-4 text-indigo-600" checked={attendance.allowManualCheck} onChange={(e) => setAttendance({ allowManualCheck: e.target.checked })} />
            <span className="ml-2 text-sm text-gray-700">Allow manual check-in/out</span>
          </label>
        </div>

        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Mail className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Email</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700">From Name</label>
              <input value={email.fromName} onChange={(e) => setEmail({ ...email, fromName: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-700">From Email</label>
              <input value={email.fromEmail} onChange={(e) => setEmail({ ...email, fromEmail: e.target.value })} className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;


