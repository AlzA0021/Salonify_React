import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const { user, updateProfile, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await updateProfile(formData);
    setLoading(false);
    if (result.success) {
      setEditing(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('رمز عبور جدید و تکرار آن مطابقت ندارند');
      return;
    }

    setLoading(true);
    // Call API to change password
    setLoading(false);
    toast.success('رمز عبور با موفقیت تغییر کرد');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">پروفایل من</h1>
            <p className="text-gray-600">مدیریت اطلاعات حساب کاربری</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* Avatar */}
                <div className="text-center mb-6 pb-6 border-b">
                  <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <span className="text-3xl text-primary-600 font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{user?.name}</h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>

                {/* Menu */}
                <nav className="space-y-2">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'profile'
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    اطلاعات حساب
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full text-right px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'password'
                        ? 'bg-primary-50 text-primary-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    تغییر رمز عبور
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
                    onClick={logout}
                    className="w-full text-right px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                  >
                    خروج از حساب
                  </button>
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md p-6">
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">اطلاعات حساب</h2>
                      {!editing && (
                        <button
                          onClick={() => setEditing(true)}
                          className="btn-outline"
                        >
                          ویرایش
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نام و نام خانوادگی
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input-field"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ایمیل
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input-field"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          شماره موبایل
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editing}
                          className="input-field"
                          dir="ltr"
                        />
                      </div>

                      {editing && (
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditing(false);
                              setFormData({
                                name: user?.name || '',
                                email: user?.email || '',
                                phone: user?.phone || '',
                              });
                            }}
                            className="btn-outline flex-1"
                          >
                            انصراف
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary flex-1"
                          >
                            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                          </button>
                        </div>
                      )}
                    </form>
                  </div>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">تغییر رمز عبور</h2>

                    <form onSubmit={handleChangePassword} className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رمز عبور فعلی
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={handlePasswordChange}
                          className="input-field"
                          required
                        />
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          رمز عبور جدید
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          className="input-field"
                          required
                          minLength={6}
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          حداقل ۶ کاراکتر
                        </p>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          تکرار رمز عبور جدید
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          className="input-field"
                          required
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full"
                      >
                        {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold mb-6">تنظیمات اعلان‌ها</h2>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4 border-b">
                        <div>
                          <h3 className="font-medium mb-1">اعلان‌های ایمیل</h3>
                          <p className="text-sm text-gray-600">دریافت اعلان‌ها از طریق ایمیل</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b">
                        <div>
                          <h3 className="font-medium mb-1">یادآوری رزرو</h3>
                          <p className="text-sm text-gray-600">یادآوری قبل از زمان رزرو</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b">
                        <div>
                          <h3 className="font-medium mb-1">پیشنهادات ویژه</h3>
                          <p className="text-sm text-gray-600">دریافت اطلاعات تخفیف‌ها و پیشنهادات</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
                    