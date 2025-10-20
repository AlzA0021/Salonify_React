import React, { useState, useEffect } from 'react';
import { partnerBookingAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PartnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const response = await partnerBookingAPI.getBookings(params);
      setBookings(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('خطا در بارگذاری رزروها');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await partnerBookingAPI.updateBookingStatus(bookingId, newStatus);
      toast.success('وضعیت رزرو تغییر کرد');
      loadBookings();
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('خطا در تغییر وضعیت');
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

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      booking.customer_name?.toLowerCase().includes(query) ||
      booking.service?.name?.toLowerCase().includes(query) ||
      booking.customer_phone?.includes(query)
    );
  });

  const tabs = [
    { id: 'all', label: 'همه', count: bookings.length },
    { id: 'pending', label: 'در انتظار', count: bookings.filter(b => b.status === 'pending').length },
    { id: 'confirmed', label: 'تایید شده', count: bookings.filter(b => b.status === 'confirmed').length },
    { id: 'completed', label: 'انجام شده', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'لغو شده', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مدیریت رزروها</h1>
        <p className="text-gray-600">مشاهده و مدیریت تمام رزروها</p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="search"
              placeholder="جستجو بر اساس نام مشتری، خدمت یا شماره تماس..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
            />
          </div>
          <button className="btn-primary flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            خروجی Excel
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="border-b overflow-x-auto">
          <div className="flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-6 py-4 font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-primary-100' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">رزروی یافت نشد</h3>
              <p className="text-gray-600">
                {searchQuery ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'هنوز رزروی ثبت نشده است'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{booking.customer_name}</h3>
                          <p className="text-sm text-gray-600">{booking.customer_phone}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 mb-1">خدمت</p>
                          <p className="font-medium">{booking.service?.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">تاریخ</p>
                          <p className="font-medium">{new Date(booking.date).toLocaleDateString('fa-IR')}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">ساعت</p>
                          <p className="font-medium">{booking.time}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 mb-1">قیمت</p>
                          <p className="font-medium text-primary-600">
                            {booking.service?.price?.toLocaleString('fa-IR')} تومان
                          </p>
                        </div>
                      </div>

                      {booking.staff && (
                        <p className="text-sm text-gray-600 mt-2">
                          متخصص: {booking.staff.name}
                        </p>
                      )}

                      {booking.notes && (
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                          یادداشت: {booking.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {booking.status === 'pending' && (
                      <div className="flex md:flex-col gap-2 md:w-32">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(booking.id, 'confirmed');
                          }}
                          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          تایید
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(booking.id, 'cancelled');
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                        >
                          رد
                        </button>
                      </div>
                    )}
                    {booking.status === 'confirmed' && (
                      <div className="flex md:flex-col gap-2 md:w-32">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(booking.id, 'completed');
                          }}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          انجام شد
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">جزئیات رزرو</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">مشتری</p>
                  <p className="font-bold">{selectedBooking.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">وضعیت</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">شماره تماس</p>
                  <p className="font-medium">{selectedBooking.customer_phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">خدمت</p>
                  <p className="font-medium">{selectedBooking.service?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاریخ</p>
                  <p className="font-medium">
                    {new Date(selectedBooking.date).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">ساعت</p>
                  <p className="font-medium">{selectedBooking.time}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">مدت زمان</p>
                  <p className="font-medium">{selectedBooking.service?.duration} دقیقه</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">قیمت</p>
                  <p className="font-bold text-primary-600">
                    {selectedBooking.service?.price?.toLocaleString('fa-IR')} تومان
                  </p>
                </div>
              </div>

              {selectedBooking.staff && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">متخصص</p>
                  <p className="font-medium">{selectedBooking.staff.name}</p>
                </div>
              )}

              {selectedBooking.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">یادداشت مشتری</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Actions */}
              {selectedBooking.status === 'pending' && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, 'confirmed')}
                    className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
                  >
                    تایید رزرو
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedBooking.id, 'cancelled')}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    رد رزرو
                  </button>
                </div>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button
                  onClick={() => handleStatusChange(selectedBooking.id, 'completed')}
                  className="w-full btn-primary bg-blue-600 hover:bg-blue-700"
                >
                  علامت‌گذاری به عنوان انجام شده
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerBookings;