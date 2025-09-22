import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Shield, Briefcase, Calendar } from 'lucide-react';
import { userService, adminService } from '../api/services';
import { FileUpload } from './FileUpload';
import { useAuth } from '../context/AuthContext';
import { getFileUrl } from '../utils/apiUtils';
import toast from 'react-hot-toast';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  designation?: string;
  joining_date?: string;
  wifi_user_id?: string;
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
  wifi_user_id?: string;
  role: 'user' | 'admin';
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  onUserUpdated,
  user,
}) => {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    phone: '',
    designation: '',
    joining_date: '',
    wifi_user_id: '',
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [uploading, setUploading] = useState({ profile:false, aadhaarFront:false, aadhaarBack:false, pan:false });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        designation: user.designation || '',
        joining_date: user.joining_date || '',
        wifi_user_id: user.wifi_user_id || '',
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
        wifi_user_id: formData.wifi_user_id?.trim() || undefined,
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
      wifi_user_id: '',
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

  const canUploadDocs = currentUser?.role === 'super_admin';
  const canModerateDocs = currentUser && currentUser.role !== 'user';
  const handleUpload = async (type: 'profile'|'aadhaarFront'|'aadhaarBack'|'pan', file: File) => {
    if (!user) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      if (type === 'profile') await adminService.uploadUserProfileImage(user.id, file);
      if (type === 'aadhaarFront') await adminService.uploadUserAadhaarFront(user.id, file);
      if (type === 'aadhaarBack') await adminService.uploadUserAadhaarBack(user.id, file);
      if (type === 'pan') await adminService.uploadUserPan(user.id, file);
      toast.success('Document uploaded (status set to Pending)');
      onUserUpdated();
    } catch (e:any) {
      toast.error(e?.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">Please correct the highlighted fields.</div>
          )}

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                onBlur={(e) => handleInputChange('phone', e.target.value.replace(/[^0-9]/g, ''))}
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
          </div>

          {/* WiFi User ID (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WiFi User ID (optional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.wifi_user_id}
                onChange={(e) => handleInputChange('wifi_user_id', e.target.value)}
                className={`w-full pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  ''
                }`}
                placeholder="Enter WiFi portal user id"
              />
            </div>
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

          {/* Documents (Super Admin) */}
          {(canUploadDocs || canModerateDocs) && (
            <div className="pt-2 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Identity Documents</h4>
                  <p className="text-xs text-gray-500">Upload your identity documents for verification</p>
                </div>
                {canModerateDocs && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const tasks: Promise<any>[] = [];
                        const u: any = user;
                        if (u?.aadhaar_front && u?.aadhaar_front_status === 'pending') tasks.push(adminService.approveDocument(user.id, 'aadhaar_front'));
                        if (u?.aadhaar_back && u?.aadhaar_back_status === 'pending') tasks.push(adminService.approveDocument(user.id, 'aadhaar_back'));
                        if (u?.pan_image && u?.pan_image_status === 'pending') tasks.push(adminService.approveDocument(user.id, 'pan'));
                        if (tasks.length === 0) {
                          toast('No pending documents', { icon: 'ℹ️' });
                          return;
                        }
                        await Promise.all(tasks);
                        toast.success('All pending documents approved');
                        onUserUpdated();
                      } catch (e) {
                        toast.error('Approve all failed');
                      }
                    }}
                    className="text-xs px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Approve All Pending
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Profile Image */}
                
                {/* Aadhaar Front */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">Aadhaar Card (Front)</h5>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${((user as any)?.aadhaar_front_status==='approved')?'bg-green-100 text-green-800':((user as any)?.aadhaar_front_status==='rejected')?'bg-red-100 text-red-800':((user as any)?.aadhaar_front_status==='pending')?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700'}`}>{(user as any)?.aadhaar_front_status || '—'}</span>
                  </div>
                  <FileUpload
                    label="Upload file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onFileSelect={(f) => handleUpload('aadhaarFront', f)}
                    isLoading={uploading.aadhaarFront}
                    currentFile={(user as any)?.aadhaar_front ? (user as any).aadhaar_front.split('/').pop() : null}
                    currentUrl={getFileUrl((user as any)?.aadhaar_front)}
                    className=""
                    variant="compact"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {(user as any)?.aadhaar_front && (
                      <a className="text-xs text-blue-600" href={getFileUrl((user as any).aadhaar_front) || '#'} target="_blank" rel="noreferrer">View current document</a>
                    )}
                    {canModerateDocs && (user as any)?.aadhaar_front && (
                      <div className="space-x-3">
                        <button type="button" onClick={async()=>{await adminService.approveDocument(user.id,'aadhaar_front'); toast.success('Approved'); onUserUpdated();}} className="text-xs text-green-700 hover:underline">Approve</button>
                        <button type="button" onClick={async()=>{const reason=window.prompt('Reason (optional)')||undefined; await adminService.rejectDocument(user.id,'aadhaar_front',reason); toast.success('Rejected'); onUserUpdated();}} className="text-xs text-red-700 hover:underline">Reject</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">Aadhaar Card (Back)</h5>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${((user as any)?.aadhaar_back_status==='approved')?'bg-green-100 text-green-800':((user as any)?.aadhaar_back_status==='rejected')?'bg-red-100 text-red-800':((user as any)?.aadhaar_back_status==='pending')?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700'}`}>{(user as any)?.aadhaar_back_status || '—'}</span>
                  </div>
                  <FileUpload
                    label="Upload file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onFileSelect={(f) => handleUpload('aadhaarBack', f)}
                    isLoading={uploading.aadhaarBack}
                    currentFile={(user as any)?.aadhaar_back ? (user as any).aadhaar_back.split('/').pop() : null}
                    currentUrl={getFileUrl((user as any)?.aadhaar_back)}
                    className=""
                    variant="compact"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {(user as any)?.aadhaar_back && (
                      <a className="text-xs text-blue-600" href={getFileUrl((user as any).aadhaar_back) || '#'} target="_blank" rel="noreferrer">View current document</a>
                    )}
                    {canModerateDocs && (user as any)?.aadhaar_back && (
                      <div className="space-x-3">
                        <button type="button" onClick={async()=>{await adminService.approveDocument(user.id,'aadhaar_back'); toast.success('Approved'); onUserUpdated();}} className="text-xs text-green-700 hover:underline">Approve</button>
                        <button type="button" onClick={async()=>{const reason=window.prompt('Reason (optional)')||undefined; await adminService.rejectDocument(user.id,'aadhaar_back',reason); toast.success('Rejected'); onUserUpdated();}} className="text-xs text-red-700 hover:underline">Reject</button>
                      </div>
                    )}
                  </div>
                </div>

                {/* PAN */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-900">PAN</h5>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${((user as any)?.pan_image_status==='approved')?'bg-green-100 text-green-800':((user as any)?.pan_image_status==='rejected')?'bg-red-100 text-red-800':((user as any)?.pan_image_status==='pending')?'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-700'}`}>{(user as any)?.pan_image_status || '—'}</span>
                  </div>
                  <FileUpload
                    label="Upload file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onFileSelect={(f) => handleUpload('pan', f)}
                    isLoading={uploading.pan}
                    currentFile={(user as any)?.pan_image ? (user as any).pan_image.split('/').pop() : null}
                    currentUrl={getFileUrl((user as any)?.pan_image)}
                    className=""
                    variant="compact"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {(user as any)?.pan_image && (
                      <a className="text-xs text-blue-600" href={getFileUrl((user as any).pan_image) || '#'} target="_blank" rel="noreferrer">View current document</a>
                    )}
                    {canModerateDocs && (user as any)?.pan_image && (
                      <div className="space-x-3">
                        <button type="button" onClick={async()=>{await adminService.approveDocument(user.id,'pan'); toast.success('Approved'); onUserUpdated();}} className="text-xs text-green-700 hover:underline">Approve</button>
                        <button type="button" onClick={async()=>{const reason=window.prompt('Reason (optional)')||undefined; await adminService.rejectDocument(user.id,'pan',reason); toast.success('Rejected'); onUserUpdated();}} className="text-xs text-red-700 hover:underline">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              {isLoading ? 'Updating…' : 'Update Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
