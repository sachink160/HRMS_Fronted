import React, { useState, useEffect } from 'react';
import { X, Mail, Server, Shield, TestTube, Save, AlertCircle } from 'lucide-react';
import { emailService } from '../api/services';
import toast from 'react-hot-toast';

interface EmailSettings {
  id?: number;
  smtp_server: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_use_tls: boolean;
  smtp_use_ssl: boolean;
  from_email: string;
  from_name: string;
  is_active: boolean;
}

interface EmailSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated: () => void;
}

export const EmailSettingsModal: React.FC<EmailSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
}) => {
  const [settings, setSettings] = useState<EmailSettings>({
    smtp_server: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_use_tls: true,
    smtp_use_ssl: false,
    from_email: '',
    from_name: '',
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [existingSettings, setExistingSettings] = useState<EmailSettings | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingSettings();
    }
  }, [isOpen]);

  const fetchExistingSettings = async () => {
    try {
      const response = await emailService.getEmailSettings();
      if (response.data) {
        setExistingSettings(response.data);
        setSettings(response.data);
      }
    } catch (error) {
      // No existing settings, use defaults
      setExistingSettings(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) : value,
    }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    try {
      const response = await emailService.testEmailConnection();
      if (response.data.success) {
        toast.success('Email connection test successful!');
      } else {
        toast.error(`Connection test failed: ${response.data.message}`);
      }
    } catch (error: any) {
      toast.error('Connection test failed. Please check your settings.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (existingSettings) {
        await emailService.updateEmailSettings(existingSettings.id!, settings);
        toast.success('Email settings updated successfully!');
      } else {
        await emailService.createEmailSettings(settings);
        toast.success('Email settings created successfully!');
      }
      onSettingsUpdated();
      onClose();
    } catch (error: any) {
      toast.error('Failed to save email settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-700 dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 dark:bg-blue-900/20 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white dark:text-white">Email Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400">Configure SMTP settings for sending emails</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* SMTP Server Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Server className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white">SMTP Server Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 mb-1">
                  SMTP Server *
                </label>
                <input
                  type="text"
                  name="smtp_server"
                  value={settings.smtp_server}
                  onChange={handleInputChange}
                  placeholder="smtp.gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  SMTP Port *
                </label>
                <input
                  type="number"
                  name="smtp_port"
                  value={settings.smtp_port}
                  onChange={handleInputChange}
                  placeholder="587"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="smtp_username"
                  value={settings.smtp_username}
                  onChange={handleInputChange}
                  placeholder="your-email@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="smtp_password"
                  value={settings.smtp_password}
                  onChange={handleInputChange}
                  placeholder="App password or account password"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smtp_use_tls"
                  checked={settings.smtp_use_tls}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Use TLS</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="smtp_use_ssl"
                  checked={settings.smtp_use_ssl}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Use SSL</span>
              </label>
            </div>
          </div>

          {/* From Email Configuration */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">From Email Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Email *
                </label>
                <input
                  type="email"
                  name="from_email"
                  value={settings.from_email}
                  onChange={handleInputChange}
                  placeholder="noreply@company.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Name *
                </label>
                <input
                  type="text"
                  name="from_name"
                  value={settings.from_name}
                  onChange={handleInputChange}
                  placeholder="HRMS System"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-gray-400 dark:text-gray-500 dark:text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Status</h3>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                checked={settings.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active (Enable email sending)</span>
            </label>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">Common SMTP Settings:</p>
                <ul className="space-y-1 text-xs">
                  <li><strong>Gmail:</strong> smtp.gmail.com, Port 587, TLS enabled</li>
                  <li><strong>Outlook:</strong> smtp-mail.outlook.com, Port 587, TLS enabled</li>
                  <li><strong>Yahoo:</strong> smtp.mail.yahoo.com, Port 587, TLS enabled</li>
                </ul>
                <p className="mt-2 text-xs">
                  For Gmail, you may need to use an App Password instead of your regular password.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <button
            onClick={handleTestConnection}
            disabled={isTesting || !settings.smtp_server || !settings.smtp_username}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <TestTube className="h-4 w-4 mr-2" />
            {isTesting ? 'Testing...' : 'Test Connection'}
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !settings.smtp_server || !settings.smtp_username || !settings.from_email}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
