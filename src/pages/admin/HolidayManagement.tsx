import React, { useState, useEffect } from 'react';
import { holidayService } from '../../api/services';
import { Calendar, Plus, Edit, Trash2, Search, Upload } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { HolidayEditModal } from '../../components/HolidayEditModal';

interface Holiday {
  id: number;
  title: string;
  date: string;
  description?: string;
  is_active: boolean;
  created_at: string;
}

export const HolidayManagement: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newHoliday, setNewHoliday] = useState({
    title: '',
    date: '',
    description: '',
    is_active: true
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
        title: newHoliday.title,
        date: newHoliday.date,
        description: newHoliday.description || undefined,
        is_active: newHoliday.is_active,
      });
      toast.success('Holiday added successfully');
      setNewHoliday({ title: '', date: '', description: '', is_active: true });
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

  const handleEditHoliday = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setIsEditModalOpen(true);
  };

  const handleHolidayUpdated = () => {
    fetchHolidays();
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      // Minimal CSV: title,date,description
      const lines = text.trim().split(/\r?\n/);
      const [headerLine, ...rows] = lines;
      const headers = headerLine.split(',').map(h => h.trim().toLowerCase());
      const titleIdx = headers.indexOf('title');
      const dateIdx = headers.indexOf('date');
      const descIdx = headers.indexOf('description');
      if (titleIdx === -1 || dateIdx === -1) {
        toast.error('CSV must include title and date columns');
        return;
      }
      const payload = rows
        .map(row => row.split(',').map(col => col.trim()))
        .filter(cols => cols[titleIdx] && cols[dateIdx])
        .map(cols => ({
          title: cols[titleIdx],
          date: cols[dateIdx],
          description: descIdx !== -1 ? cols[descIdx] || undefined : undefined,
        }));

      if (payload.length === 0) {
        toast.error('No valid rows found in CSV');
        return;
      }

      await holidayService.bulkUploadHolidays(payload);
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
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 rounded-lg p-6 text-white transition-colors duration-200">
        <h2 className="text-2xl font-bold">Holiday Management</h2>
        <p className="text-blue-100 dark:text-blue-200">Manage company holidays and special events</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search holidays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

          <div className="flex space-x-2">
            {/* Bulk Upload */}
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200">
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
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white dark:text-white mb-4">Add New Holiday</h3>
          <form onSubmit={handleAddHoliday} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">Holiday Title</label>
                <input
                  type="text"
                  required
                  value={newHoliday.title}
                  onChange={(e) => setNewHoliday({ ...newHoliday, title: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  placeholder="e.g., New Year's Day"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">Date</label>
                <input
                  type="date"
                  required
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">Description (Optional)</label>
              <textarea
                value={newHoliday.description}
                onChange={(e) => setNewHoliday({ ...newHoliday, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Additional details about the holiday"
              />
            </div>
            <div className="flex items-center">
              <input
                id="is_active"
                type="checkbox"
                checked={newHoliday.is_active}
                onChange={(e) => setNewHoliday({ ...newHoliday, is_active: e.target.checked })}
                className="h-4 w-4 text-blue-600 dark:text-blue-400 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300">Active</label>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Total Holidays</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white dark:text-white">{holidays.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Upcoming</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 dark:text-blue-400">{upcomingHolidays.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Past Holidays</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-400 dark:text-gray-400 dark:text-gray-500">{pastHolidays.length}</div>
        </div>
      </div>

      {/* Upcoming Holidays */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white dark:text-white">Upcoming Holidays</h3>
        </div>
        
        {upcomingHolidays.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white dark:text-white">No upcoming holidays</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500 dark:text-gray-400 dark:text-gray-500">Add holidays to see them here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingHolidays.map((holiday) => (
              <li key={holiday.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400 dark:text-blue-400" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{holiday.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                      </div>
                      <div className="text-xs mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${holiday.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                          {holiday.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {holiday.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">{holiday.description}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={async () => {
                        try {
                          await holidayService.updateHoliday(holiday.id, { is_active: !holiday.is_active });
                          toast.success('Holiday status updated');
                          fetchHolidays();
                        } catch (error) {
                          toast.error('Failed to update status');
                        }
                      }}
                      className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:text-white text-sm font-medium"
                    >
                      {holiday.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleEditHoliday(holiday)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 text-sm font-medium"
                      title="Edit Holiday"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 text-sm font-medium"
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
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Past Holidays</h3>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {pastHolidays.slice(0, 5).map((holiday) => (
              <li key={holiday.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <Calendar className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{holiday.title}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 dark:text-gray-500">
                        {format(new Date(holiday.date), 'MMMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditHoliday(holiday)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 text-sm font-medium"
                      title="Edit Holiday"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 text-sm font-medium"
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
      )}

      {/* Holiday Edit Modal */}
      <HolidayEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingHoliday(null);
        }}
        onHolidayUpdated={handleHolidayUpdated}
        holiday={editingHoliday}
      />
    </div>
  );
};
