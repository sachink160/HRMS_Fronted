import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from './ThemeToggle';
import { 
  Home, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Users, 
  Settings,
  LogOut,
  BarChart3
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: Home },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'My Leaves', path: '/leaves', icon: FileText },
    { name: 'Holidays', path: '/holidays', icon: Calendar },
    { name: 'Time Tracker', path: '/tracker', icon: Clock },
  ];

  const adminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Leave Management', path: '/admin/leaves', icon: FileText },
    { name: 'Holiday Management', path: '/admin/holidays', icon: Calendar },
    { name: 'Attendance Reports', path: '/admin/reports', icon: Clock },
  ];

  const superAdminNavItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Leave Management', path: '/admin/leaves', icon: FileText },
    { name: 'Holiday Management', path: '/admin/holidays', icon: Calendar },
    { name: 'Attendance Reports', path: '/admin/reports', icon: Clock },
    { name: 'System Settings', path: '/admin/settings', icon: Settings },
  ];

  const getNavItems = () => {
    if (user?.role === 'super_admin') return superAdminNavItems;
    if (user?.role === 'admin') return adminNavItems;
    return userNavItems;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">HRMS</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
              {user?.role === 'super_admin' ? 'Super Admin' : user?.role === 'admin' ? 'Admin' : 'User'} Panel
            </p>
          </div>
        </div>

        <nav className="mt-6">
          <ul className="space-y-1 px-4">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-r-2 border-primary-700 dark:border-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Welcome back, {user?.name}!
            </h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                {user?.role === 'super_admin' ? 'Super Administrator' : user?.role === 'admin' ? 'Administrator' : 'User'}
              </span>
              <ThemeToggle size="sm" />
            </div>
          </div>
        </header>
        
        <main className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};