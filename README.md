# HRMS Frontend Integration Guide

This document provides a comprehensive guide for the HRMS (Human Resource Management System) frontend integration with the backend API.

## Overview

The frontend is built with React, TypeScript, and Vite, providing a modern, responsive interface for the HRMS system. It integrates seamlessly with the FastAPI backend to provide comprehensive HR management functionality.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Date-fns** - Date utilities

## Project Structure

```
Frontend/
├── src/
│   ├── api/                 # API integration layer
│   │   ├── client.ts        # Axios configuration
│   │   └── services.ts      # API service functions
│   ├── components/          # Reusable UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── Layout.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleBasedDashboard.tsx
│   │   ├── UserCreationModal.tsx
│   │   └── UserEditModal.tsx
│   ├── context/             # React context providers
│   │   └── AuthContext.tsx  # Authentication context
│   ├── pages/               # Page components
│   │   ├── admin/           # Admin-specific pages
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Login.tsx        # Login page
│   │   ├── MyLeaves.tsx     # Leave management
│   │   ├── TimeTracker.tsx  # Time tracking
│   │   └── ...
│   ├── router/              # Routing configuration
│   │   └── AppRouter.tsx
│   ├── utils/               # Utility functions
│   │   ├── dateUtils.ts     # Date formatting utilities
│   │   └── errorHandler.ts  # Error handling utilities
│   └── main.tsx            # Application entry point
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## API Integration

### Configuration

The API client is configured in `src/api/client.ts`:

```typescript
export const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

### Authentication

The frontend uses JWT tokens for authentication:

- **Token Storage**: Stored in localStorage
- **Auto-injection**: Automatically added to request headers
- **Token Refresh**: Handled by the AuthContext
- **Logout on Expiry**: Automatic logout when token expires

### Service Layer

All API calls are organized in `src/api/services.ts` with the following service modules:

#### Auth Service
- `login(email, password)` - User authentication
- `register(userData)` - User registration
- `registerAdmin(userData)` - Admin registration (super admin only)
- `getMe()` - Get current user profile
- `updateProfile(data)` - Update user profile

#### User Service
- `getUsers(offset, limit)` - List all users (admin)
- `getUserById(userId)` - Get user by ID (admin)
- `createUser(userData, role)` - Create new user (admin)
- `updateUser(userId, userData)` - Update user (admin)
- `toggleUserStatus(userId)` - Toggle user active status (admin)

#### Leave Service
- `getMyLeaves(offset, limit)` - Get user's leave applications
- `applyLeave(data)` - Submit leave application
- `getAllLeaves(offset, limit, statusFilter)` - Get all leaves (admin)
- `approveLeave(leaveId)` - Approve leave (admin)
- `rejectLeave(leaveId)` - Reject leave (admin)

#### Tracking Service
- `checkIn()` - Record check-in time
- `checkOut()` - Record check-out time
- `getTodayStatus()` - Get today's tracking status
- `getMyAttendance(offset, limit)` - Get attendance history
- `getAllTracking(offset, limit)` - Get all tracking records (admin)

#### Holiday Service
- `getHolidays(offset, limit)` - Get all holidays
- `getUpcomingHolidays()` - Get upcoming holidays
- `addHoliday(data)` - Create holiday (admin)
- `updateHoliday(holidayId, data)` - Update holiday (admin)
- `deleteHoliday(holidayId)` - Delete holiday (admin)

#### Admin Service
- `getDashboard()` - Get admin dashboard statistics
- `getUsers(offset, limit)` - Get all users
- `getAllLeaves(offset, limit, statusFilter)` - Get all leaves
- `getAllTracking(offset, limit, dateFilter)` - Get all tracking records
- `getAttendanceReport(startDate, endDate)` - Generate attendance report

## Key Features

### 1. Authentication & Authorization

- **Role-based Access Control**: Different interfaces for users, admins, and super admins
- **Protected Routes**: Automatic redirection based on authentication status
- **Token Management**: Automatic token refresh and logout on expiry

### 2. Dashboard

- **User Dashboard**: Personal statistics, recent leaves, upcoming holidays
- **Admin Dashboard**: System-wide statistics, pending approvals, user management
- **Real-time Updates**: Automatic data refresh and live status updates

### 3. Time Tracking

- **Check-in/Check-out**: Simple one-click time tracking
- **Daily Status**: Real-time display of today's work status
- **Attendance History**: Complete attendance records with calculated hours
- **Admin Monitoring**: View all employee attendance (admin only)

### 4. Leave Management

- **Leave Applications**: Submit and track leave requests
- **Admin Approval**: Approve/reject leave applications
- **Status Tracking**: Real-time status updates
- **Leave History**: Complete leave application history

### 5. User Management (Admin)

- **User Creation**: Create new users with specific roles
- **User Editing**: Update user information and roles
- **Status Management**: Activate/deactivate user accounts
- **Role Management**: Promote users to admin roles

### 6. Holiday Management (Admin)

- **Holiday Creation**: Add new holidays
- **Bulk Upload**: Create multiple holidays at once
- **Holiday Editing**: Update holiday information
- **Holiday Deletion**: Remove holidays

## Error Handling

### Global Error Handling

The application implements comprehensive error handling:

- **API Interceptors**: Automatic error handling for all API calls
- **Toast Notifications**: User-friendly error messages
- **Error Boundaries**: Graceful error recovery
- **Network Error Handling**: Proper handling of network issues

### Error Types

- **Authentication Errors**: Automatic logout on token expiry
- **Validation Errors**: Field-specific error messages
- **Network Errors**: Connection issue notifications
- **Server Errors**: Generic error messages with fallbacks

## State Management

### Context API

The application uses React Context for state management:

- **AuthContext**: User authentication state
- **Global State**: User information, token management
- **Local State**: Component-specific state using useState

### Data Flow

1. **API Calls**: Made through service functions
2. **State Updates**: Components update local state
3. **UI Updates**: React re-renders based on state changes
4. **Error Handling**: Errors are caught and displayed to users

## Styling

### Tailwind CSS

The application uses Tailwind CSS for styling:

- **Utility-first**: Rapid UI development
- **Responsive Design**: Mobile-first approach
- **Component Library**: Consistent design system
- **Dark Mode Ready**: Prepared for theme switching

### Design System

- **Color Palette**: Blue primary, semantic colors
- **Typography**: Inter font family
- **Spacing**: Consistent spacing scale
- **Components**: Reusable UI components

## Development

### Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

### Environment Configuration

The frontend connects to the backend at `http://localhost:8000` by default. To change this:

1. Update `baseURL` in `src/api/client.ts`
2. Or set environment variables for different environments

### Code Quality

- **ESLint**: Code linting and formatting
- **TypeScript**: Type safety and IntelliSense
- **Prettier**: Code formatting (if configured)
- **Husky**: Git hooks for quality checks (if configured)

## API Integration Best Practices

### 1. Error Handling

Always handle API errors gracefully:

```typescript
try {
  const response = await userService.getUsers();
  setUsers(response.data);
} catch (error) {
  toast.error('Failed to fetch users');
  console.error(error);
}
```

### 2. Loading States

Show loading indicators during API calls:

```typescript
const [isLoading, setIsLoading] = useState(false);

const fetchData = async () => {
  setIsLoading(true);
  try {
    const response = await api.getData();
    setData(response.data);
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Data Validation

Validate data before making API calls:

```typescript
const handleSubmit = async (data) => {
  if (!data.email || !data.password) {
    toast.error('Please fill in all required fields');
    return;
  }
  
  try {
    await authService.login(data);
  } catch (error) {
    // Error handled by interceptor
  }
};
```

### 4. Optimistic Updates

Update UI immediately for better UX:

```typescript
const handleToggleStatus = async (userId) => {
  // Optimistic update
  setUsers(users.map(user => 
    user.id === userId 
      ? { ...user, is_active: !user.is_active }
      : user
  ));
  
  try {
    await userService.toggleUserStatus(userId);
  } catch (error) {
    // Revert on error
    setUsers(originalUsers);
    toast.error('Failed to update user status');
  }
};
```

## Testing

### Manual Testing

1. **Authentication Flow**:
   - Login with valid credentials
   - Logout functionality
   - Token expiry handling

2. **User Features**:
   - Time tracking (check-in/check-out)
   - Leave applications
   - Profile management

3. **Admin Features**:
   - User management
   - Leave approvals
   - Holiday management
   - Dashboard statistics

### API Testing

Test all API endpoints using the backend documentation or tools like Postman.

## Deployment

### Production Build

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Serve static files**:
   - Use a web server like Nginx
   - Or deploy to platforms like Vercel, Netlify

### Environment Variables

Set appropriate environment variables for production:

- `VITE_API_BASE_URL`: Backend API URL
- `VITE_APP_TITLE`: Application title
- `VITE_APP_VERSION`: Application version

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend domain
2. **Authentication Issues**: Check token storage and API headers
3. **API Errors**: Verify backend is running and endpoints are correct
4. **Build Errors**: Check TypeScript errors and dependencies

### Debug Mode

Enable debug logging by setting `localStorage.setItem('debug', 'true')` in browser console.

## Contributing

### Code Style

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write clean, readable code

### Pull Request Process

1. Create feature branch
2. Implement changes
3. Test thoroughly
4. Submit pull request
5. Code review
6. Merge to main

## Support

For issues and questions:

1. Check this documentation
2. Review the backend API documentation
3. Check browser console for errors
4. Verify network requests in DevTools

## License

This project is part of the HRMS system. Please refer to the main project license.
