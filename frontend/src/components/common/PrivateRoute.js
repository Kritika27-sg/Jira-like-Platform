import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading, isAuthenticated, getToken } = useAuth();

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px' 
      }}>
        Loading...
      </div>
    );
  }

  // Check both user state and token existence for more reliable authentication
  const token = getToken();
  const authenticated = isAuthenticated();
  
  // If no user or no token, redirect to login
  if (!user || !token || !authenticated) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  return children;
};

export default PrivateRoute;