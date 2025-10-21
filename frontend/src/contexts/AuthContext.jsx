import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await authAPI.getCurrentUser();
        setUser(response.data);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { access, user } = response.data;  // ✅ FIXED: access به جای token
      
      localStorage.setItem('token', access);  // ✅ FIXED
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setIsAuthenticated(true);
      
      toast.success('خوش آمدید!');
      return { success: true };
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.detail || 
                      errorData?.phone_number?.[0] ||
                      errorData?.password?.[0] ||
                      'خطا در ورود';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { message, phone_number } = response.data;  // ✅ FIXED: API فقط message برمی‌گرداند
      
      toast.success(message || 'ثبت‌نام موفق! لطفاً شماره خود را تایید کنید');
      return { success: true, phone_number };
    } catch (error) {
      const errorData = error.response?.data;
      let message = 'خطا در ثبت‌نام';
      
      if (errorData) {
        message = errorData.phone_number?.[0] || 
                  errorData.email?.[0] ||
                  errorData.password?.[0] ||
                  errorData.detail ||
                  message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {  // ✅ FIXED: تابع اضافه شد
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
      toast.info('با موفقیت خارج شدید');
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await authAPI.updateProfile(data);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      toast.success('پروفایل با موفقیت بروزرسانی شد');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در بروزرسانی پروفایل';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};