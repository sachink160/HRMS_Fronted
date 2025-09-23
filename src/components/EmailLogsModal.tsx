import React, { useState, useEffect } from 'react';
import { X, Mail, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { emailService } from '../api/services';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface EmailLog {
  id: number;
  recipient_email: string;
  recipient_name: string | null;
  subject: string;
  template_type: string | null;
  status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

interface EmailLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailLogsModal: React.FC<EmailLogsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const limit = 10;

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen, currentPage, statusFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const response = await emailService.getEmailLogs(
        currentPage * limit,
        limit,
        statusFilter || undefined
      );
      setLogs(response.data.items);
      setTotalLogs(response.data.total);
      setTotalPages(Math.ceil(response.data.total / limit));
    } catch (error) {
      toast.error('Failed to fetch email logs');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const handleRefresh = () => {
    fetchLogs();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Email Logs</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">View email sending history and status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-400 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Filters and Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Status</option>
                <option value="sent">Sent</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
              
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            
            <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
              Total: {totalLogs} logs
            </div>
          </div>

          {/* Email Logs Table */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No email logs</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">No emails have been sent yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Recipient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.recipient_name || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{log.recipient_email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate" title={log.subject}>
                          {log.subject}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                          {log.template_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(log.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(log.status)}`}>
                            {log.status}
                          </span>
                        </div>
                        {log.error_message && (
                          <div className="text-xs text-red-600 dark:text-red-400 mt-1 max-w-xs truncate" title={log.error_message}>
                            {log.error_message}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {log.sent_at ? format(new Date(log.sent_at), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalLogs)} of {totalLogs} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      currentPage === i
                        ? 'text-white bg-blue-600'
                        : 'text-gray-500 dark:text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages - 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
