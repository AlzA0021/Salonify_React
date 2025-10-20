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
      const { token, partner: partnerData, business: businessData } = response.data;
      
      localStorage.setItem('partnerToken', token);
      localStorage.setItem('partner', JSON.stringify(partnerData));
      localStorage.setItem('business', JSON.stringify(businessData));
      
      setPartner(partnerData);
      setBusiness(businessData);
      setIsAuthenticated(true);
      
      toast.success('خوش آمدید!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در ورود';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (businessData) => {
    try {
      const response = await partnerAuthAPI.register(businessData);
      const { token, partner: partnerData, business: newBusiness } = response.data;
      
      localStorage.setItem('partnerToken', token);
      localStorage.setItem('partner', JSON.stringify(partnerData));
      localStorage.setItem('business', JSON.stringify(newBusiness));
      
      setPartner(partnerData);
      setBusiness(newBusiness);
      setIsAuthenticated(true);
      
      toast.success('کسب‌وکار شما با موفقیت ثبت شد!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'خطا در ثبت‌نام';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
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
      toast.success('اطلاعات کسب‌وکار بروزرسانی شد');
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