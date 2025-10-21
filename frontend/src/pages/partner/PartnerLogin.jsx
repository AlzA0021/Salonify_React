import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

const PartnerLogin = () => {
  const navigate = useNavigate();
  const { login } = usePartnerAuth();
  
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.phone_number) {
      newErrors.phone_number = 'شماره تلفن الزامی است';
    } else if (!/^09\d{9}$/.test(formData.phone_number)) {
      newErrors.phone_number = 'شماره تلفن باید با فرمت 09xxxxxxxxx باشد';
    }
    
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      navigate('/partner/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl font-bold">F</span>
              </div>
            </Link>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              ورود پارتنرها
            </h2>
            <p className="text-gray-600">
              مدیریت کسب‌وکار خود را شروع کنید
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* phone_number */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                شماره هراه 
              </label>
              <input
                id="phone_number"
                name="phone_number"
                type="tel"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="09123456789"
                dir="ltr"
              />
              {errors.phone_number && (
                <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                رمز عبور
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                placeholder="رمز عبور خود را وارد کنید"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <span className="mr-2 text-sm text-gray-600">مرا به خاطر بسپار</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                فراموشی رمز عبور
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <div className="spinner ml-2"></div>
                  در حال ورود...
                </>
              ) : (
                'ورود به پنل'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600">
              کسب‌وکار خود را ثبت نکرده‌اید؟{' '}
              <Link to="/partner/register" className="text-primary-600 hover:text-primary-700 font-medium">
                ثبت کسب‌وکار
              </Link>
            </p>
          </div>

          {/* Customer Link */}
          <div className="text-center pt-6 border-t">
            <p className="text-gray-600">
              مشتری هستید؟{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                ورود مشتری
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 relative">
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-white text-center">
            <h2 className="text-4xl font-bold mb-6">به فرشا پارتنر خوش آمدید</h2>
            <p className="text-xl mb-8 text-primary-100">
              با فرشا، مدیریت کسب‌وکار خود را ساده‌تر کنید
            </p>
            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="font-bold text-lg mb-2">مدیریت نوبت‌ها</h3>
                <p className="text-sm text-primary-100">تقویم هوشمند و مدیریت آسان رزروها</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">👥</div>
                <h3 className="font-bold text-lg mb-2">مشتریان بیشتر</h3>
                <p className="text-sm text-primary-100">دسترسی به هزاران مشتری بالقوه</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="font-bold text-lg mb-2">گزارش‌گیری</h3>
                <p className="text-sm text-primary-100">آمار و تحلیل کامل کسب‌وکار</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-lg mb-2">افزایش درآمد</h3>
                <p className="text-sm text-primary-100">بهبود فروش و مدیریت مالی</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerLogin;