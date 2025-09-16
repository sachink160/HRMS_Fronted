import React, { useState, useEffect } from 'react';
import { trackingService } from '../api/services';
import { Clock, Play, Square, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { handleAsyncError, showErrorToast, showSuccessToast } from '../utils/errorHandler';
import { formatTime, formatDate } from '../utils/dateUtils';

interface TodayStatus {
  check_in_time: string | null;
  check_out_time: string | null;
  total_hours: number | null;
}

interface AttendanceRecord {
  id: number;
  date: string;
  check_in_time: string;
  check_out_time: string | null;
  total_hours: number | null;
}

export const TimeTracker: React.FC = () => {
  const [todayStatus, setTodayStatus] = useState<TodayStatus | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [todayResponse, attendanceResponse] = await Promise.all([
        trackingService.getTodayStatus(),
        trackingService.getMyAttendance(),
      ]);

      console.log('Today response:', todayResponse.data);
      console.log('Attendance response:', attendanceResponse.data);

      // Handle case where data might be wrapped differently
      const todayData = todayResponse.data || {};
      const attendanceData = attendanceResponse.data || [];

      setTodayStatus(todayData);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      showErrorToast(error.response?.data?.detail || 'Failed to load tracking data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    await handleAsyncError(
      async () => {
        setIsCheckingIn(true);
        await trackingService.checkIn();
        showSuccessToast('Checked in successfully!');
        await fetchData();
      },
      'Failed to check in'
    );
    setIsCheckingIn(false);
  };

  const handleCheckOut = async () => {
    await handleAsyncError(
      async () => {
        setIsCheckingOut(true);
        await trackingService.checkOut();
        showSuccessToast('Checked out successfully!');
        await fetchData();
      },
      'Failed to check out'
    );
    setIsCheckingOut(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show loading state if data is not yet loaded
  if (!todayStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    return `${h}h ${m}m`;
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Time Tracker</h2>
        <p className="text-gray-600">Track your daily attendance and working hours</p>
      </div>

      {/* Today's Status */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600" />
          Today's Status - {format(new Date(), 'MMMM dd, yyyy')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Check-in Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(todayStatus?.check_in_time)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Check-out Time</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(todayStatus?.check_out_time)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 mb-2">Total Hours</div>
            <div className="text-2xl font-bold text-gray-900">
              {todayStatus?.total_hours 
                ? formatDuration(todayStatus.total_hours)
                : '--h --m'
              }
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center space-x-4">
          {!todayStatus?.check_in_time ? (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isCheckingIn ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              Check In
            </button>
          ) : !todayStatus?.check_out_time ? (
            <button
              onClick={handleCheckOut}
              disabled={isCheckingOut}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isCheckingOut ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Square className="h-5 w-5 mr-2" />
              )}
              Check Out
            </button>
          ) : (
            <div className="text-green-600 font-medium">
              ✓ You have completed your day
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600" />
            Attendance History
          </h3>
        </div>
        <div className="overflow-x-auto">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">Your attendance history will appear here.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.check_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(record.check_out_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.total_hours 
                        ? formatDuration(record.total_hours)
                        : '--h --m'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.check_out_time 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.check_out_time ? 'Complete' : 'Incomplete'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};