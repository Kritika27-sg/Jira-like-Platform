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
  
  // Debug logging (remove in production)
  console.log('PrivateRoute - User:', user);
  console.log('PrivateRoute - Token exists:', !!token);
  console.log('PrivateRoute - Is authenticated:', authenticated);

  // If no user or no token, redirect to login
  if (!user || !token || !authenticated) {
    console.log('PrivateRoute - Redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the protected component
  console.log('PrivateRoute - Rendering protected content');
  return children;
};

export default PrivateRoute;