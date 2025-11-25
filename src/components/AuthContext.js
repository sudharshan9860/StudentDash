import React, { createContext, useState, useEffect, useRef } from "react";
import axiosInstance from "../api/axiosInstance";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return !!token;
  });

  const [username, setUsername] = useState(() => localStorage.getItem("username") || "");
  const [role, setRole] = useState(() => localStorage.getItem("userRole") || "");
  const [className, setClassName] = useState(() => localStorage.getItem("className") || "");
  const [fullName, setFullName] = useState(() => localStorage.getItem("fullName") || "");
  
  // WebSocket reference
  const wsRef = useRef(null);

  // Keep state in sync with localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "accessToken") setIsAuthenticated(!!e.newValue);
      if (e.key === "username") setUsername(e.newValue || "");
      if (e.key === "role") setRole(e.newValue || "");
      if (e.key === "className") setClassName(e.newValue || "");
      if (e.key === "fullName") setFullName(e.newValue || "");
     
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const login = async (user, token, userRole, className, fullName) => {
    try {

      // console.log("fullName :   ", fullName);
      // Store in localStorage
      localStorage.setItem("accessToken", token);
      localStorage.setItem("username", user);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("className", className || "");
      if(fullName!=null) await localStorage.setItem("fullName", fullName || "");

      // Update state
      setIsAuthenticated(true);
      setUsername(user);
      setRole(userRole);
      setClassName(className || "");
      setFullName(fullName || "");

      // Connect to WebSocket after login
      if (wsRef.current && wsRef.current.readyState !== WebSocket.OPEN) {
        // Your WebSocket connection logic here
      }

    } catch (error) {
      console.error("Error during login:", error);
      throw new Error("Failed to store authentication data");
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("username");
      localStorage.removeItem("userRole");
      localStorage.removeItem("className");
      localStorage.removeItem("streakData");
      localStorage.removeItem("rewardData");
      localStorage.removeItem("completedChapters");
      localStorage.removeItem("lastRoute");
      localStorage.removeItem("fullName");
      localStorage.removeItem("include_question_context")

      // Reset state
      setIsAuthenticated(false);
      setUsername("");
      setRole("");
      setClassName("");
      setFullName("");

      // Close the WebSocket connection during logout
      if (wsRef.current) {
        console.log("⚠ WebSocket closed on logout");
        wsRef.current.close();
        wsRef.current = null;
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        username,
        role,
        className,
        login,
        logout,
        fullName,
        token: localStorage.getItem("accessToken"),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
