// Utility functions for API operations
export const getBaseURL = () => {
  // Extract baseURL from the API client configuration
  // This matches the baseURL in src/api/client.ts
  return 'http://localhost:8000';
};

export const getFileUrl = (filePath?: string | null) => {
  if (!filePath) return null;
  return filePath.startsWith('http') ? filePath : `${getBaseURL()}/${filePath}`;
};
