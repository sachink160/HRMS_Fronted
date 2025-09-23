import React from 'react';
import { X, Mail, Phone, Shield, Briefcase, Calendar, FileText, Image } from 'lucide-react';
import { format } from 'date-fns';
import { getFileUrl } from '../utils/apiUtils';

interface UserView {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  is_active: boolean;
  created_at: string;
  phone?: string;
  designation?: string;
  joining_date?: string;
  wifi_user_id?: string;
  profile_image?: string;
  aadhaar_front?: string;
  aadhaar_back?: string;
  pan_image?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: UserView | null;
}

const getRoleLabel = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    default:
      return 'User';
  }
};


export const UserViewModal: React.FC<Props> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Details</h3>
          <button onClick={onClose} className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Top summary */}
          <div className="flex items-center">
            <div className="h-16 w-16 flex-shrink-0">
              {user.profile_image ? (
                <img src={getFileUrl(user.profile_image) || ''} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                  <span className="text-lg font-medium text-gray-700 dark:text-gray-300">{user.name.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </div>
            <div className="ml-4">
              <div className="text-xl font-semibold text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{getRoleLabel(user.role)}</div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Mail className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
              <a href={`mailto:${user.email}`} className="text-primary-600 dark:text-primary-400 hover:underline">{user.email}</a>
            </div>
            {user.wifi_user_id && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <FileText className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span>WiFi ID: {user.wifi_user_id}</span>
              </div>
            )}
            {user.phone && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <Phone className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span>{user.phone}</span>
              </div>
            )}
            {user.designation && (
              <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <Briefcase className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                <span>{user.designation}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Shield className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span>{user.is_active ? 'Active' : 'Inactive'}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
              <span>
                {user.joining_date
                  ? `Joined ${format(new Date(user.joining_date), 'MMM dd, yyyy')}`
                  : `Created ${format(new Date(user.created_at), 'MMM dd, yyyy')}`}
              </span>
            </div>
          </div>

          {/* Documents */}
          <div className="pt-2">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">Aadhaar Front</span>
                </div>
                {user.aadhaar_front ? (
                  <a href={getFileUrl(user.aadhaar_front) || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary-600 dark:text-primary-400 text-sm hover:underline">
                    {user.aadhaar_front.match(/\.(jpg|jpeg|png|gif)$/i) ? <Image className="h-4 w-4 mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
                    View file
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Not uploaded</span>
                )}
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">Aadhaar Back</span>
                </div>
                {user.aadhaar_back ? (
                  <a href={getFileUrl(user.aadhaar_back) || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary-600 dark:text-primary-400 text-sm hover:underline">
                    {user.aadhaar_back.match(/\.(jpg|jpeg|png|gif)$/i) ? <Image className="h-4 w-4 mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
                    View file
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Not uploaded</span>
                )}
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-800 dark:text-gray-200">PAN</span>
                </div>
                {user.pan_image ? (
                  <a href={getFileUrl(user.pan_image) || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary-600 dark:text-primary-400 text-sm hover:underline">
                    {user.pan_image.match(/\.(jpg|jpeg|png|gif)$/i) ? <Image className="h-4 w-4 mr-1" /> : <FileText className="h-4 w-4 mr-1" />}
                    View file
                  </a>
                ) : (
                  <span className="text-sm text-gray-400 dark:text-gray-500">Not uploaded</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-800 transition-colors">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserViewModal;


