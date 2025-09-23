import React, { useState, useEffect } from 'react';
import { leaveService } from '../../api/services';
import { FileText, CheckCircle, XCircle, Search, Clock } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

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

export const LeaveManagement: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const response = await leaveService.getAllLeaves();
      setLeaves(response.data);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveAction = async (leaveId: number, action: 'approved' | 'rejected') => {
    try {
      await leaveService.updateLeaveStatus(leaveId, action);
      toast.success(`Leave ${action} successfully`);
      fetchLeaves();
    } catch (error) {
      toast.error(`Failed to ${action} leave`);
    }
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = leave.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const leaveDate = new Date(leave.start_date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      if (dateFilter === 'today') {
        matchesDate = leaveDate.toDateString() === today.toDateString();
      } else if (dateFilter === 'this_week') {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        matchesDate = leaveDate >= weekStart && leaveDate <= weekEnd;
      } else if (dateFilter === 'this_month') {
        matchesDate = leaveDate.getMonth() === today.getMonth() && 
                     leaveDate.getFullYear() === today.getFullYear();
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      default:
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const calculateLeaveDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
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
        <h2 className="text-2xl font-bold">Leave Management</h2>
        <p className="text-blue-100 dark:text-blue-200">Review and manage employee leave applications</p>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <input
                type="text"
                placeholder="Search leaves..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Leaves</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{leaves.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pending</div>
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {leaves.filter(l => l.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Approved</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {leaves.filter(l => l.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Rejected</div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {leaves.filter(l => l.status === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Leaves List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Leave Applications ({filteredLeaves.length})
          </h3>
        </div>
        
        {filteredLeaves.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No leave applications found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'No leave applications have been submitted yet.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredLeaves.map((leave) => (
              <li key={leave.id}>
                <div className="px-4 py-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{leave.user.name}</h4>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{leave.user.email}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(leave.status)}`}>
                          {getStatusIcon(leave.status)}
                          <span className="ml-1 capitalize">{leave.status}</span>
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Leave Period</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {format(new Date(leave.start_date), 'MMM dd, yyyy')} - {format(new Date(leave.end_date), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {calculateLeaveDays(leave.start_date, leave.end_date)} day(s)
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reason</p>
                          <p className="text-sm text-gray-900 dark:text-white">{leave.reason}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Applied On</p>
                          <p className="text-sm text-gray-900 dark:text-white">
                            {format(new Date(leave.created_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {leave.status === 'pending' && (
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
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
