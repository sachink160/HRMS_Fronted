import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '', 
  size = 'md',
  showLabel = false 
}) => {
  const { theme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative inline-flex items-center justify-center
        rounded-lg border border-gray-200 dark:border-gray-700
        bg-white dark:bg-gray-800
        text-gray-600 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        hover:text-gray-900 dark:hover:text-white
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        transition-all duration-200 ease-in-out
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative">
        <Sun 
          className={`
            ${iconSizes[size]} 
            transition-all duration-300 ease-in-out
            ${theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-0 opacity-0'}
            absolute inset-0
          `}
        />
        <Moon 
          className={`
            ${iconSizes[size]} 
            transition-all duration-300 ease-in-out
            ${theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}
            absolute inset-0
          `}
        />
      </div>
      {showLabel && (
        <span className="ml-2 text-sm font-medium">
          {theme === 'light' ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
};

export default ThemeToggle;
