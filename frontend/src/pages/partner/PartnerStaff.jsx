import React, { useState, useEffect } from 'react';
import { partnerStaffAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PartnerStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    phone: '',
    email: '',
    specialties: '',
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const response = await partnerStaffAPI.getStaff();
      setStaff(response.data);
    } catch (error) {
      console.error('Error loading staff:', error);
      toast.error('خطا در بارگذاری پرسنل');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingStaff) {
        await partnerStaffAPI.updateStaff(editingStaff.id, formData);
        toast.success('پرسنل با موفقیت ویرایش شد');
      } else {
        await partnerStaffAPI.createStaff(formData);
        toast.success('پرسنل با موفقیت اضافه شد');
      }
      
      loadStaff();
      closeModal();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast.error('خطا در ذخیره پرسنل');
    }
  };

  const handleEdit = (member) => {
    setEditingStaff(member);
    setFormData({
      name: member.name,
      title: member.title || '',
      phone: member.phone || '',
      email: member.email || '',
      specialties: member.specialties || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این عضو پرسنل اطمینان دارید؟')) return;
    
    try {
      await partnerStaffAPI.deleteStaff(id);
      toast.success('پرسنل با موفقیت حذف شد');
      loadStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('خطا در حذف پرسنل');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setFormData({
      name: '',
      title: '',
      phone: '',
      email: '',
      specialties: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">پرسنل</h1>
          <p className="text-gray-600">مدیریت اعضای تیم و متخصصان</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن پرسنل
        </button>
      </div>

      {/* Staff List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">پرسنلی ثبت نشده است</h3>
          <p className="text-gray-600 mb-6">اعضای تیم خود را اضافه کنید</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            افزودن اولین عضو
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              {/* Avatar */}
              <div className="text-center mb-4">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  {member.avatar ? (
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">👤</span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-gray-900">{member.name}</h3>
                {member.title && (
                  <p className="text-sm text-gray-600">{member.title}</p>
                )}
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4 pb-4 border-b">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="truncate">{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
              </div>

              {/* Specialties */}
              {member.specialties && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">تخصص‌ها:</p>
                  <p className="text-sm text-gray-700">{member.specialties}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">
                    {member.total_bookings || 0}
                  </p>
                  <p className="text-xs text-gray-600">رزرو</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {member.rating ? member.rating.toFixed(1) : '-'}
                  </p>
                  <p className="text-xs text-gray-600">امتیاز</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">
              {editingStaff ? 'ویرایش پرسنل' : 'افزودن پرسنل جدید'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام و نام خانوادگی *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="نام کامل"
                  required
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان شغلی
                </label>
                <input
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="مثال: متخصص آرایش مو"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره تماس
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  dir="ltr"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ایمیل
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="example@email.com"
                />
              </div>

              {/* Specialties */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تخصص‌ها
                </label>
                <textarea
                  name="specialties"
                  value={formData.specialties}
                  onChange={handleChange}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="تخصص‌ها و مهارت‌ها را بنویسید..."
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline flex-1"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  {editingStaff ? 'ذخیره تغییرات' : 'افزودن پرسنل'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerStaff;