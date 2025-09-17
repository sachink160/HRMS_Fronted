import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService, userService } from '../api/services';
import { User, Phone, Mail, Save, Camera, FileText, Eye } from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import toast from 'react-hot-toast';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState({
    profile: false,
    aadhaarFront: false,
    aadhaarBack: false,
    pan: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Ensure latest profile (including document statuses) is loaded when page opens or regains focus
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await userService.getProfile();
        updateUser(res.data);
      } catch {}
    };
    fetchLatest();
    const onFocus = () => fetchLatest();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file: File, type: 'profile' | 'aadhaarFront' | 'aadhaarBack' | 'pan') => {
    setUploading(prev => ({ ...prev, [type]: true }));
    
    try {
      let response;
      switch (type) {
        case 'profile':
          response = await userService.uploadProfileImage(file);
          break;
        case 'aadhaarFront':
          response = await userService.uploadAadhaarFront(file);
          break;
        case 'aadhaarBack':
          response = await userService.uploadAadhaarBack(file);
          break;
        case 'pan':
          response = await userService.uploadPan(file);
          break;
      }
      
      // Refresh user data
      const profileResponse = await userService.getProfile();
      updateUser(profileResponse.data);
      toast.success(`${type === 'profile' ? 'Profile image' : type === 'aadhaarFront' ? 'Aadhaar front' : type === 'aadhaarBack' ? 'Aadhaar back' : 'PAN'} uploaded successfully!`);
    } catch (error) {
      toast.error(`Failed to upload ${type === 'profile' ? 'profile image' : type === 'aadhaarFront' ? 'Aadhaar front' : type === 'aadhaarBack' ? 'Aadhaar back' : 'PAN'}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getFileUrl = (filePath: string | null | undefined) => {
    if (!filePath) return null;
    return filePath.startsWith('http') ? filePath : `http://localhost:8000/${filePath}`;
  };

  const renderStatus = (status?: 'pending'|'approved'|'rejected'|null) => {
    if (!status) return null;
    const color = status === 'approved' ? 'bg-green-100 text-green-800' : status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
    const label = status.charAt(0).toUpperCase() + status.slice(1);
    return <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Basic Profile Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update your personal information and account settings
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              {user?.profile_image ? (
                <img
                  src={getFileUrl(user.profile_image) || ''}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              {/* Hidden input to upload avatar when clicking the camera button */}
              <input
                id="profile-upload"
                type="file"
                accept=".jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFileUpload(f, 'profile');
                }}
              />
              <button
                type="button"
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700"
                onClick={() => document.getElementById('profile-upload')?.click()}
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{user?.name}</h3>
              <p className="text-sm text-gray-600">{user?.role === 'admin' ? 'Administrator' : 'Employee'}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Read-only fields */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Designation</label>
              <input
                type="text"
                value={(user as any)?.designation || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 sm:text-sm"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Joining Date</label>
              <input
                type="text"
                value={(user as any)?.joining_date ? new Date((user as any).joining_date).toLocaleDateString() : ''}
                disabled
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700 sm:text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Identity Documents Section */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Identity Documents</h2>
          <p className="text-sm text-gray-600 mt-1">
            Upload your identity documents for verification. Accepted types: JPG, PNG, PDF. Max size: 10MB.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Aadhaar Front Upload */}
          <div>
            <FileUpload
              label="Aadhaar Card (Front)"
              description="Upload the front side of your Aadhaar card (JPG, PNG, PDF - Max 10MB)"
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={10}
              currentFile={user?.aadhaar_front ? user.aadhaar_front.split('/').pop() : null}
              currentUrl={getFileUrl(user?.aadhaar_front) || null}
              onFileSelect={(file) => handleFileUpload(file, 'aadhaarFront')}
              isLoading={uploading.aadhaarFront}
              className="max-w-md"
            />
            <div className="mt-1">
              <span className="text-xs text-gray-500">Status:</span>
              {renderStatus((user as any)?.aadhaar_front_status)}
            </div>
            {user?.aadhaar_front && (
              <div className="mt-2">
                <a
                  href={getFileUrl(user.aadhaar_front) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View current document
                </a>
              </div>
            )}
          </div>

          {/* Aadhaar Back Upload */}
          <div>
            <FileUpload
              label="Aadhaar Card (Back)"
              description="Upload the back side of your Aadhaar card (JPG, PNG, PDF - Max 10MB)"
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={10}
              currentFile={user?.aadhaar_back ? user.aadhaar_back.split('/').pop() : null}
              currentUrl={getFileUrl(user?.aadhaar_back) || null}
              onFileSelect={(file) => handleFileUpload(file, 'aadhaarBack')}
              isLoading={uploading.aadhaarBack}
              className="max-w-md"
            />
            <div className="mt-1">
              <span className="text-xs text-gray-500">Status:</span>
              {renderStatus((user as any)?.aadhaar_back_status)}
            </div>
            {user?.aadhaar_back && (
              <div className="mt-2">
                <a
                  href={getFileUrl(user.aadhaar_back) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View current document
                </a>
              </div>
            )}
          </div>

          {/* PAN Upload */}
          <div>
            <FileUpload
              label="PAN Card"
              description="Upload your PAN card (JPG, PNG, PDF - Max 10MB)"
              accept=".jpg,.jpeg,.png,.pdf"
              maxSize={10}
              currentFile={user?.pan_image ? user.pan_image.split('/').pop() : null}
              currentUrl={getFileUrl(user?.pan_image) || null}
              onFileSelect={(file) => handleFileUpload(file, 'pan')}
              isLoading={uploading.pan}
              className="max-w-md"
            />
            <div className="mt-1">
              <span className="text-xs text-gray-500">Status:</span>
              {renderStatus((user as any)?.pan_image_status)}
            </div>
            {user?.pan_image && (
              <div className="mt-2">
                <a
                  href={getFileUrl(user.pan_image) || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View current document
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};