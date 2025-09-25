import React, { useState, useEffect } from 'react';
import { adminService, leaveService, userService, holidayService } from '../../api/services';
import { Users, FileText, Calendar, TrendingUp, CheckCircle, XCircle, Plus, Trash2, Mail, Settings, Send, History, Upload, Download, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { UserCreationModal } from '../../components/UserCreationModal';
import { UserEditModal } from '../../components/UserEditModal';
import { HolidayCreationModal } from '../../components/HolidayCreationModal';
import { EmailSettingsModal } from '../../components/EmailSettingsModal';
import { EmailSendModal } from '../../components/EmailSendModal';
import { EmailLogsModal } from '../../components/EmailLogsModal';
import { parseExcelFile, exportHolidaysToExcel, downloadExcelTemplate, HolidayExcelRow } from '../../utils/excelUtils';

interface DashboardStats {
  total_users: number;
  active_users_today: number;
  pending_leaves: number;
  upcoming_holidays: number;
}

interface Leave {
  id: number;
  user_id: number;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  phone?: string;
  designation?: string;
  joining_date?: string;
}

interface Holiday {
  id: number;
  title: string;
  date: string;
  description?: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [upcomingHolidays, setUpcomingHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaves' | 'users' | 'holidays' | 'email'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isEmailSettingsModalOpen, setIsEmailSettingsModalOpen] = useState(false);
  const [isEmailSendModalOpen, setIsEmailSendModalOpen] = useState(false);
  const [isEmailLogsModalOpen, setIsEmailLogsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, leavesResponse, usersResponse, holidaysResponse] = await Promise.all([
        adminService.getDashboard().catch(() => ({ data: null })),
        leaveService.getPendingLeaves().catch(() => ({ data: [] })),
        userService.getUsers().catch(() => ({ data: [] })),
        holidayService.getUpcomingHolidays().catch(() => ({ data: [] })),
      ]);

      setStats(statsResponse.data);
      setPendingLeaves(leavesResponse.data || []);
      setRecentUsers(usersResponse.data?.slice(0, 5) || []);
      setUpcomingHolidays(holidaysResponse.data?.slice(0, 5) || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId: number, action: 'approved' | 'rejected') => {
    try {
      await leaveService.updateLeaveStatus(leaveId, action);
      toast.success(`Leave ${action} successfully`);
      fetchDashboardData();
    } catch (error) {
      toast.error(`Failed to ${action} leave`);
    }
  };

  const handleUserStatusToggle = async (userId: number) => {
    try {
      await userService.toggleUserStatus(userId);
      toast.success('User status updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleDeleteHoliday = async (holidayId: number) => {
    try {
      await holidayService.deleteHoliday(holidayId);
      toast.success('Holiday deleted successfully');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to delete holiday');
    }
  };

  const handleUserCreated = () => {
    fetchDashboardData();
  };

  // const handleEditUser = (user: User) => {
  //   setSelectedUser(user);
  //   setIsEditModalOpen(true);
  // };

  const handleUserUpdated = () => {
    fetchDashboardData();
  };

  const handleHolidayCreated = () => {
    fetchDashboardData();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('Excel file selected:', file.name, 'Size:', file.size, 'Type:', file.type);

    try {
      toast.loading('Parsing Excel file...', { id: 'excel-upload' });
      
      const holidays = await parseExcelFile(file);
      console.log('Parsed holidays from Excel:', holidays);
      
      if (holidays.length === 0) {
        toast.error('No valid holidays found in Excel file. Please check the format.', { id: 'excel-upload' });
        return;
      }

      toast.loading(`Uploading ${holidays.length} holidays...`, { id: 'excel-upload' });

      // Convert to the format expected by the API
      const payload = holidays.map(holiday => ({
        title: holiday.title,
        date: holiday.date,
        description: holiday.description,
        is_active: holiday.is_active !== false, // Default to true if not specified
      }));

      console.log('Payload to send to API:', payload);

      await holidayService.bulkUploadHolidays(payload);
      toast.success(`${holidays.length} holidays uploaded successfully!`, { id: 'excel-upload' });
      
      // Reset file input
      e.target.value = '';
      
      // Refresh the dashboard data
      await fetchDashboardData();
    } catch (error) {
      console.error('Excel upload error:', error);
      toast.error(`Failed to upload Excel file: ${error.message}`, { id: 'excel-upload' });
    }
  };

  const handleExportToExcel = () => {
    try {
      const excelData: HolidayExcelRow[] = upcomingHolidays.map(holiday => ({
        title: holiday.title,
        date: holiday.date,
        description: holiday.description,
        is_active: true,
      }));
      
      exportHolidaysToExcel(excelData, `holidays_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      toast.success('Holidays exported to Excel successfully');
    } catch (error) {
      toast.error('Failed to export holidays to Excel');
    }
  };

  const handleDownloadTemplate = () => {
    try {
      downloadExcelTemplate();
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      name: 'Total Users',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      name: 'Active Today',
      value: stats?.active_users_today || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      name: 'Pending Leaves',
      value: stats?.pending_leaves || 0,
      icon: FileText,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    {
      name: 'Upcoming Holidays',
      value: stats?.upcoming_holidays || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Super Admin Dashboard</h2>
        <p className="text-blue-100">Complete HRMS management and monitoring</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'leaves', name: 'Leave Management', icon: FileText },
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'holidays', name: 'Holiday Management', icon: Calendar },
              { id: 'email', name: 'Email Management', icon: Mail },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-colors duration-200`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => (
                  <div key={stat.name} className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg transition-colors duration-200">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-md ${stat.bgColor} dark:bg-opacity-20`}>
                            <stat.icon className={`h-6 w-6 text-white ${stat.color}`} />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{stat.name}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* System Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">User Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active Today</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {stats?.active_users_today}/{stats?.total_users}
                      </span>  
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${stats?.total_users ? (stats.active_users_today / stats.total_users) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Leave Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pending Leaves</span>
                      <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{stats?.pending_leaves}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Upcoming Holidays</span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{stats?.upcoming_holidays}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pending Leave Applications</h3>
                <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {pendingLeaves.length} pending
                </span>
              </div>

              {pendingLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No pending leaves</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">All leave applications have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{leave.user.name}</h4>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{leave.user.email}</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <span className="font-medium">Period:</span> {format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              <span className="font-medium">Reason:</span> {leave.reason}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              Applied on {format(new Date(leave.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleLeaveAction(leave.id, 'approved')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave.id, 'rejected')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Management</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentUsers.map((user) => (
                    <li key={user.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            {user.designation && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.designation}</div>
                            )}
                            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                          >
                            {user.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'holidays' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Holiday Management</h3>
                <div className="flex flex-wrap gap-2">
                  {/* Download Template */}
                  <button
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Template
                  </button>

                  {/* Excel Upload */}
                  <label className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Export Excel */}
                  <button
                    onClick={handleExportToExcel}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </button>

                  {/* Add Holiday Button */}
                  <button 
                    onClick={() => setIsHolidayModalOpen(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Holiday
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {upcomingHolidays.map((holiday) => (
                    <li key={holiday.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{holiday.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                            </div>
                            {holiday.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">{holiday.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium transition-colors duration-200"
                            title="Delete Holiday"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Email Management</h3>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => setIsEmailSettingsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Email Settings
                  </button>
                  <button 
                    onClick={() => setIsEmailSendModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </button>
                  <button 
                    onClick={() => setIsEmailLogsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                  >
                    <History className="h-4 w-4 mr-2" />
                    Email Logs
                  </button>
                </div>
              </div>

              {/* Email Management Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Email Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">SMTP Configuration</span>
                      <button
                        onClick={() => setIsEmailSettingsModalOpen(true)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                      >
                        Configure
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Test Connection</span>
                      <button
                        onClick={() => setIsEmailSettingsModalOpen(true)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
                      >
                        Test
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Quick Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => setIsEmailSendModalOpen(true)}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <Send className="h-5 w-5 text-green-600 dark:text-green-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">Send Email</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Send emails to employees</div>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => setIsEmailLogsModalOpen(true)}
                      className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-3">
                        <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">View Email Logs</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Check email sending history</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Features Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 transition-colors duration-200">
                <h4 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">Email Management Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
                  <div>
                    <h5 className="font-medium mb-2">Email Settings</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Configure SMTP server settings</li>
                      <li>• Test email connection</li>
                      <li>• Manage sender information</li>
                      <li>• Enable/disable email sending</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-2">Email Sending</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Send emails to individual users</li>
                      <li>• Send bulk emails to multiple users</li>
                      <li>• Use HTML formatting</li>
                      <li>• Track email templates</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Creation Modal */}
      <UserCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      {/* User Edit Modal */}
      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={handleUserUpdated}
        user={selectedUser}
      />

      {/* Holiday Creation Modal */}
      <HolidayCreationModal
        isOpen={isHolidayModalOpen}
        onClose={() => setIsHolidayModalOpen(false)}
        onHolidayCreated={handleHolidayCreated}
      />

      {/* Email Settings Modal */}
      <EmailSettingsModal
        isOpen={isEmailSettingsModalOpen}
        onClose={() => setIsEmailSettingsModalOpen(false)}
        onSettingsUpdated={() => {
          // Could refresh email settings status here if needed
        }}
      />

      {/* Email Send Modal */}
      <EmailSendModal
        isOpen={isEmailSendModalOpen}
        onClose={() => setIsEmailSendModalOpen(false)}
        onEmailSent={() => {
          // Could refresh email logs or show success message
        }}
      />

      {/* Email Logs Modal */}
      <EmailLogsModal
        isOpen={isEmailLogsModalOpen}
        onClose={() => setIsEmailLogsModalOpen(false)}
      />
    </div>
  );
};