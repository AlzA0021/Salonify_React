import React, { useState, useEffect } from 'react';
import { partnerCustomerAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PartnerCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await partnerCustomerAPI.getCustomers();
      setCustomers(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('خطا در بارگذاری مشتریان');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerHistory = async (customerId) => {
    try {
      const response = await partnerCustomerAPI.getCustomerHistory(customerId);
      setCustomerHistory(response.data);
    } catch (error) {
      console.error('Error loading customer history:', error);
      toast.error('خطا در بارگذاری تاریخچه');
    }
  };

  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    await loadCustomerHistory(customer.id);
  };

  const filteredCustomers = customers.filter(customer => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.phone?.includes(query) ||
      customer.email?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مشتریان</h1>
        <p className="text-gray-600">مشاهده و مدیریت اطلاعات مشتریان</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <input
          type="search"
          placeholder="جستجو بر اساس نام، شماره تماس یا ایمیل..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">کل مشتریان</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold">{customers.length}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">این ماه</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold">
            {customers.filter(c => {
              const date = new Date(c.created_at);
              const now = new Date();
              return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">مشتریان VIP</span>
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold">
            {customers.filter(c => c.total_bookings >= 10).length}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-600">میانگین رزرو</span>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold">
            {customers.length > 0 
              ? (customers.reduce((sum, c) => sum + (c.total_bookings || 0), 0) / customers.length).toFixed(1)
              : 0
            }
          </p>
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">مشتری یافت نشد</h3>
              <p className="text-gray-600">
                {searchQuery ? 'نتیجه‌ای برای جستجوی شما یافت نشد' : 'هنوز مشتری ثبت نشده است'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-medium text-gray-600">مشتری</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">تماس</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">تعداد رزرو</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">آخرین رزرو</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">مجموع خرید</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-600">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-600 font-medium">
                              {customer.name?.charAt(0) || 'C'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">{customer.phone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {customer.total_bookings || 0} رزرو
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-gray-900">
                          {customer.last_booking_date 
                            ? new Date(customer.last_booking_date).toLocaleDateString('fa-IR')
                            : '-'
                          }
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900">
                          {(customer.total_spent || 0).toLocaleString('fa-IR')} تومان
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleCustomerClick(customer)}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          مشاهده جزئیات
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-3xl w-full animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">جزئیات مشتری</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl text-primary-600 font-bold">
                    {selectedCustomer.name?.charAt(0) || 'C'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCustomer.name}</h3>
                  <p className="text-gray-600">{selectedCustomer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">شماره تماس</p>
                  <p className="font-medium">{selectedCustomer.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">تعداد رزرو</p>
                  <p className="font-bold text-primary-600">{selectedCustomer.total_bookings || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">مجموع خرید</p>
                  <p className="font-bold text-green-600">
                    {(selectedCustomer.total_spent || 0).toLocaleString('fa-IR')} تومان
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">عضویت از</p>
                  <p className="font-medium">
                    {new Date(selectedCustomer.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Booking History */}
            <div>
              <h3 className="text-lg font-bold mb-4">تاریخچه رزروها</h3>
              {customerHistory.length === 0 ? (
                <p className="text-center text-gray-600 py-8">تاریخچه‌ای وجود ندارد</p>
              ) : (
                <div className="space-y-3">
                  {customerHistory.map((booking) => (
                    <div key={booking.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold">{booking.service?.name}</h4>
                        <span className={`badge ${
                          booking.status === 'completed' ? 'badge-success' :
                          booking.status === 'confirmed' ? 'badge-info' :
                          booking.status === 'cancelled' ? 'badge-error' :
                          'badge-warning'
                        }`}>
                          {booking.status === 'completed' ? 'انجام شده' :
                           booking.status === 'confirmed' ? 'تایید شده' :
                           booking.status === 'cancelled' ? 'لغو شده' :
                           'در انتظار'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{new Date(booking.date).toLocaleDateString('fa-IR')}</span>
                        <span>•</span>
                        <span>{booking.time}</span>
                        <span>•</span>
                        <span className="font-medium text-primary-600">
                          {booking.service?.price?.toLocaleString('fa-IR')} تومان
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerCustomers;