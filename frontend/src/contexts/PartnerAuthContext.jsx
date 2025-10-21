import React, { createContext, useContext, useState, useEffect } from 'react';
import { partnerAuthAPI } from '../services/api';
import { toast } from 'react-toastify';

const PartnerAuthContext = createContext(null);

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error('usePartnerAuth must be used within PartnerAuthProvider');
  }
  return context;
};

export const PartnerAuthProvider = ({ children }) => {
  const [partner, setPartner] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('partnerToken');
      if (token) {
        const response = await partnerAuthAPI.getCurrentPartner();
        setPartner(response.data.partner);
        setBusiness(response.data.business);
        setIsAuthenticated(true);
      }
    } catch (error) {
      localStorage.removeItem('partnerToken');
      localStorage.removeItem('partner');
      localStorage.removeItem('business');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await partnerAuthAPI.login(credentials);
      const { access, partner, business } = response.data;  // ✅ FIXED: access به جای token
      
      localStorage.setItem('partnerToken', access);  // ✅ FIXED
      localStorage.setItem('partner', JSON.stringify(partner));
      localStorage.setItem('business', JSON.stringify(business));
      
      setPartner(partner);
      setBusiness(business);
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

  const register = async (businessData) => {
    try {
      const response = await partnerAuthAPI.register(businessData);
      const { message, phone_number } = response.data;  // ✅ FIXED
      
      toast.success(message || 'ثبت‌نام موفق! لطفاً شماره خود را تایید کنید');
      return { success: true, phone_number };
    } catch (error) {
      const errorData = error.response?.data;
      let message = 'خطا در ثبت‌نام';
      
      if (errorData) {
        message = errorData.phone_number?.[0] || 
                  errorData.email?.[0] ||
                  errorData.password?.[0] ||
                  errorData.business_name?.[0] ||
                  errorData.detail ||
                  message;
      }
      
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {  // ✅ FIXED: تابع اضافه شد
    try {
      await partnerAuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('partnerToken');
      localStorage.removeItem('partner');
      localStorage.removeItem('business');
      setPartner(null);
      setBusiness(null);
      setIsAuthenticated(false);
      toast.info('با موفقیت خارج شدید');
    }
  };

  const updateBusiness = async (data) => {
    try {
      const response = await partnerAuthAPI.updateBusiness(data);
      setBusiness(response.data);
      localStorage.setItem('business', JSON.stringify(response.data));
      toast.success('اطلاعات کسب‌وکار با موفقیت بروزرسانی شد');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در بروزرسانی';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    partner,
    business,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateBusiness,
    checkAuth,
  };

  return (
    <PartnerAuthContext.Provider value={value}>
      {children}
    </PartnerAuthContext.Provider>
  );
};