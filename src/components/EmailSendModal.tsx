import React, { useState, useEffect } from 'react';
import { X, Users, Send, User, AlertCircle, CheckCircle } from 'lucide-react';
import { emailService } from '../api/services';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  designation: string;
  is_active: boolean;
}

interface EmailSendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEmailSent: () => void;
}

export const EmailSendModal: React.FC<EmailSendModalProps> = ({
  isOpen,
  onClose,
  onEmailSent,
}) => {
  const [emailData, setEmailData] = useState({
    recipient_email: '',
    recipient_name: '',
    subject: '',
    body: '',
    template_type: '',
  });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [sendMode, setSendMode] = useState<'single' | 'bulk'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await emailService.getUsersForEmail();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEmailData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelect = (user: User) => {
    if (sendMode === 'single') {
      setEmailData(prev => ({
        ...prev,
        recipient_email: user.email,
        recipient_name: user.name,
      }));
    } else {
      const isSelected = selectedUsers.find(u => u.id === user.id);
      if (isSelected) {
        setSelectedUsers(prev => prev.filter(u => u.id !== user.id));
      } else {
        setSelectedUsers(prev => [...prev, user]);
      }
    }
  };

  const handleSendEmail = async () => {
    setIsLoading(true);
    try {
      if (sendMode === 'single') {
        await emailService.sendEmail(emailData);
        toast.success('Email sent successfully!');
      } else {
        const recipientEmails = selectedUsers.map(user => user.email);
        const recipientNames = selectedUsers.map(user => user.name);
        await emailService.sendBulkEmails({
          recipient_emails: recipientEmails,
          recipient_names: recipientNames,
          subject: emailData.subject,
          body: emailData.body,
          template_type: emailData.template_type,
        });
        toast.success(`Email sent to ${recipientEmails.length} recipients!`);
      }
      onEmailSent();
      onClose();
    } catch (error: any) {
      toast.error('Failed to send email');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmailData({
      recipient_email: '',
      recipient_name: '',
      subject: '',
      body: '',
      template_type: '',
    });
    setSelectedUsers([]);
    setSendMode('single');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Send Email</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Send emails to employees</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Send Mode Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Send Mode</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendMode"
                  value="single"
                  checked={sendMode === 'single'}
                  onChange={(e) => setSendMode(e.target.value as 'single' | 'bulk')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Single Recipient
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="sendMode"
                  value="bulk"
                  checked={sendMode === 'bulk'}
                  onChange={(e) => setSendMode(e.target.value as 'single' | 'bulk')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Multiple Recipients
                </span>
              </label>
            </div>
          </div>

          {/* Recipient Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recipients</h3>
            
            {isLoadingUsers ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        sendMode === 'single' && emailData.recipient_email === user.email
                          ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                          : sendMode === 'bulk' && selectedUsers.find(u => u.id === user.id)
                          ? 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            {user.designation && (
                              <div className="text-xs text-gray-400 dark:text-gray-500">{user.designation}</div>
                            )}
                          </div>
                        </div>
                        {(sendMode === 'single' && emailData.recipient_email === user.email) ||
                         (sendMode === 'bulk' && selectedUsers.find(u => u.id === user.id)) ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sendMode === 'bulk' && selectedUsers.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    {selectedUsers.length} recipient{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Email Content */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Content</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={emailData.subject}
                onChange={handleInputChange}
                placeholder="Enter email subject"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Template Type (Optional)
              </label>
              <input
                type="text"
                name="template_type"
                value={emailData.template_type}
                onChange={handleInputChange}
                placeholder="e.g., welcome, notification, announcement"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message Body *
              </label>
              <textarea
                name="body"
                value={emailData.body}
                onChange={handleInputChange}
                placeholder="Enter your email message here..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                required
              />
            </div>
          </div>

          {/* Help Text */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Email Tips:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Use HTML tags for formatting (e.g., &lt;b&gt;bold&lt;/b&gt;, &lt;p&gt;paragraph&lt;/p&gt;)</li>
                  <li>• Template type helps categorize emails for reporting</li>
                  <li>• Make sure email settings are configured before sending</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSendEmail}
            disabled={
              isLoading ||
              !emailData.subject ||
              !emailData.body ||
              (sendMode === 'single' && !emailData.recipient_email) ||
              (sendMode === 'bulk' && selectedUsers.length === 0)
            }
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            {isLoading ? 'Sending...' : `Send ${sendMode === 'bulk' ? `to ${selectedUsers.length} recipients` : 'Email'}`}
          </button>
        </div>
      </div>
    </div>
  );
};
