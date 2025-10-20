import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import { categoryAPI, locationAPI } from '../../services/api';

const PartnerRegister = () => {
  const navigate = useNavigate();
  const { register } = usePartnerAuth();
  
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    // Owner Info
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    
    // Business Info
    businessName: '',
    categoryId: '',
    cityId: '',
    address: '',
    description: '',
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        categoryAPI.getCategories(),
        locationAPI.getCities(),
      ]);
      setCategories(categoriesRes.data);
      setCities(citiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.ownerName) newErrors.ownerName = 'نام و نام خانوادگی الزامی است';
    if (!formData.email) {
      newErrors.email = 'ایمیل الزامی است';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'ایمیل معتبر نیست';
    }
    if (!formData.phone) {
      newErrors.phone = 'شماره موبایل الزامی است';
    } else if (!/^09\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'شماره موبایل معتبر نیست';
    }
    if (!formData.password) {
      newErrors.password = 'رمز عبور الزامی است';
    } else if (formData.password.length < 6) {
      newErrors.password = 'رمز عبور باید حداقل ۶ کاراکتر باشد';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'رمز عبور و تکرار آن مطابقت ندارند';
    }
    
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.businessName) newErrors.businessName = 'نام کسب‌وکار الزامی است';
    if (!formData.categoryId) newErrors.categoryId = 'انتخاب دسته‌بندی الزامی است';
    if (!formData.cityId) newErrors.cityId = 'انتخاب شهر الزامی است';
    if (!formData.address) newErrors.address = 'آدرس الزامی است';
    
    return newErrors;
  };

  const handleNext = () => {
    const newErrors = step === 1 ? validateStep1() : validateStep2();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (step === 1) {
      setStep(2);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const result = await register(formData);
    setLoading(false);

    if (result.success) {
      navigate('/partner/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-2xl font-bold">F</span>
            </div>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ثبت کسب‌وکار
          </h2>
          <p className="text-gray-600">
            کسب‌وکار خود را در فرشا ثبت کنید و مشتریان بیشتری جذب کنید
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                1
              </div>
              <span className={`mr-2 ${step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-600'}`}>
                اطلاعات شخصی
              </span>
            </div>
            <div className={`w-16 h-1 ${step > 1 ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                2
              </div>
              <span className={`mr-2 ${step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-600'}`}>
                اطلاعات کسب‌وکار
              </span>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Step 1: Owner Information */}
          {step === 1 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold mb-6">اطلاعات مدیر کسب‌وکار</h3>
              
              {/* Owner Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام و نام خانوادگی
                </label>
                <input
                  name="ownerName"
                  type="text"
                  value={formData.ownerName}
                  onChange={handleChange}
                  className={`input-field ${errors.ownerName ? 'border-red-500' : ''}`}
                  placeholder="نام کامل خود را وارد کنید"
                />
                {errors.ownerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.ownerName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره موبایل
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رمز عبور
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="حداقل ۶ کاراکتر"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تکرار رمز عبور
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="رمز عبور را مجدداً وارد کنید"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Business Information */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-xl font-bold mb-6">اطلاعات کسب‌وکار</h3>
              
              {/* Business Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام کسب‌وکار
                </label>
                <input
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  className={`input-field ${errors.businessName ? 'border-red-500' : ''}`}
                  placeholder="مثال: سالن زیبایی آرمیتا"
                />
                {errors.businessName && (
                  <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  دسته‌بندی
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`input-field ${errors.categoryId ? 'border-red-500' : ''}`}
                >
                  <option value="">انتخاب دسته‌بندی</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شهر
                </label>
                <select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleChange}
                  className={`input-field ${errors.cityId ? 'border-red-500' : ''}`}
                >
                  <option value="">انتخاب شهر</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
                {errors.cityId && (
                  <p className="mt-1 text-sm text-red-600">{errors.cityId}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  آدرس کامل
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                  className={`input-field resize-none ${errors.address ? 'border-red-500' : ''}`}
                  placeholder="آدرس دقیق کسب‌وکار خود را وارد کنید"
                ></textarea>
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات (اختیاری)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="input-field resize-none"
                  placeholder="توضیحات مختصری درباره کسب‌وکار خود بنویسید..."
                ></textarea>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn-outline flex-1"
              >
                بازگشت
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? (
                <>
                  <div className="spinner ml-2"></div>
                  در حال ثبت...
                </>
              ) : step === 1 ? (
                'مرحله بعد'
              ) : (
                'ثبت کسب‌وکار'
              )}
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              قبلاً ثبت‌نام کرده‌اید؟{' '}
              <Link to="/partner/login" className="text-primary-600 hover:text-primary-700 font-medium">
                وارد شوید
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegister;