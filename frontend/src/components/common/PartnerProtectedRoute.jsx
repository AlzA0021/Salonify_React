import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePartnerAuth } from '../../contexts/PartnerAuthContext';

const PartnerProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = usePartnerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/partner/login" replace />;
  }

  return children;
};

export default PartnerProtectedRoute;