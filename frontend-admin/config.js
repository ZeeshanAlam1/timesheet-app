// Configuration for API connection
// Update this file with your backend URL after deployment

const CONFIG = {
  // Local development
  API_BASE_URL: 'http://localhost:5000/api',
  
  // Production - Update this after deploying to Vercel
  // API_BASE_URL: 'https://your-backend-url.vercel.app/api'
};

// Auto-detect environment (optional)
// Uncomment this to automatically use production URL when deployed
/*
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  CONFIG.API_BASE_URL = 'https://your-backend-url.vercel.app/api';
}
*/
