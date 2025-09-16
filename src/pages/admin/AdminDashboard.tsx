import React, { useState, useEffect } from 'react';
import { adminService, leaveService, userService, holidayService } from '../../api/services';
import { Users, FileText, Calendar, Clock, TrendingUp, CheckCircle, XCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { UserCreationModal } from '../../components/UserCreationModal';
import { UserEditModal } from '../../components/UserEditModal';

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
  role: string;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'leaves' | 'users' | 'holidays'>('overview');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleUserUpdated = () => {
    fetchDashboardData();
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
      bgColor: 'bg-blue-50',
    },
    {
      name: 'Active Today',
      value: stats?.active_users_today || 0,
      icon: Users,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
    },
    {
      name: 'Pending Leaves',
      value: stats?.pending_leaves || 0,
      icon: FileText,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
    },
    {
      name: 'Upcoming Holidays',
      value: stats?.upcoming_holidays || 0,
      icon: Calendar,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
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
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'leaves', name: 'Leave Management', icon: FileText },
              { id: 'users', name: 'User Management', icon: Users },
              { id: 'holidays', name: 'Holiday Management', icon: Calendar },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
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
                  <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`p-3 rounded-md ${stat.bgColor}`}>
                            <stat.icon className={`h-6 w-6 text-white ${stat.color}`} />
                          </div>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                            <dd className="flex items-baseline">
                              <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
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
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">User Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Today</span>
                      <span className="text-sm font-medium text-green-600">
                        {stats?.active_users_today}/{stats?.total_users}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{
                          width: `${stats?.total_users ? (stats.active_users_today / stats.total_users) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Leave Management</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Pending Leaves</span>
                      <span className="text-sm font-medium text-yellow-600">{stats?.pending_leaves}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Upcoming Holidays</span>
                      <span className="text-sm font-medium text-purple-600">{stats?.upcoming_holidays}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'leaves' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Pending Leave Applications</h3>
                <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {pendingLeaves.length} pending
                </span>
              </div>

              {pendingLeaves.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending leaves</h3>
                  <p className="mt-1 text-sm text-gray-500">All leave applications have been processed.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingLeaves.map((leave) => (
                    <div key={leave.id} className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h4 className="text-lg font-medium text-gray-900">{leave.user.name}</h4>
                            <span className="text-sm text-gray-500">{leave.user.email}</span>
                          </div>
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Period:</span> {format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Reason:</span> {leave.reason}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Applied on {format(new Date(leave.created_at), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleLeaveAction(leave.id, 'approved')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleLeaveAction(leave.id, 'rejected')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                <h3 className="text-lg font-medium text-gray-900">User Management</h3>
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {recentUsers.map((user) => (
                    <li key={user.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.designation && (
                              <div className="text-sm text-gray-500 font-medium">{user.designation}</div>
                            )}
                            <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <button
                            onClick={() => handleUserStatusToggle(user.id)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
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
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Holiday Management</h3>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </button>
              </div>

              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {upcomingHolidays.map((holiday) => (
                    <li key={holiday.id}>
                      <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Calendar className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{holiday.title}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                            </div>
                            {holiday.description && (
                              <div className="text-sm text-gray-500">{holiday.description}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleEditUser(user)}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHoliday(holiday.id)}
                            className="text-red-600 hover:text-red-900 text-sm font-medium"
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
    </div>
  );
};