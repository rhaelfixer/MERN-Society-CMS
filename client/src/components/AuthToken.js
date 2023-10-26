import axios from "axios";
import jwt from "jsonwebtoken";


// Set interceptor for successful responses
axios.interceptors.response.use(
  (response) => {
    // Return a successful response back to the calling service
    return response;
  },
  // Set interceptor for error responses
  (error) => {
    console.log("Error message:", error.message);
    console.log("Error response data:", error.response.data);
    console.log("Error response status:", error.response.status);
    // Return an error back to the calling service
    return Promise.reject(error);
  }
);


// Set interceptor for outgoing requests
axios.interceptors.request.use((config) => {
  // Get JWT token from localStorage
  const token = localStorage.getItem("jwtToken");
  // If token exists, add it to Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Return updated request configuration
  return config;
});


// Set the Authorization header to include the JWT token
const setAuthToken = (token) => {
  if (token) {
    try {
      const decodedToken = jwt.decode(token);
      const currentTime = Date.now() / 1000; // get current time in seconds
      if (decodedToken.exp < currentTime) {
        // Token has expired, delete it from localStorage
        delete axios.defaults.headers.common["Authorization"];
      } else {
        // Token is still valid, set it as default Authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
    } catch (error) {
      // JWT token is malformed, delete it from localStorage and log out
      delete axios.defaults.headers.common["Authorization"];
    }
  } else {
    // No token provided, delete default Authorization header
    delete axios.defaults.headers.common["Authorization"];
  }
};

export default setAuthToken;
