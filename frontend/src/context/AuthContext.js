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
        console.log('Loaded user from localStorage:', parsedUser);
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
      console.log('Login function called with:', credentials);
      
      // If credentials is already a user object (from Google login or direct call), use it directly
      if (credentials.id && credentials.email) {
        console.log('Direct user login (Google or registration):', credentials);
        setUser(credentials);
        localStorage.setItem('jira-user', JSON.stringify(credentials));
        console.log('User state updated, localStorage updated');
        return credentials;
      }

      // Otherwise, it's email/password login
      console.log('Email/password login attempt');
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
      console.log('Login API successful:', data.user);
      
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
      console.log('User registered:', data.user);

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

  const logout = () => {
    console.log('User logged out');
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
  };

  const contextValue = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
    getToken,
    validateToken,
    // Keep signUp for backward compatibility
    signUp: register
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