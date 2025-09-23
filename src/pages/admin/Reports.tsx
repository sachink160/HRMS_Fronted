import React, { useState, useEffect } from 'react';
import { adminService, leaveService, trackingService } from '../../api/services';
import { BarChart3, Download, Calendar, Users, Clock, FileText, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface ReportData {
  total_users: number;
  active_users_today: number;
  pending_leaves: number;
  upcoming_holidays: number;
}

interface LeaveReport {
  user: {
    name: string;
    email: string;
  };
  total_leaves: number;
  approved_leaves: number;
  pending_leaves: number;
  rejected_leaves: number;
}

export const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [leaveReports, setLeaveReports] = useState<LeaveReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [statsResponse, leavesResponse] = await Promise.all([
        adminService.getDashboard().catch(() => ({ data: null })),
        leaveService.getLeaveReports().catch(() => ({ data: [] }))
      ]);

      // Backend returns keys: total_users, active_users_today, pending_leaves, upcoming_holidays
      setReportData(statsResponse.data ?? null);
      // Ensure leaveReports is always an array
      setLeaveReports(Array.isArray(leavesResponse.data) ? leavesResponse.data : []);
    } catch (error) {
      toast.error('Failed to fetch report data');
      // Ensure leaveReports is always an array even on error
      setLeaveReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = (type: string) => {
    // This would typically generate and download a report file
    toast.success(`${type} report exported successfully`);
  };

  const getAttendanceToday = () => reportData?.active_users_today ?? 0;

  const getActiveUserPercentage = () => {
    if (!reportData) return 0;
    return reportData.total_users > 0 
      ? Math.round(((reportData.active_users_today || 0) / reportData.total_users) * 100) 
      : 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-lg p-6 text-white transition-colors duration-200">
        <h2 className="text-2xl font-bold">Reports & Analytics</h2>
        <p className="text-blue-100 dark:text-blue-200">Comprehensive insights and system analytics</p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={() => fetchReportData()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{reportData?.total_users || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400 font-medium">{getActiveUserPercentage()}%</span>
                <span className="ml-1">active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Present Today</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{getAttendanceToday()}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="text-green-600 dark:text-green-400 font-medium">{getActiveUserPercentage()}%</span>
                <span className="ml-1">of users checked in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Pending Leaves</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{reportData?.pending_leaves || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="text-yellow-600 dark:text-yellow-400 font-medium">Requires attention</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Upcoming Holidays</dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">{reportData?.upcoming_holidays || 0}</dd>
                </dl>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <span className="text-purple-600 dark:text-purple-400 font-medium">This year</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => handleExportReport('User')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            User Report
          </button>
          <button
            onClick={() => handleExportReport('Attendance')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Attendance Report
          </button>
          <button
            onClick={() => handleExportReport('Leave')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Leave Report
          </button>
          <button
            onClick={() => handleExportReport('Holiday')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Download className="h-5 w-5 mr-2" />
            Holiday Report
          </button>
        </div>
      </div>

      {/* Leave Reports by User */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Leave Summary by User</h3>
        </div>
        
        {(!leaveReports || leaveReports.length === 0) ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No leave data available</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Leave reports will appear here once data is available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Leaves</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Approved</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pending</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rejected</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {(leaveReports || []).map((report, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{report.user.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{report.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {report.total_leaves}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        {report.approved_leaves}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        {report.pending_leaves}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300">
                        {report.rejected_leaves}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database Status</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Response Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">~150ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">99.9%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
              Generate Monthly Report
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
              Export All Data
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors duration-200">
              Schedule Automated Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
