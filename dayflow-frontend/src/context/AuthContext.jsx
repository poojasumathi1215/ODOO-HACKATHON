import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';
import { mockCurrentUserHR, mockCurrentUserEmployee } from '../utils/mockData';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dayflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('dayflow_token');
      const storedUser = localStorage.getItem('dayflow_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          setUser(mockCurrentUserEmployee);
        }
      } else {
        // Default guest user for quick preview (Sarah Jenkins, Employee)
        setUser(mockCurrentUserEmployee);
        setToken('guest_token_sarah');
        localStorage.setItem('dayflow_token', 'guest_token_sarah');
        localStorage.setItem('dayflow_user', JSON.stringify(mockCurrentUserEmployee));
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      const authToken = res.data?.token || 'token_' + Date.now();
      const authUser = res.data?.user || (credentials.email?.includes('hr') ? mockCurrentUserHR : mockCurrentUserEmployee);

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('dayflow_token', authToken);
      localStorage.setItem('dayflow_user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Login failed. Please check your credentials.',
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      const authToken = res.data?.token || 'token_' + Date.now();
      const authUser = res.data?.user;

      setToken(authToken);
      setUser(authUser);
      localStorage.setItem('dayflow_token', authToken);
      localStorage.setItem('dayflow_user', JSON.stringify(authUser));
      return { success: true, user: authUser };
    } catch (err) {
      return {
        success: false,
        message: err.message || 'Registration failed. Please try again.',
      };
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
  }, []);

  const switchRole = (newRole) => {
    const newUser = newRole === 'hr' ? mockCurrentUserHR : mockCurrentUserEmployee;
    setUser(newUser);
    localStorage.setItem('dayflow_user', JSON.stringify(newUser));
  };

  const isHR = user?.role === 'hr';
  const isEmployee = user?.role === 'employee' || !user?.role;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        switchRole,
        isHR,
        isEmployee,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
