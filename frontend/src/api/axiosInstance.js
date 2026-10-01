import axios from "axios";
import API_BASE_URL from "../config";

// Create a single Axios instance shared across the whole app.
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 second network timeout
  headers: { "Content-Type": "application/json" },
});

// Interceptor to normalize network error messages
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        error.message = "Request timed out. Please check your network connection.";
      } else {
        error.message = "Unable to connect to the server. Please check your internet connection.";
      }
    }
    return Promise.reject(error);
  }
);

// Call this from AuthContext whenever the token changes.
// Setting it here keeps the Authorization header in sync without
// needing to pass the token into every API call manually.
export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

export default axiosInstance;
