// src/context/AuthContext.js
import React, { useState, useEffect } from 'react';

const AuthContext = React.createContext({
  isLoggedIn: false,
  updateLoginStatus: () => {},
});

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Initialize from session token presence
    return Boolean(sessionStorage.getItem('token'));
  });

  const updateLoginStatus = (status) => {
    setIsLoggedIn(status);
  };

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token && !isLoggedIn) updateLoginStatus(true);
    if (!token && isLoggedIn) updateLoginStatus(false);
  }, [isLoggedIn]);

  return React.createElement(
    AuthContext.Provider,
    { value: { isLoggedIn, updateLoginStatus } },
    children
  );
};

export default AuthContext;