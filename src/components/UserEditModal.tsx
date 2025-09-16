import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Briefcase, Calendar } from 'lucide-react';
import { userService } from '../api/services';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  joining_date?: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
}

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  user: User | null;
}

interface UserFormData {
  name: string;
  email: string;
  phone: string;
  designation: string;
  joining_date: string;
  role: 'user' | 'admin';
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  user,
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    designation: '',
    joining_date: '',
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        designation: user.designation || '',
        joining_date: user.joining_date || '',
        role: user.role === 'super_admin' ? 'admin' : user.role as 'user' | 'admin',
      });
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required';
    }

    if (!formData.joining_date) {
      newErrors.joining_date = 'Joining date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await userService.updateUser(user.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        designation: formData.designation.trim(),
        joining_date: formData.joining_date,
        role: formData.role,
      });
      
      toast.success('Employee updated successfully');
      onUserUpdated();
      handleClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update user';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      designation: '',
      joining_date: '',
      role: 'user',
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Edit Employee</h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter email address"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Phone Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter phone number"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>

          {/* Designation Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Designation
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.designation ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter designation (e.g., Software Developer, Manager)"
              />
            </div>
            {errors.designation && (
              <p className="mt-1 text-sm text-red-600">{errors.designation}</p>
            )}
          </div>

          {/* Joining Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joining Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="date"
                value={formData.joining_date}
                onChange={(e) => handleInputChange('joining_date', e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.joining_date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.joining_date && (
              <p className="mt-1 text-sm text-red-600">{errors.joining_date}</p>
            )}
          </div>

          {/* Role Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value as 'user' | 'admin')}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={user.role === 'super_admin'}
              >
                <option value="user">Regular User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            {user.role === 'super_admin' && (
              <p className="mt-1 text-sm text-gray-500">Super Admin role cannot be changed</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Updating...' : 'Update Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
