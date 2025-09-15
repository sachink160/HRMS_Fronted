import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { trackingService, leaveService, holidayService } from '../api/services';
import { Calendar, Clock, FileText, CheckCircle, User, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface DashboardStats {
  todayStatus: any;
  myLeaves: any[];
  upcomingHolidays: any[];
}

export const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayStatus: null,
    myLeaves: [],
    upcomingHolidays: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [todayStatus, myLeaves, holidays] = await Promise.all([
          trackingService.getTodayStatus().catch(() => ({ data: null })),
          leaveService.getMyLeaves().catch(() => ({ data: [] })),
          holidayService.getHolidays().catch(() => ({ data: [] })),
        ]);

        setStats({
          todayStatus: todayStatus.data,
          myLeaves: myLeaves.data?.slice(0, 3) || [],
          upcomingHolidays: holidays.data?.slice(0, 3) || [],
        });
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="text-blue-100">Here's your personal HRMS dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/profile"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Profile</h3>
            <p className="text-sm text-gray-600">Manage your information</p>
          </div>
        </Link>

        <Link
          to="/leaves"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-2 bg-green-100 rounded-lg mr-4">
            <FileText className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Leave Management</h3>
            <p className="text-sm text-gray-600">Apply and track leaves</p>
          </div>
        </Link>

        <Link
          to="/tracker"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-2 bg-purple-100 rounded-lg mr-4">
            <Clock className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Time Tracker</h3>
            <p className="text-sm text-gray-600">Track your attendance</p>
          </div>
        </Link>

        <Link
          to="/holidays"
          className="flex items-center p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="p-2 bg-orange-100 rounded-lg mr-4">
            <Calendar className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Holidays</h3>
            <p className="text-sm text-gray-600">View upcoming holidays</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Status</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.todayStatus?.check_in_time ? 'Checked In' : 'Not Checked In'}
              </p>
            </div>
          </div>
          {stats.todayStatus?.check_in_time && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Check-in: {format(new Date(stats.todayStatus.check_in_time), 'HH:mm')}
              </p>
              {stats.todayStatus.check_out_time && (
                <p className="text-sm text-gray-600">
                  Check-out: {format(new Date(stats.todayStatus.check_out_time), 'HH:mm')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Leave Balance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Leave Balance</p>
              <p className="text-2xl font-semibold text-gray-900">15 Days</p>
            </div>
          </div>
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.myLeaves.filter(leave => leave.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Next Holiday</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.upcomingHolidays[0]?.title || 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Applications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Leave Applications</h3>
          </div>
          <div className="p-6">
            {stats.myLeaves.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No leave applications yet</p>
            ) : (
              <div className="space-y-3">
                {stats.myLeaves.map((leave) => (
                  <div key={leave.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {format(new Date(leave.start_date), 'MMM dd')} - {format(new Date(leave.end_date), 'MMM dd')}
                      </p>
                      <p className="text-sm text-gray-600">{leave.reason}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Upcoming Holidays</h3>
          </div>
          <div className="p-6">
            {stats.upcomingHolidays.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming holidays</p>
            ) : (
              <div className="space-y-3">
                {stats.upcomingHolidays.map((holiday) => (
                  <div key={holiday.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{holiday.title}</p>
                      <p className="text-sm text-gray-600">{holiday.description}</p>
                    </div>
                    <span className="text-sm font-medium text-blue-600">
                      {format(new Date(holiday.date), 'MMM dd')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
