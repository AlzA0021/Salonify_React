import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/auth/register/', userData),
  logout: () => api.post('/auth/logout/'),
  getCurrentUser: () => api.get('/auth/me/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// Partner Auth APIs
export const partnerAuthAPI = {
  login: (credentials) => api.post('/partner/auth/login/', credentials),
  register: (businessData) => api.post('/partner/auth/register/', businessData),
  logout: () => api.post('/partner/auth/logout/'),
  getCurrentPartner: () => api.get('/partner/auth/me/'),
  updateBusiness: (data) => api.put('/partner/auth/business/', data),
};

// Business APIs
export const businessAPI = {
  searchBusinesses: (params) => api.get('/businesses/', { params }),
  getBusinessDetail: (id) => api.get(`/businesses/${id}/`),
  getBusinessServices: (businessId) => api.get(`/businesses/${businessId}/services/`),
  getBusinessStaff: (businessId) => api.get(`/businesses/${businessId}/staff/`),
  getBusinessReviews: (businessId) => api.get(`/businesses/${businessId}/reviews/`),
  getAvailableSlots: (businessId, params) => api.get(`/businesses/${businessId}/available-slots/`, { params }),
};

// Booking APIs
export const bookingAPI = {
  createBooking: (data) => api.post('/bookings/', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings/', { params }),
  getBookingDetail: (id) => api.get(`/bookings/${id}/`),
  cancelBooking: (id) => api.post(`/bookings/${id}/cancel/`),
  rescheduleBooking: (id, data) => api.post(`/bookings/${id}/reschedule/`, data),
  rateBooking: (id, data) => api.post(`/bookings/${id}/rate/`, data),
};

// Partner Booking APIs
export const partnerBookingAPI = {
  getBookings: (params) => api.get('/partner/bookings/', { params }),
  getBookingDetail: (id) => api.get(`/partner/bookings/${id}/`),
  updateBookingStatus: (id, status) => api.patch(`/partner/bookings/${id}/`, { status }),
  getCalendarEvents: (params) => api.get('/partner/calendar/', { params }),
};

// Partner Service APIs
export const partnerServiceAPI = {
  getServices: () => api.get('/partner/services/'),
  createService: (data) => api.post('/partner/services/', data),
  updateService: (id, data) => api.put(`/partner/services/${id}/`, data),
  deleteService: (id) => api.delete(`/partner/services/${id}/`),
  toggleServiceStatus: (id) => api.post(`/partner/services/${id}/toggle-status/`),
};

// Partner Staff APIs
export const partnerStaffAPI = {
  getStaff: () => api.get('/partner/staff/'),
  createStaff: (data) => api.post('/partner/staff/', data),
  updateStaff: (id, data) => api.put(`/partner/staff/${id}/`, data),
  deleteStaff: (id) => api.delete(`/partner/staff/${id}/`),
  getStaffSchedule: (id, params) => api.get(`/partner/staff/${id}/schedule/`, { params }),
  updateStaffSchedule: (id, data) => api.post(`/partner/staff/${id}/schedule/`, data),
};

// Partner Customer APIs
export const partnerCustomerAPI = {
  getCustomers: (params) => api.get('/partner/customers/', { params }),
  getCustomerDetail: (id) => api.get(`/partner/customers/${id}/`),
  getCustomerHistory: (id) => api.get(`/partner/customers/${id}/history/`),
};

// Partner Dashboard APIs
export const partnerDashboardAPI = {
  getStats: (params) => api.get('/partner/dashboard/stats/', { params }),
  getRecentBookings: () => api.get('/partner/dashboard/recent-bookings/'),
  getRevenue: (params) => api.get('/partner/dashboard/revenue/', { params }),
  getPopularServices: () => api.get('/partner/dashboard/popular-services/'),
};

// Categories APIs
export const categoryAPI = {
  getCategories: () => api.get('/categories/'),
  getCategoryDetail: (id) => api.get(`/categories/${id}/`),
};

// Location APIs
export const locationAPI = {
  getCities: () => api.get('/locations/cities/'),
  getAreas: (cityId) => api.get(`/locations/cities/${cityId}/areas/`),
};

export default api;