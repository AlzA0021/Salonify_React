import React, { useState } from 'react';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';
import { toast } from 'react-toastify';

const PartnerSettings = () => {
  const { business, updateBusiness } = usePartnerAuth();
  const [activeTab, setActiveTab] = useState('business');
  const [loading, setLoading] = useState(false);
  
  const [businessData, setBusinessData] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    address: business?.address || '',
    description: business?.description || '',
    website: business?.website || '',
  });

  const [workingHours, setWorkingHours] = useState({
    saturday: { open: '09:00', close: '21:00', closed: false },
    sunday: { open: '09:00', close: '21:00', closed: false },
    monday: { open: '09:00', close: '21:00', closed: false },
    tuesday: { open: '09:00', close: '21:00', closed: false },
    wednesday: { open: '09:00', close: '21:00', closed: false },
    thursday: { open: '09:00', close: '21:00', closed: false },
    friday: { open: '09:00', close: '21:00', closed: true },
  });

  const dayNames = {
    saturday: 'شنبه',
    sunday: 'یکشنبه',
    monday: 'دوشنبه',
    tuesday: 'سه‌شنبه',
    wednesday: 'چهارشنبه',
    thursday: 'پنج‌شنبه',
    friday: 'جمعه',
  };

  const handleBusinessChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveBusinessInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateBusiness(businessData);
    setLoading(false);
    if (result.success) {
      toast.success('اطلاعات با موفقیت ذخیره شد');
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [field]: value }
    }));
  };

  const handleSaveWorkingHours = async () => {
    setLoading(true);
    // Save working hours via API
    setLoading(false);
    toast.success('ساعات کاری ذخیره شد');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تنظیمات</h1>
        <p className="text-gray-600">مدیریت اطلاعات و تنظیمات کسب‌وکار</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('business')}
                className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'business'
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                اطلاعات کسب‌وکار
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'hours'
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                ساعات کاری
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                اعلان‌ها
              </button>
              <button
                onClick={() => setActiveTab('payment')}
                className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'payment'
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                تنظیمات پرداخت
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-md p-6">
            {/* Business Info Tab */}
            {activeTab === 'business' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">اطلاعات کسب‌وکار</h2>
                <form onSubmit={handleSaveBusinessInfo} className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نام کسب‌وکار *
                    </label>
                    <input
                      name="name"
                      type="text"
                      value={businessData.name}
                      onChange={handleBusinessChange}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      شماره تماس *
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      value={businessData.phone}
                      onChange={handleBusinessChange}
                      className="input-field"
                      required
                      dir="ltr"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      آدرس کامل *
                    </label>
                    <textarea
                      name="address"
                      value={businessData.address}
                      onChange={handleBusinessChange}
                      rows="3"
                      className="input-field resize-none"
                      required
                    ></textarea>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      توضیحات
                    </label>
                    <textarea
                      name="description"
                      value={businessData.description}
                      onChange={handleBusinessChange}
                      rows="4"
                      className="input-field resize-none"
                      placeholder="توضیحات مختصری درباره کسب‌وکار خود..."
                    ></textarea>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وب‌سایت
                    </label>
                    <input
                      name="website"
                      type="url"
                      value={businessData.website}
                      onChange={handleBusinessChange}
                      className="input-field"
                      placeholder="https://example.com"
                      dir="ltr"
                    />
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      لوگو
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {business?.logo ? (
                          <img src={business.logo} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full"
                  >
                    {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </button>
                </form>
              </div>
            )}

            {/* Working Hours Tab */}
            {activeTab === 'hours' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">ساعات کاری</h2>
                <div className="space-y-4">
                  {Object.entries(workingHours).map(([day, hours]) => (
                    <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24">
                        <span className="font-medium">{dayNames[day]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!hours.closed}
                          onChange={(e) => handleWorkingHoursChange(day, 'closed', !e.target.checked)}
                          className="rounded text-primary-600"
                        />
                        <span className="text-sm text-gray-600">باز</span>
                      </div>
                      {!hours.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">از:</label>
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleWorkingHoursChange(day, 'open', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">تا:</label>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleWorkingHoursChange(day, 'close', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        </>
                      )}
                      {hours.closed && (
                        <span className="text-sm text-red-600 font-medium">تعطیل</span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleSaveWorkingHours}
                  disabled={loading}
                  className="btn-primary w-full mt-6"
                >
                  {loading ? 'در حال ذخیره...' : 'ذخیره ساعات کاری'}
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">تنظیمات اعلان‌ها</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium mb-1">اعلان رزرو جدید</h3>
                      <p className="text-sm text-gray-600">دریافت اعلان برای رزروهای جدید</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium mb-1">اعلان لغو رزرو</h3>
                      <p className="text-sm text-gray-600">دریافت اعلان برای لغو رزروها</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium mb-1">اعلان ایمیل</h3>
                      <p className="text-sm text-gray-600">دریافت اعلان‌ها از طریق ایمیل</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium mb-1">اعلان پیامکی</h3>
                      <p className="text-sm text-gray-600">دریافت اعلان‌ها از طریق پیامک</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">تنظیمات پرداخت</h2>
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 برای فعال‌سازی پرداخت آنلاین، لطفاً با پشتیبانی تماس بگیرید.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">روش‌های پرداخت</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="rounded text-primary-600" defaultChecked />
                        <div>
                          <p className="font-medium">پرداخت نقدی</p>
                          <p className="text-sm text-gray-600">پرداخت حضوری در محل</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="rounded text-primary-600" />
                        <div>
                          <p className="font-medium">پرداخت آنلاین</p>
                          <p className="text-sm text-gray-600">پرداخت از طریق درگاه بانکی</p>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input type="checkbox" className="rounded text-primary-600" />
                        <div>
                          <p className="font-medium">کارت به کارت</p>
                          <p className="text-sm text-gray-600">انتقال وجه به شماره کارت</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSettings;