import React, {createContext, useState, useEffect, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import axios from "axios";
import jwt from "jsonwebtoken";


// Authentication
import setAuthToken from "./AuthToken";


export const AuthContext = createContext();


export const AuthProvider = ({children}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const navigate = useNavigate();


  // Set Session Data
  const setSessionData = async (token) => {
    const decodedToken = jwt.decode(token);
    try {
      const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/set-session` : `${ process.env.REACT_APP_BACKEND_DEV }/set-session`;
      await axios.post(API_URL, {
        userId: decodedToken.userId,
        userRole: decodedToken.role,
      });
      console.log("Session data set successfully.");
    } catch (error) {
      console.error("Error setting session data:", error);
    }
  };


  // Remove Session Data
  const removeSessionData = async () => {
    try {
      const API_URL = process.env.NODE_ENV === "production" ? `${ process.env.REACT_APP_BACKEND_PROD }/remove-session` : `${ process.env.REACT_APP_BACKEND_DEV }/remove-session`;
      await axios.delete(API_URL);
      console.log("Session data removed successfully.");
    } catch (error) {
      console.error("Error removing session data:", error);
    }
  };


  // Log In
  const login = (token) => {
    setIsLoggedIn(true);
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("isLoggedIn", true);

    // Calculate the expiration time for one week (7 Days)
    const expirationTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("tokenExpirationTime", expirationTime);

    // Set the JWT token in axios headers
    setAuthToken(token);

    // Set the user's ID and role from the decoded JWT token
    const decodedToken = jwt.decode(token);
    setUserId(decodedToken.userId);
    setUsername(decodedToken.firstName + decodedToken.lastName);
    setUserRole(decodedToken.role);
    setAdminToken(decodedToken.iat + decodedToken.userId + decodedToken.exp);

    // To save user-related data to session collection
    setSessionData(token, decodedToken.userId, decodedToken.role);
  };


  // Log Out
  const logout = useCallback(() => {
    setIsLoggedIn(false);
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("isLoggedIn");
    setAuthToken(null);
    setUserId(null);
    setUsername(null);
    setUserRole(null);
    setAdminToken(null);
    navigate("/");

    // To remove user-related data from session collection
    removeSessionData();
  }, [navigate]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const tokenExpirationTime = localStorage.getItem("tokenExpirationTime");

    if (token && isLoggedIn) {
      if (Date.now() >= parseInt(tokenExpirationTime)) {
        // Token has expired, log the user out
        logout();
      } else {
        // Token is still valid, set isLoggedIn to true
        setIsLoggedIn(true);
        setAuthToken(token);

        // Set the user's ID and role from the decoded JWT token
        const decodedToken = jwt.decode(token);
        setUserId(decodedToken.userId);
        setUsername(decodedToken.firstName + decodedToken.lastName);
        setUserRole(decodedToken.role);
        setAdminToken(decodedToken.iat + decodedToken.userId + decodedToken.exp);
      }
    }
  }, [logout]);


  // Check if the User is an Admin
  const isAdmin = () => {
    return userRole === "Admin";
  };

  return (
    <>
      <AuthContext.Provider value={{isLoggedIn, login, logout, isAdmin, userId, username, adminToken}}>
        {children}
      </AuthContext.Provider>
    </>
  );
};
