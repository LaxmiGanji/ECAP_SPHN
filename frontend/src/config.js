// Configuration file for API endpoints
export const baseApiURL = () => {
  // Check if we're in production (Render deployment)
  if (process.env.NODE_ENV === 'production') {
    // Return your Render backend URL
    return 'https://ecap-sphn-backend.onrender.com';
  }
  
  // For local development
  return 'http://localhost:10000';
};

// Alternative: You can also set this directly if you prefer
export const API_BASE_URL = 'https://ecap-sphn-backend.onrender.com';
