import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {
        status: activeTab === 'upcoming' ? 'confirmed,pending' : 'completed,cancelled',
      };
      const response = await bookingAPI.getMyBookings(params);
      setBookings(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('خطا در بارگذاری رزروها');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('رزرو با موفقیت لغو شد');
      loadBookings();
      setCancelModal(null);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('خطا در لغو رزرو');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'badge-warning', text: 'در انتظار تایید' },
      confirmed: { class: 'badge-success', text: 'تایید شده' },
      completed: { class: 'badge-info', text: 'انجام شده' },
      cancelled: { class: 'badge-error', text: 'لغو شده' },
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">رزروهای من</h1>
          <p className="text-gray-600">مدیریت نوبت‌های خود</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                نوبت‌های آینده
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`flex-1 py-4 px-6 font-medium border-b-2 transition-colors ${
                  activeTab === 'past'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                تاریخچه
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : bookings.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {activeTab === 'upcoming' ? 'رزوی وجود ندارد' : 'تاریخچه‌ای وجود ندارد'}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'upcoming' 
                ? 'هنوز رزروی ثبت نکرده‌اید'
                : 'رزرو گذشته‌ای ندارید'
              }
            </p>
            {activeTab === 'upcoming' && (
              <button
                onClick={() => navigate('/search')}
                className="btn-primary"
              >
                جستجوی سالن
              </button>
            )}
          </div>
        ) : (
          /* Bookings List */
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Business Image */}
                  <div className="w-full md:w-32 h-32 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-lg overflow-hidden flex-shrink-0">
                    {booking.business?.logo ? (
                      <img 
                        src={booking.business.logo} 
                        alt={booking.business.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        🏪
                      </div>
                    )}
                  </div>

                  {/* Booking Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {booking.business?.name}
                        </h3>
                        <p className="text-gray-600">{booking.service?.name}</p>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{new Date(booking.date).toLocaleDateString('fa-IR')}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{booking.time}</span>
                      </div>

                      {/* Duration */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{booking.service?.duration} دقیقه</span>
                      </div>
                    </div>

                    {/* Staff */}
                    {booking.staff && (
                      <div className="flex items-center gap-2 text-gray-600 mb-4">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>متخصص: {booking.staff.name}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <span className="text-lg font-bold text-primary-600">
                        {booking.service?.price?.toLocaleString('fa-IR')} تومان
                      </span>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => navigate(`/business/${booking.business.id}`)}
                              className="btn-outline text-sm"
                            >
                              مشاهده سالن
                            </button>
                            <button
                              onClick={() => setCancelModal(booking)}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              لغو رزرو
                            </button>
                          </>
                        )}
                        {booking.status === 'completed' && !booking.has_review && (
                          <button
                            onClick={() => navigate(`/booking/${booking.id}/review`)}
                            className="btn-primary text-sm"
                          >
                            ثبت نظر
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            onClick={() => navigate(`/business/${booking.business.id}`)}
                            className="btn-outline text-sm"
                          >
                            رزرو مجدد
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {booking.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">یادداشت:</span> {booking.notes}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {cancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
              <h3 className="text-xl font-bold mb-4">لغو رزرو</h3>
              <p className="text-gray-600 mb-6">
                آیا از لغو این رزرو اطمینان دارید؟ این عملیات قابل بازگشت نیست.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCancelModal(null)}
                  className="btn-outline flex-1"
                >
                  انصراف
                </button>
                <button
                  onClick={() => handleCancelBooking(cancelModal.id)}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  لغو رزرو
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;