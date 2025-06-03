import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, email, full_name, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('jira-user');
    const storedToken = localStorage.getItem('jira-token');
    
    if (storedUser && storedToken) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear corrupted data
        localStorage.removeItem('jira-user');
        localStorage.removeItem('jira-token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // If credentials is already a user object (from Google login or direct call), use it directly
      if (credentials && credentials.id && credentials.email) {
        setUser(credentials);
        localStorage.setItem('jira-user', JSON.stringify(credentials));
        return { user: credentials };
      }

      // Otherwise, it's email/password login
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store user data and token
      setUser(data.user);
      localStorage.setItem('jira-user', JSON.stringify(data.user));
      localStorage.setItem('jira-token', data.access_token);
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: userData.full_name || userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Automatically log in the user after successful registration
      setUser(data.user);
      localStorage.setItem('jira-user', JSON.stringify(data.user));
      localStorage.setItem('jira-token', data.access_token);
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Google OAuth login/signup handler
  const googleAuth = async (googleToken, role = null) => {
    try {
      let url = `http://localhost:8000/auth/google/callback?token=${googleToken}`;
      if (role) {
        url += `&role=${role}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Google authentication failed');
      }

      const data = await response.json();
      
      // Store user data and token
      setUser(data.user);
      localStorage.setItem('jira-user', JSON.stringify(data.user));
      localStorage.setItem('jira-token', data.access_token);
      
      return data;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jira-user');
    localStorage.removeItem('jira-token');
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return user !== null && localStorage.getItem('jira-token') !== null;
  };

  // Get the current token
  const getToken = () => {
    return localStorage.getItem('jira-token');
  };

  // Validate token and refresh user data if needed
  const validateToken = async () => {
    const token = getToken();
    if (!token) {
      logout();
      return false;
    }

    try {
      // You can add a token validation endpoint to your FastAPI backend
      // For now, we'll just check if the token exists and is not expired
      // You might want to decode the JWT and check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp < currentTime) {
        logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation error:', error);
      logout();
      return false;
    }
  };

  // Get user role
  const getUserRole = () => {
    return user?.role || null;
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(user?.role);
  };

  const contextValue = {
    user,
    login,
    register,
    googleAuth,
    logout,
    loading,
    isAuthenticated,
    getToken,
    validateToken,
    getUserRole,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};