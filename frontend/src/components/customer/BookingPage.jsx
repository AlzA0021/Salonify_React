import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { businessAPI, bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const BookingPage = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  
  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [businessId]);

  useEffect(() => {
    if (selectedService && selectedDate) {
      loadAvailableSlots();
    }
  }, [selectedService, selectedStaff, selectedDate]);

  const loadData = async () => {
    try {
      const [businessRes, servicesRes, staffRes] = await Promise.all([
        businessAPI.getBusinessDetail(businessId),
        businessAPI.getBusinessServices(businessId),
        businessAPI.getBusinessStaff(businessId),
      ]);

      setBusiness(businessRes.data);
      setServices(servicesRes.data);
      setStaff(staffRes.data);

      // Pre-select service from URL
      const serviceId = searchParams.get('service');
      if (serviceId) {
        const service = servicesRes.data.find(s => s.id == serviceId);
        if (service) {
          setSelectedService(service);
          setStep(2);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    try {
      const params = {
        service: selectedService.id,
        staff: selectedStaff?.id,
        date: selectedDate,
      };
      const response = await businessAPI.getAvailableSlots(businessId, params);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast.error('خطا در بارگذاری ساعات خالی');
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/booking/${businessId}` } } });
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error('لطفاً تمام فیلدها را پر کنید');
      return;
    }

    setBookingLoading(true);
    try {
      const bookingData = {
        business: businessId,
        service: selectedService.id,
        staff: selectedStaff?.id,
        date: selectedDate,
        time: selectedTime,
        notes: notes,
      };

      await bookingAPI.createBooking(bookingData);
      toast.success('رزرو شما با موفقیت ثبت شد');
      navigate('/my-bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'خطا در ثبت رزرو');
    } finally {
      setBookingLoading(false);
    }
  };

  // Generate next 14 days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('fa-IR');
  };

  const getDayName = (date) => {
    const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{business?.name}</h1>
              <p className="text-gray-600">{business?.address}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {[
              { num: 1, title: 'انتخاب خدمت' },
              { num: 2, title: 'انتخاب زمان' },
              { num: 3, title: 'تایید نهایی' },
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {s.num}
                  </div>
                  <span className={`mr-2 ${step >= s.num ? 'text-primary-600 font-medium' : 'text-gray-600'}`}>
                    {s.title}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-1 ${step > s.num ? 'bg-primary-600' : 'bg-gray-200'}`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">انتخاب خدمت</h2>
                <div className="space-y-3">
                  {services.map((service) => (
                    <div
                      key={service.id}
                      onClick={() => {
                        setSelectedService(service);
                        setStep(2);
                      }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedService?.id === service.id
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {service.duration} دقیقه
                            </span>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-lg text-primary-600">
                            {service.price.toLocaleString('fa-IR')} تومان
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <>
                {/* Staff Selection (Optional) */}
                {staff.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">انتخاب متخصص (اختیاری)</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div
                        onClick={() => setSelectedStaff(null)}
                        className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${
                          !selectedStaff
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                        <p className="font-medium text-sm">مهم نیست</p>
                      </div>
                      {staff.map((member) => (
                        <div
                          key={member.id}
                          onClick={() => setSelectedStaff(member)}
                          className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${
                            selectedStaff?.id === member.id
                              ? 'border-primary-600 bg-primary-50'
                              : 'border-gray-200 hover:border-primary-300'
                          }`}
                        >
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mx-auto mb-2 overflow-hidden">
                            {member.avatar ? (
                              <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">👤</div>
                            )}
                          </div>
                          <p className="font-medium text-sm">{member.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Date Selection */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold mb-4">انتخاب تاریخ</h2>
                  <div className="grid grid-cols-7 gap-2">
                    {getNextDays().map((date) => {
                      const dateStr = date.toISOString().split('T')[0];
                      return (
                        <button
                          key={dateStr}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedTime('');
                          }}
                          className={`p-3 rounded-lg text-center transition-all ${
                            selectedDate === dateStr
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <div className="text-xs mb-1">{getDayName(date)}</div>
                          <div className="text-sm font-bold">{date.getDate()}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                {selectedDate && (
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">انتخاب ساعت</h2>
                    {availableSlots.length === 0 ? (
                      <p className="text-center text-gray-600 py-8">ساعت خالی موجود نیست</p>
                    ) : (
                      <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot.time}
                            onClick={() => {
                              setSelectedTime(slot.time);
                              setStep(3);
                            }}
                            disabled={!slot.available}
                            className={`p-3 rounded-lg font-medium transition-all ${
                              selectedTime === slot.time
                                ? 'bg-primary-600 text-white'
                                : slot.available
                                ? 'bg-gray-50 hover:bg-primary-50 text-gray-900'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="btn-outline flex-1"
                  >
                    بازگشت
                  </button>
                  {selectedDate && selectedTime && (
                    <button
                      onClick={() => setStep(3)}
                      className="btn-primary flex-1"
                    >
                      ادامه
                    </button>
                  )}
                </div>
              </>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">تایید نهایی</h2>
                
                {/* Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    یادداشت (اختیاری)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="3"
                    className="input-field resize-none"
                    placeholder="توضیحات اضافی خود را بنویسید..."
                  ></textarea>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="btn-outline flex-1"
                  >
                    بازگشت
                  </button>
                  <button
                    onClick={handleBooking}
                    disabled={bookingLoading}
                    className="btn-primary flex-1"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="spinner ml-2"></div>
                        در حال ثبت...
                      </>
                    ) : (
                      'تایید و رزرو'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="font-bold text-lg mb-4">خلاصه رزرو</h3>
              
              <div className="space-y-4">
                {/* Business */}
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-1">سالن</p>
                  <p className="font-medium">{business?.name}</p>
                </div>

                {/* Service */}
                {selectedService && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-600 mb-1">خدمت</p>
                    <p className="font-medium">{selectedService.name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedService.duration} دقیقه
                    </p>
                  </div>
                )}

                {/* Staff */}
                {selectedStaff && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-600 mb-1">متخصص</p>
                    <p className="font-medium">{selectedStaff.name}</p>
                  </div>
                )}

                {/* Date & Time */}
                {selectedDate && selectedTime && (
                  <div className="pb-4 border-b">
                    <p className="text-sm text-gray-600 mb-1">تاریخ و ساعت</p>
                    <p className="font-medium">
                      {new Date(selectedDate).toLocaleDateString('fa-IR')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{selectedTime}</p>
                  </div>
                )}

                {/* Price */}
                {selectedService && (
                  <div className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">قیمت خدمت</span>
                      <span className="font-medium">
                        {selectedService.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>مجموع</span>
                      <span className="text-primary-600">
                        {selectedService.price.toLocaleString('fa-IR')} تومان
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {step < 3 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 لطفاً مراحل رزرو را تکمیل کنید
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;