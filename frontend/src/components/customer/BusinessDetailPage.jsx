import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { businessAPI } from '../../services/api';
import { toast } from 'react-toastify';

const BusinessDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    loadBusinessData();
  }, [id]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const [businessRes, servicesRes, staffRes, reviewsRes] = await Promise.all([
        businessAPI.getBusinessDetail(id),
        businessAPI.getBusinessServices(id),
        businessAPI.getBusinessStaff(id),
        businessAPI.getBusinessReviews(id),
      ]);

      setBusiness(businessRes.data);
      setServices(servicesRes.data);
      setStaff(staffRes.data);
      setReviews(reviewsRes.data.results || reviewsRes.data);
    } catch (error) {
      console.error('Error loading business:', error);
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleBookService = (serviceId) => {
    navigate(`/booking/${id}?service=${serviceId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">کسب‌وکار یافت نشد</h2>
          <button onClick={() => navigate('/search')} className="btn-primary">
            بازگشت به جستجو
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="h-80 bg-gradient-to-br from-primary-600 to-secondary-600 relative">
        {business.cover_image ? (
          <img 
            src={business.cover_image} 
            alt={business.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-8xl">
            🏪
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-10">
        {/* Business Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Logo */}
            <div className="w-32 h-32 bg-white rounded-xl shadow-lg flex-shrink-0 overflow-hidden border-4 border-white">
              {business.logo ? (
                <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-secondary-100 text-5xl">
                  🏪
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{business.name}</h1>
                  <p className="text-lg text-gray-600">{business.category?.name}</p>
                </div>
                <button className="btn-outline">
                  <svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  ذخیره
                </button>
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(business.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                      </svg>
                    ))}
                  </div>
                  <span className="font-bold text-lg">{business.rating || '4.5'}</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{business.reviews_count || 0} نظر</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2 text-gray-600 mb-4">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{business.address}</span>
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-4">
                {business.phone && (
                  <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {business.phone}
                  </a>
                )}
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary-600 hover:text-primary-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    وب‌سایت
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-md mb-6">
          <div className="border-b">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab('services')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'services'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                خدمات ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('staff')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'staff'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                تیم ({staff.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                نظرات ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 font-medium border-b-2 transition-colors ${
                  activeTab === 'about'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                درباره
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Services Tab */}
            {activeTab === 'services' && (
              <div className="space-y-4">
                {services.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">خدمتی ثبت نشده است</p>
                ) : (
                  services.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 mb-2">{service.name}</h3>
                          {service.description && (
                            <p className="text-gray-600 text-sm mb-3">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{service.duration} دقیقه</span>
                            </div>
                            <span className="font-bold text-lg text-primary-600">
                              {service.price.toLocaleString('fa-IR')} تومان
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleBookService(service.id)}
                          className="btn-primary mr-4"
                        >
                          رزرو نوبت
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Staff Tab */}
            {activeTab === 'staff' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.length === 0 ? (
                  <p className="col-span-full text-center text-gray-600 py-8">اعضای تیم ثبت نشده است</p>
                ) : (
                  staff.map((member) => (
                    <div key={member.id} className="text-center">
                      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-100 to-secondary-100 mx-auto mb-4 overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
                        )}
                      </div>
                      <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{member.title || 'متخصص'}</p>
                      {member.rating && (
                        <div className="flex items-center justify-center gap-1">
                          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                          <span className="text-sm font-medium">{member.rating}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">نظری ثبت نشده است</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {review.user_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold">{review.user_name || 'کاربر'}</h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.created_at).toLocaleDateString('fa-IR')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'} fill-current`}
                                viewBox="0 0 20 20"
                              >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                              </svg>
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div className="prose max-w-none">
                {business.description ? (
                  <p className="text-gray-700 leading-relaxed">{business.description}</p>
                ) : (
                  <p className="text-center text-gray-600 py-8">توضیحاتی ثبت نشده است</p>
                )}

                {/* Working Hours */}
                {business.working_hours && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">ساعات کاری</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-2">
                        {Object.entries(business.working_hours).map(([day, hours]) => (
                          <div key={day} className="flex justify-between">
                            <span className="font-medium">{day}</span>
                            <span className="text-gray-600">{hours}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDetailPage;