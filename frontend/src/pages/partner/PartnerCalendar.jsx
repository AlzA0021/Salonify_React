import React, { useState, useEffect } from 'react';
import { partnerBookingAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PartnerCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, [selectedDate]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await partnerBookingAPI.getBookings({ date: dateStr });
      setBookings(response.data.results || response.data);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('خطا در بارگذاری رزروها');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + increment);
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    if (!date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getBookingsForDate = (date) => {
    if (!date) return 0;
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(b => b.date === dateStr).length;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 21; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const getBookingForSlot = (time) => {
    return bookings.find(b => b.time === time);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      confirmed: 'bg-green-100 border-green-300 text-green-800',
      completed: 'bg-blue-100 border-blue-300 text-blue-800',
      cancelled: 'bg-red-100 border-red-300 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  const dayNames = ['ی', 'د', 'س', 'چ', 'پ', 'ج', 'ش'];
  const monthNames = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تقویم رزروها</h1>
        <p className="text-gray-600">مشاهده و مدیریت برنامه روزانه</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h3 className="font-bold text-lg">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day, idx) => (
                <div key={idx} className="text-center text-sm font-medium text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {getDaysInMonth(currentDate).map((date, idx) => {
                const bookingCount = date ? getBookingsForDate(date) : 0;
                return (
                  <button
                    key={idx}
                    onClick={() => date && setSelectedDate(date)}
                    disabled={!date}
                    className={`
                      aspect-square p-2 rounded-lg text-sm transition-all
                      ${!date ? 'invisible' : ''}
                      ${isToday(date) ? 'ring-2 ring-primary-600' : ''}
                      ${isSelected(date) 
                        ? 'bg-primary-600 text-white font-bold' 
                        : 'hover:bg-gray-100'
                      }
                      ${date && date < new Date().setHours(0,0,0,0) ? 'text-gray-400' : ''}
                    `}
                  >
                    {date && (
                      <div className="flex flex-col items-center">
                        <span>{date.getDate()}</span>
                        {bookingCount > 0 && !isSelected(date) && (
                          <span className="w-1.5 h-1.5 bg-primary-600 rounded-full mt-1"></span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Today Button */}
            <button
              onClick={() => {
                const today = new Date();
                setCurrentDate(today);
                setSelectedDate(today);
              }}
              className="w-full mt-4 btn-outline"
            >
              امروز
            </button>
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Date Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedDate.toLocaleDateString('fa-IR')}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {bookings.length} رزرو برای این روز
                </p>
              </div>
              <button className="btn-primary">
                + رزرو جدید
              </button>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="spinner"></div>
              </div>
            ) : (
              /* Time Slots */
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {getTimeSlots().map((time) => {
                  const booking = getBookingForSlot(time);
                  return (
                    <div key={time} className="flex items-start gap-4">
                      <div className="w-20 text-sm text-gray-600 font-medium pt-2">
                        {time}
                      </div>
                      <div className="flex-1">
                        {booking ? (
                          <div className={`border-2 rounded-lg p-3 ${getStatusColor(booking.status)}`}>
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold">{booking.customer_name}</h4>
                                <p className="text-sm">{booking.service?.name}</p>
                              </div>
                              <div className="flex gap-2">
                                <button className="p-1.5 hover:bg-white/50 rounded">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                </button>
                                <button className="p-1.5 hover:bg-white/50 rounded">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            {booking.staff && (
                              <p className="text-xs">متخصص: {booking.staff.name}</p>
                            )}
                            <p className="text-xs mt-1">مدت: {booking.service?.duration} دقیقه</p>
                          </div>
                        ) : (
                          <div className="border-2 border-dashed border-gray-200 rounded-lg p-3 text-center text-gray-400 hover:border-primary-300 hover:bg-primary-50 cursor-pointer transition-colors">
                            <span className="text-sm">زمان خالی</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerCalendar;