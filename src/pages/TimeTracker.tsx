import React, { useState, useEffect, useCallback } from 'react';
import { trackingService } from '../api/services';
import { Clock, Play, Square, Calendar, RefreshCw, Timer, Pause, Coffee } from 'lucide-react';
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
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStartTime, setBreakStartTime] = useState<Date | null>(null);
  const [breakElapsedTime, setBreakElapsedTime] = useState<string>('00:00:00');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [workSessionStart, setWorkSessionStart] = useState<Date | null>(null);
  const [totalBreakTime, setTotalBreakTime] = useState<number>(0); // in seconds
  const [lastBreakEnd, setLastBreakEnd] = useState<Date | null>(null);

  useEffect(() => {
    fetchData();
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }
    
    // Auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      if (!isRefreshing) {
        fetchData(true);
      }
    }, 30000);

    return () => clearInterval(refreshInterval);
  }, [isRefreshing]);

  // Real-time timer effect - only runs when working (not on break)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && todayStatus?.check_in_time && !todayStatus?.check_out_time && !isOnBreak) {
      interval = setInterval(() => {
        const checkInTime = new Date(todayStatus.check_in_time);
        const now = new Date();
        
        // Calculate total work time excluding breaks
        let totalWorkTime = now.getTime() - checkInTime.getTime();
        
        // Subtract total break time
        totalWorkTime -= totalBreakTime * 1000;
        
        // If currently on break, subtract current break time
        if (breakStartTime) {
          totalWorkTime -= (now.getTime() - breakStartTime.getTime());
        }
        
        const hours = Math.floor(totalWorkTime / (1000 * 60 * 60));
        const minutes = Math.floor((totalWorkTime % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((totalWorkTime % (1000 * 60)) / 1000);
        
        setElapsedTime(
          `${Math.max(0, hours).toString().padStart(2, '0')}:${Math.max(0, minutes).toString().padStart(2, '0')}:${Math.max(0, seconds).toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, todayStatus?.check_in_time, todayStatus?.check_out_time, isOnBreak, totalBreakTime, breakStartTime]);

  // Break timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOnBreak && breakStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - breakStartTime.getTime();
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        setBreakElapsedTime(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOnBreak, breakStartTime]);

  // Update timer state when todayStatus changes
  useEffect(() => {
    if (todayStatus?.check_in_time && !todayStatus?.check_out_time) {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
      setElapsedTime('00:00:00');
    }
  }, [todayStatus]);

  const fetchData = async (silent = false) => {
    try {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      const [todayResponse, attendanceResponse] = await Promise.all([
        trackingService.getTodayStatus(),
        trackingService.getMyAttendance(),
      ]);

      // Handle case where data might be wrapped differently
      const todayData = todayResponse.data || {};
      const attendanceData = attendanceResponse.data || [];

      setTodayStatus(todayData);
      setAttendance(Array.isArray(attendanceData) ? attendanceData : []);
      setLastRefresh(new Date());
    } catch (error: any) {
      console.error('Failed to fetch data:', error);
      if (!silent) {
        showErrorToast(error.response?.data?.detail || 'Failed to load tracking data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = useCallback(async () => {
    await fetchData(true);
  }, []);

  const handleStartBreak = () => {
    setIsOnBreak(true);
    setBreakStartTime(new Date());
    setBreakElapsedTime('00:00:00');
    setLastBreakEnd(null);
    
    // Show notification
    showNotification('Break Started', 'You are now on break. Work timer is paused.');
  };

  const handleEndBreak = () => {
    if (breakStartTime) {
      // Calculate break duration and add to total break time
      const breakDuration = Math.floor((new Date().getTime() - breakStartTime.getTime()) / 1000);
      setTotalBreakTime(prev => prev + breakDuration);
    }
    
    setIsOnBreak(false);
    setBreakStartTime(null);
    setBreakElapsedTime('00:00:00');
    setLastBreakEnd(new Date());
    
    // Show notification
    showNotification('Break Ended', 'You are back to work. Work timer has resumed.');
  };

  const showNotification = (title: string, body: string, icon?: string) => {
    if (notificationsEnabled && 'Notification' in window) {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'hrms-tracker'
      });
    }
  };

  const handleCheckIn = async () => {
    await handleAsyncError(
      async () => {
        setIsCheckingIn(true);
        await trackingService.checkIn();
        showSuccessToast('Checked in successfully!');
        showNotification('Check-in Successful', 'You have successfully checked in for the day!');
        
        // Initialize work session
        setWorkSessionStart(new Date());
        setTotalBreakTime(0);
        setLastBreakEnd(null);
        
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
        showNotification('Check-out Successful', 'You have successfully checked out for the day!');
        
        // Reset break tracking
        setIsOnBreak(false);
        setBreakStartTime(null);
        setBreakElapsedTime('00:00:00');
        setTotalBreakTime(0);
        setLastBreakEnd(null);
        setWorkSessionStart(null);
        
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
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Time Tracker</h2>
          <p className="text-gray-600 dark:text-gray-400">Track your daily attendance and working hours</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${notificationsEnabled ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </div>
        </div>
      </div>

      {/* Today's Status */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6 flex items-center">
          <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
          Today's Status - {format(new Date(), 'MMMM dd, yyyy')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Check-in Time</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(todayStatus?.check_in_time)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Check-out Time</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatTime(todayStatus?.check_out_time)}
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Work Time</div>
            <div className={`text-2xl font-bold ${isTimerRunning && !isOnBreak ? 'text-green-600 dark:text-green-400 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
              {isTimerRunning && !isOnBreak ? elapsedTime : '00:00:00'}
            </div>
            {isTimerRunning && !isOnBreak && (
              <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Working
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center">
              <Coffee className="h-4 w-4 mr-1" />
              {isOnBreak ? 'Break Time' : 'Total Breaks'}
            </div>
            <div className={`text-2xl font-bold ${isOnBreak ? 'text-yellow-600 dark:text-yellow-400 animate-pulse' : 'text-gray-900 dark:text-white'}`}>
              {isOnBreak ? breakElapsedTime : formatDuration(totalBreakTime / 3600)}
            </div>
            {isOnBreak && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 flex items-center justify-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse mr-1"></div>
                On Break
              </div>
            )}
          </div>

          <div className="text-center">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Hours</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {todayStatus?.total_hours 
                ? formatDuration(todayStatus.total_hours)
                : '--h --m'
              }
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          {!todayStatus?.check_in_time ? (
            <button
              onClick={handleCheckIn}
              disabled={isCheckingIn}
              className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg shadow-lg text-white bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
            >
              {isCheckingIn ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              ) : (
                <Play className="h-6 w-6 mr-3" />
              )}
              {isCheckingIn ? 'Checking In...' : 'Check In'}
            </button>
          ) : !todayStatus?.check_out_time ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {isOnBreak ? 'Currently on Break' : 'Currently Working'}
                </div>
                <div className={`text-lg font-semibold flex items-center ${isOnBreak ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                  <div className={`w-3 h-3 rounded-full animate-pulse mr-2 ${isOnBreak ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  {isOnBreak ? 'On Break - Work Timer Paused' : 'Active Session - Work Timer Running'}
                </div>
                {totalBreakTime > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Total break time today: {formatDuration(totalBreakTime / 3600)}
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                {!isOnBreak ? (
                  <button
                    onClick={handleStartBreak}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-gray-800 transform hover:scale-105 transition-all duration-200"
                  >
                    <Coffee className="h-5 w-5 mr-2" />
                    Start Break
                  </button>
                ) : (
                  <button
                    onClick={handleEndBreak}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transform hover:scale-105 transition-all duration-200"
                  >
                    <Pause className="h-5 w-5 mr-2" />
                    End Break
                  </button>
                )}
                <button
                  onClick={handleCheckOut}
                  disabled={isCheckingOut}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-lg text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transform hover:scale-105 transition-all duration-200"
                >
                  {isCheckingOut ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Square className="h-5 w-5 mr-2" />
                  )}
                  {isCheckingOut ? 'Checking Out...' : 'Check Out'}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-600 dark:text-green-400 font-semibold text-lg mb-2 flex items-center justify-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                Day Completed
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Great work! You've completed your working day.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Attendance History
          </h3>
        </div>
        <div className="overflow-x-auto">
          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your attendance history will appear here.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTime(record.check_in_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTime(record.check_out_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.total_hours 
                        ? formatDuration(record.total_hours)
                        : '--h --m'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        record.check_out_time 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
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