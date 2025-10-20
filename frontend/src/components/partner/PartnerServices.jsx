import React, { useState, useEffect } from 'react';
import { partnerServiceAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PartnerServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    is_active: true,
  });

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const response = await partnerServiceAPI.getServices();
      setServices(response.data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('خطا در بارگذاری خدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        await partnerServiceAPI.updateService(editingService.id, formData);
        toast.success('خدمت با موفقیت ویرایش شد');
      } else {
        await partnerServiceAPI.createService(formData);
        toast.success('خدمت با موفقیت اضافه شد');
      }
      
      loadServices();
      closeModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error('خطا در ذخیره خدمت');
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price,
      duration: service.duration,
      is_active: service.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این خدمت اطمینان دارید؟')) return;
    
    try {
      await partnerServiceAPI.deleteService(id);
      toast.success('خدمت با موفقیت حذف شد');
      loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('خطا در حذف خدمت');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await partnerServiceAPI.toggleServiceStatus(id);
      toast.success('وضعیت خدمت تغییر کرد');
      loadServices();
    } catch (error) {
      console.error('Error toggling service status:', error);
      toast.error('خطا در تغییر وضعیت');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      is_active: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">خدمات</h1>
          <p className="text-gray-600">مدیریت خدمات و قیمت‌گذاری</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          افزودن خدمت
        </button>
      </div>

      {/* Services List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="spinner"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">خدمتی ثبت نشده است</h3>
          <p className="text-gray-600 mb-6">خدمات خود را اضافه کنید تا مشتریان بتوانند رزرو کنند</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            افزودن اولین خدمت
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleStatus(service.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      service.is_active ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        service.is_active ? 'translate-x-1' : 'translate-x-6'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {service.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">قیمت:</span>
                  <span className="font-bold text-primary-600">
                    {service.price.toLocaleString('fa-IR')} تومان
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">مدت زمان:</span>
                  <span className="font-medium">{service.duration} دقیقه</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  ویرایش
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
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
              {editingService ? 'ویرایش خدمت' : 'افزودن خدمت جدید'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام خدمت *
                </label>
                <input
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="مثال: کوتاهی مو"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  توضیحات
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="توضیحات مختصری درباره این خدمت..."
                ></textarea>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  قیمت (تومان) *
                </label>
                <input
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="مثال: 150000"
                  required
                  min="0"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مدت زمان (دقیقه) *
                </label>
                <input
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="مثال: 30"
                  required
                  min="1"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  name="is_active"
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="rounded text-primary-600 focus:ring-primary-500"
                />
                <label className="text-sm text-gray-700">
                  این خدمت فعال است
                </label>
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
                  {editingService ? 'ذخیره تغییرات' : 'افزودن خدمت'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerServices;