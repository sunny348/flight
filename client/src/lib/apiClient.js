import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api", // Use Vite env variable or fallback
  withCredentials: true,
});

// You can add interceptors here for request/response handling globally
// For example, to handle token refresh automatically or global error logging

// Example: Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    // e.g., if (error.response.status === 401) { /* redirect to login */ }
    console.error("API Error:", error.response || error.message || error);
    return Promise.reject(error);
  }
);

export default apiClient;
