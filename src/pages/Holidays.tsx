import React, { useState, useEffect } from 'react';
import { holidayService } from '../api/services';
import { Calendar, Clock } from 'lucide-react';
import { format, isAfter, startOfDay } from 'date-fns';
import toast from 'react-hot-toast';

interface Holiday {
  id: number;
  title: string;
  date: string;
  description?: string;
  is_active?: boolean;
}

export const Holidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await holidayService.getHolidays();
      setHolidays(response.data);
    } catch (error) {
      toast.error('Failed to fetch holidays');
    } finally {
      setIsLoading(false);
    }
  };

  const isUpcoming = (date: string) => {
    return isAfter(new Date(date), startOfDay(new Date()));
  };

  const getActiveBadge = (isActive?: boolean) => {
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const visibleHolidays = holidays.filter(h => h.is_active !== false);
  const upcomingHolidays = visibleHolidays.filter(holiday => isUpcoming(holiday.date));
  const pastHolidays = visibleHolidays.filter(holiday => !isUpcoming(holiday.date));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Holiday Calendar</h2>
        <p className="text-gray-600 dark:text-gray-400">View all company holidays and observances</p>
      </div>

      {/* Upcoming Holidays */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
            Upcoming Holidays ({upcomingHolidays.length})
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {upcomingHolidays.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No upcoming holidays</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Check back later for holiday announcements.</p>
            </div>
          ) : (
            upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{holiday.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(holiday.date), 'EEEE, MMMM dd, yyyy')}
                      </p>
                      {holiday.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{holiday.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getActiveBadge(holiday.is_active)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Past Holidays */}
      {pastHolidays.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Past Holidays ({pastHolidays.length})</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {pastHolidays.map((holiday) => (
              <div key={holiday.id} className="p-6 opacity-75">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-700 dark:text-gray-300">{holiday.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(holiday.date), 'EEEE, MMMM dd, yyyy')}
                      </p>
                      {holiday.description && (
                        <p className="text-sm text-gray-400 dark:text-gray-500">{holiday.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getActiveBadge(holiday.is_active)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};