import React, { useState, useEffect } from 'react';
import { userService } from '../../api/services';
import { Users, Plus, Edit, Trash2, UserCheck, UserX, Search, FileText, Image, Eye } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { UserCreationModal } from '../../components/UserCreationModal';
import { UserEditModal } from '../../components/UserEditModal';
import { UserViewModal } from '../../components/UserViewModal';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl } from '../../utils/apiUtils';

interface User {
  id: number;
  name: string;
  email: string;
  wifi_user_id?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  phone?: string;
  designation?: string;
  joining_date?: string;
  profile_image?: string;
  aadhaar_front?: string;
  aadhaar_back?: string;
  pan_image?: string;
}

export const UserManagement: React.FC = () => {
  useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      await userService.toggleUserStatus(userId);
      toast.success('User status updated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };


  const handleUserCreated = () => {
    fetchUsers();
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
  };


  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension || '')) {
      return <Image className="w-4 h-4 text-blue-500" />;
    }
    return <FileText className="w-4 h-4 text-gray-500" />;
  };

  // Note: document approve/reject handlers are defined in edit modal.

  const handleDeleteUser = async (userId: number, userName: string, userRole: string) => {
    // Prevent deletion of super admin users
    if (userRole === 'super_admin') {
      toast.error('Cannot delete super admin users');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      try {
        await userService.deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.wifi_user_id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  const getDocumentsCount = (u: User) => {
    let count = 0;
    if (u.aadhaar_front) count += 1;
    if (u.aadhaar_back) count += 1;
    if (u.pan_image) count += 1;
    return count;
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
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-700 dark:to-primary-800 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold">Employee Management</h2>
        <p className="text-blue-100 dark:text-primary-200/80">Manage employees, designations, and roles</p>
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
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-full bg-white dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white"
            />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
              <option value="super_admin">Super Admins</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Add Employee Button */}
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
            Employees ({filteredUsers.length})
          </h3>
        </div>
        
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No employees found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by adding a new employee.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">WiFi ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Designation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Docs</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    {/* Name */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          {user.profile_image ? (
                            <img src={getFileUrl(user.profile_image) || ''} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name.charAt(0).toUpperCase()}</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div>
                        <a href={`mailto:${user.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">{user.email}</a>
                      </div>
                      {user.phone && <div className="text-gray-500 dark:text-gray-400">{user.phone}</div>}
                    </td>

                    {/* WiFi ID */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{user.wifi_user_id || '-'}</td>

                    {/* Role */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)} dark:opacity-90`}>{getRoleDisplayName(user.role)}</span>
                    </td>

                    {/* Designation */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">{user.designation || '-'}</td>

                    {/* Joined */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {user.joining_date ? format(new Date(user.joining_date), 'MMM dd, yyyy') : format(new Date(user.created_at), 'MMM dd, yyyy')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.is_active ? 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20' : 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20'}`}>{user.is_active ? 'Active' : 'Inactive'}</span>
                    </td>

                    {/* Docs */}
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">{getDocumentsCount(user)} of 3</span>
                        {user.aadhaar_front && (
                          <a href={getFileUrl(user.aadhaar_front) || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700" title="Aadhaar Front">
                            {getFileIcon(user.aadhaar_front)}
                          </a>
                        )}
                        {user.aadhaar_back && (
                          <a href={getFileUrl(user.aadhaar_back) || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700" title="Aadhaar Back">
                            {getFileIcon(user.aadhaar_back)}
                          </a>
                        )}
                        {user.pan_image && (
                          <a href={getFileUrl(user.pan_image) || '#'} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700" title="PAN">
                            {getFileIcon(user.pan_image)}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end space-x-1">
                        <button onClick={() => handleViewUser(user)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`p-2 rounded-md ${user.is_active ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                          title={user.is_active ? 'Deactivate User' : 'Activate User'}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button onClick={() => handleEditUser(user)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md" title="Edit User">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name, user.role)}
                          className={`p-2 rounded-md ${user.role === 'super_admin' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'}`}
                          title={user.role === 'super_admin' ? 'Cannot delete super admin' : 'Delete User'}
                          disabled={user.role === 'super_admin'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Employees</div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Employees</div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {users.filter(u => u.is_active).length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Admins</div>
          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            {users.filter(u => u.role === 'admin' || u.role === 'super_admin').length}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-200">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Regular Employees</div>
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
            {users.filter(u => u.role === 'user').length}
          </div>
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

      {/* User View Modal */}
      <UserViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
      />
    </div>
  );
};
