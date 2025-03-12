// components/AuthRequiredRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const AuthRequiredRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default AuthRequiredRoute;