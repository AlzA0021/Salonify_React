import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Customer Pages
import CustomerLayout from './pages/customer/CustomerLayout';
import HomePage from './pages/customer/HomePage';
import SearchPage from './pages/customer/SearchPage';
import BusinessDetailPage from './pages/customer/BusinessDetailPage';
import BookingPage from './pages/customer/BookingPage';
import MyBookingsPage from './pages/customer/MyBookingsPage';
import ProfilePage from './pages/customer/ProfilePage';
import LoginPage from './pages/customer/LoginPage';
import ForgotPasswordPage from './pages/customer/ForgotPasswordPage';
import RegisterPage from './pages/customer/RegisterPage';

// Partner Pages
import PartnerLayout from './pages/partner/PartnerLayout';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import PartnerCalendar from './pages/partner/PartnerCalendar';
import PartnerServices from './pages/partner/PartnerServices';
import PartnerBookings from './pages/partner/PartnerBookings';
import PartnerCustomers from './pages/partner/PartnerCustomers';
import PartnerStaff from './pages/partner/PartnerStaff';
import PartnerSettings from './pages/partner/PartnerSettings';
import PartnerLogin from './pages/partner/PartnerLogin';
import PartnerRegister from './pages/partner/PartnerRegister';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { PartnerAuthProvider } from './contexts/PartnerAuthContext';

// Protected Route Components
import ProtectedRoute from './components/common/ProtectedRoute';
import PartnerProtectedRoute from './components/common/PartnerProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <PartnerAuthProvider>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Customer Routes */}
              <Route path="/" element={<CustomerLayout />}>
                <Route index element={<HomePage />} />
                <Route path="search" element={<SearchPage />} />
                <Route path="business/:id" element={<BusinessDetailPage />} />
                <Route path="booking/:businessId" element={<BookingPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                
                {/* Protected Customer Routes */}
                <Route path="my-bookings" element={
                  <ProtectedRoute>
                    <MyBookingsPage />
                  </ProtectedRoute>
                } />
                <Route path="profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Partner Routes */}
              <Route path="/partner">
                <Route path="login" element={<PartnerLogin />} />
                <Route path="register" element={<PartnerRegister />} />
                
                {/* Protected Partner Routes */}
                <Route element={
                  <PartnerProtectedRoute>
                    <PartnerLayout />
                  </PartnerProtectedRoute>
                }>
                  <Route index element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="dashboard" element={<PartnerDashboard />} />
                  <Route path="calendar" element={<PartnerCalendar />} />
                  <Route path="services" element={<PartnerServices />} />
                  <Route path="bookings" element={<PartnerBookings />} />
                  <Route path="customers" element={<PartnerCustomers />} />
                  <Route path="staff" element={<PartnerStaff />} />
                  <Route path="settings" element={<PartnerSettings />} />
                </Route>
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
              position="top-left"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={true}
              closeOnClick
              rtl={true}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </PartnerAuthProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;