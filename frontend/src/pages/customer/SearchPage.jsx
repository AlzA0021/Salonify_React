import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { businessAPI, categoryAPI, locationAPI } from '../../services/api';
import { toast } from 'react-toastify';

const SearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchBusinesses();
  }, [searchParams, sortBy]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, citiesRes] = await Promise.all([
        categoryAPI.getCategories(),
        locationAPI.getCities(),
      ]);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setCities(Array.isArray(citiesRes.data) ? citiesRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
      setCategories([]);
      setCities([]);
    }
  };

  const searchBusinesses = async () => {
    setLoading(true);
    try {
      const params = {
        q: searchParams.get('q'),
        category: searchParams.get('category'),
        city: searchParams.get('city'),
        sort: sortBy,
      };

      const response = await businessAPI.searchBusinesses(params);
      setBusinesses(response.data.results || response.data);
    } catch (error) {
      console.error('Error searching businesses:', error);
      toast.error('خطا در جستجو');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedCity) params.append('city', selectedCity);
    navigate(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedCity('');
    navigate('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="جستجوی سالن، خدمت یا متخصص..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">همه دسته‌بندی‌ها</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="md:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="input-field"
              >
                <option value="">همه شهرها</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>
            <button onClick={handleSearch} className="btn-primary">
              جستجو
            </button>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory || selectedCity) && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-600">فیلترهای فعال:</span>
              {searchQuery && (
                <span className="badge badge-info">
                  جستجو: {searchQuery}
                </span>
              )}
              {selectedCategory && (
                <span className="badge badge-info">
                  {categories.find(c => c.id == selectedCategory)?.name}
                </span>
              )}
              {selectedCity && (
                <span className="badge badge-info">
                  {cities.find(c => c.id == selectedCity)?.name}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700"
              >
                پاک کردن فیلترها
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">فیلترها</h3>
              
              {/* Sort By */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مرتب‌سازی
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field"
                >
                  <option value="popular">محبوب‌ترین</option>
                  <option value="rating">بیشترین امتیاز</option>
                  <option value="reviews">بیشترین نظرات</option>
                  <option value="nearest">نزدیک‌ترین</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  محدوده قیمت
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span className="text-sm">زیر ۱۰۰ هزار تومان</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span className="text-sm">۱۰۰ تا ۲۰۰ هزار تومان</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span className="text-sm">۲۰۰ تا ۵۰۰ هزار تومان</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded text-primary-600" />
                    <span className="text-sm">بالای ۵۰۰ هزار تومان</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  امتیاز
                </label>
                <div className="space-y-2">
                  {[5, 4, 3].map((rating) => (
                    <label key={rating} className="flex items-center gap-2">
                      <input type="checkbox" className="rounded text-primary-600" />
                      <div className="flex items-center gap-1">
                        {[...Array(rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                        <span className="text-sm mr-1">و بالاتر</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {loading ? 'در حال جستجو...' : `${businesses.length} نتیجه یافت شد`}
              </h2>

              {/* Mobile Filter Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden btn-outline"
              >
                فیلترها
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="spinner"></div>
              </div>
            ) : businesses.length === 0 ? (
              /* Empty State */
              <div className="text-center py-20">
                <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="text-xl font-bold text-gray-900 mb-2">نتیجه‌ای یافت نشد</h3>
                <p className="text-gray-600 mb-4">لطفاً فیلترهای دیگری را امتحان کنید</p>
                <button onClick={clearFilters} className="btn-primary">
                  پاک کردن فیلترها
                </button>
              </div>
            ) : (
              /* Business Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {businesses.map((business) => (
                  <div
                    key={business.id}
                    onClick={() => navigate(`/business/${business.id}`)}
                    className="card cursor-pointer hover:shadow-xl transition-all duration-200"
                  >
                    <div className="flex gap-4">
                      <div className="w-32 h-32 flex-shrink-0 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg overflow-hidden">
                        {business.image ? (
                          <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">🏪</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 mb-1 truncate">
                          {business.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">{business.category?.name}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                            </svg>
                            <span className="text-sm font-medium">{business.rating || '4.5'}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{business.reviews_count || 0} نظر</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{business.address}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            از {business.min_price?.toLocaleString('fa-IR') || '۵۰,۰۰۰'} تومان
                          </span>
                          <button className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors">
                            مشاهده
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;