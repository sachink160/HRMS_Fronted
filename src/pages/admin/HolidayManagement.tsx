import React, { useState, useEffect } from 'react';
import { holidayService } from '../../api/services';
import { Calendar, Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface Holiday {
  id: number;
  title: string;
  date: string;
  description?: string;
  created_at: string;
}

export const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [newHoliday, setNewHoliday] = useState({
    title: '',
    date: '',
    description: ''
  });

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

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await holidayService.addHoliday({
        name: newHoliday.title,
        date: newHoliday.date,
        type: 'Public Holiday'
      });
      toast.success('Holiday added successfully');
      setNewHoliday({ title: '', date: '', description: '' });
      setShowAddForm(false);
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to add holiday');
    }
  };

  const handleDeleteHoliday = async (holidayId: number) => {
    if (window.confirm('Are you sure you want to delete this holiday?')) {
      try {
        await holidayService.deleteHoliday(holidayId);
        toast.success('Holiday deleted successfully');
        fetchHolidays();
      } catch (error) {
        toast.error('Failed to delete holiday');
      }
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      await holidayService.bulkUploadHolidays(formData);
      toast.success('Holidays uploaded successfully');
      fetchHolidays();
    } catch (error) {
      toast.error('Failed to upload holidays');
    }
  };

  const filteredHolidays = holidays.filter(holiday =>
    holiday.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (holiday.description && holiday.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const upcomingHolidays = holidays.filter(holiday => 
    new Date(holiday.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const pastHolidays = holidays.filter(holiday => 
    new Date(holiday.date) < new Date()
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Holiday Management</h2>
        <p className="text-blue-100">Manage company holidays and special events</p>
      </div>

      {/* Controls */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search holidays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Bulk Upload */}
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Bulk Upload
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleBulkUpload}
                className="hidden"
              />
            </label>

            {/* Add Holiday Button */}
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Holiday
            </button>
          </div>
        </div>
      </div>

      {/* Add Holiday Form */}
      {showAddForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Holiday</h3>
          <form onSubmit={handleAddHoliday} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Holiday Title</label>
                <input
                  type="text"
                  required
                  value={newHoliday.title}
                  onChange={(e) => setNewHoliday({ ...newHoliday, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., New Year's Day"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  required
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
              <textarea
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional details about the holiday"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Add Holiday
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Total Holidays</div>
          <div className="text-2xl font-bold text-gray-900">{holidays.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Upcoming</div>
          <div className="text-2xl font-bold text-blue-600">{upcomingHolidays.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm font-medium text-gray-500">Past Holidays</div>
          <div className="text-2xl font-bold text-gray-600">{pastHolidays.length}</div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Upcoming Holidays</h3>
        </div>
        
        {upcomingHolidays.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming holidays</h3>
            <p className="mt-1 text-sm text-gray-500">Add holidays to see them here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {upcomingHolidays.map((holiday) => (
              <li key={holiday.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
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
                      onClick={() => setEditingHoliday(holiday)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
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
        )}
      </div>

      {/* Past Holidays */}
      {pastHolidays.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Past Holidays</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {pastHolidays.slice(0, 5).map((holiday) => (
              <li key={holiday.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Calendar className="h-6 w-6 text-gray-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{holiday.title}</div>
                      <div className="text-sm text-gray-500">
                        {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
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
      )}
    </div>
  );
};
