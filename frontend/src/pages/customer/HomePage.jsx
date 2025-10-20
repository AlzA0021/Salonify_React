import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { businessAPI, categoryAPI, locationAPI } from '../../services/api';
import { toast } from 'react-toastify';

const HomePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [categories, setCategories] = useState([]);
  const [popularBusinesses, setPopularBusinesses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesRes, businessesRes, citiesRes] = await Promise.all([
        categoryAPI.getCategories(),
        businessAPI.searchBusinesses({ featured: true, limit: 8 }),
        locationAPI.getCities(),
      ]);

      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setPopularBusinesses(Array.isArray(businessesRes.data?.results) ? businessesRes.data.results : (Array.isArray(businessesRes.data) ? businessesRes.data : []));
      setCities(Array.isArray(citiesRes.data) ? citiesRes.data : []);
      
      if (citiesRes.data && Array.isArray(citiesRes.data) && citiesRes.data.length > 0) {
        setSelectedCity(citiesRes.data[0].id);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
      // Set default empty arrays to prevent errors
      setCategories([]);
      setPopularBusinesses([]);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/search?category=${categoryId}`);
  };

  const handleBusinessClick = (businessId) => {
    navigate(`/business/${businessId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              رزرو آنلاین نوبت زیبایی و سلامت
            </h1>
            <p className="text-xl mb-8 text-primary-100">
              با فرشا، به راحتی نوبت خود را در بهترین سالن‌های زیبایی رزرو کنید
            </p>

            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="جستجوی سالن، خدمت یا متخصص..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="input-field text-gray-900"
                  />
                </div>
                <div className="md:w-48">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="input-field text-gray-900"
                  >
                    <option value="">انتخاب شهر</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={handleSearch}
                  className="btn-primary bg-gradient-to-r from-primary-600 to-secondary-600 hover:opacity-90"
                >
                  جستجو
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">دسته‌بندی خدمات</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="bg-gray-50 hover:bg-primary-50 p-6 rounded-2xl transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon || '📌'}
                </div>
                <div className="font-medium text-gray-900">{category.name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {category.business_count} کسب‌وکار
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Businesses */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">محبوب‌ترین سالن‌ها</h2>
            <button 
              onClick={() => navigate('/search')}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              مشاهده همه
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularBusinesses.map((business) => (
              <div
                key={business.id}
                onClick={() => handleBusinessClick(business.id)}
                className="card cursor-pointer transform hover:-translate-y-2 transition-all duration-200"
              >
                <div className="h-48 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg mb-4 overflow-hidden">
                  {business.image ? (
                    <img 
                      src={business.image} 
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🏪
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-lg text-gray-900 mb-2">{business.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{business.category?.name}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                    <span className="font-medium text-gray-900">{business.rating || '4.5'}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-600">{business.reviews_count || 0} نظر</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-1">{business.address}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    از {business.min_price?.toLocaleString('fa-IR') || '۵۰,۰۰۰'} تومان
                  </span>
                  <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                    رزرو نوبت
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">چرا فرشا؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">رزرو آسان و سریع</h3>
              <p className="text-gray-600">در چند ثانیه نوبت خود را رزرو کنید</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">بهترین کیفیت</h3>
              <p className="text-gray-600">دسترسی به بهترین سالن‌های زیبایی</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">قیمت مناسب</h3>
              <p className="text-gray-600">بهترین قیمت‌ها و تخفیف‌های ویژه</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">صاحب کسب‌وکار هستید؟</h2>
          <p className="text-xl mb-8 text-primary-100">
            کسب‌وکار خود را در فرشا ثبت کنید و مشتریان بیشتری جذب کنید
          </p>
          <button 
            onClick={() => navigate('/partner/register')}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
          >
            ثبت کسب‌وکار
          </button>
        </div>
      </section>
    </div>
  );
};

export default HomePage;