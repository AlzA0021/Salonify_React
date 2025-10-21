import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    phone_number: '',
    code: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    
    if (!formData.phone_number) {
      setErrors({ phone_number: 'شماره تلفن الزامی است' });
      return;
    }
    
    if (!/^09\d{9}$/.test(formData.phone_number)) {
      setErrors({ phone_number: 'شماره تلفن نامعتبر است' });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password/`, {
        phone_number: formData.phone_number
      });
      toast.success('کد بازیابی ارسال شد');
      setStep(2);
    } catch (error) {
      const message = error.response?.data?.phone_number?.[0] || 
                      error.response?.data?.detail ||
                      'خطا در ارسال کد';
      toast.error(message);
      setErrors({ phone_number: message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.code) newErrors.code = 'کد الزامی است';
    if (!formData.new_password) newErrors.new_password = 'رمز عبور الزامی است';
    if (formData.new_password.length < 8) newErrors.new_password = 'رمز عبور باید حداقل 8 کاراکتر باشد';
    if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'رمز عبور یکسان نیست';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/reset-password/`, {
        phone_number: formData.phone_number,
        code: formData.code,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password
      });
      toast.success('رمز عبور با موفقیت تغییر کرد');
      setStep(3);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      const errorData = error.response?.data;
      const message = errorData?.code?.[0] || 
                      errorData?.new_password?.[0] ||
                      errorData?.detail ||
                      'خطا در تغییر رمز عبور';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            بازیابی رمز عبور
          </h2>
          <p className="text-gray-600">
            {step === 1 && 'شماره تلفن خود را وارد کنید'}
            {step === 2 && 'کد ارسال شده و رمز عبور جدید را وارد کنید'}
            {step === 3 && 'رمز عبور با موفقیت تغییر کرد'}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تلفن
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.phone_number ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="09123456789"
                  dir="ltr"
                />
                {errors.phone_number && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'در حال ارسال...' : 'ارسال کد'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  کد تایید (6 رقم)
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.code ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123456"
                  maxLength="6"
                  dir="ltr"
                />
                {errors.code && (
                  <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور جدید
                </label>
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.new_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="حداقل 8 کاراکتر"
                />
                {errors.new_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.new_password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تکرار رمز عبور
                </label>
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
                    errors.confirm_password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="تکرار رمز عبور"
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirm_password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                ارسال مجدد کد
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">رمز عبور شما با موفقیت تغییر کرد</p>
              <Link to="/login" className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
                ورود به حساب
              </Link>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-primary-600 hover:text-primary-700">
              بازگشت به ورود
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;