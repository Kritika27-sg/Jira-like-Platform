import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser ] = useState(null); // { id, email, full_name, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser  = localStorage.getItem('jira-user');
    if (storedUser ) {
      setUser (JSON.parse(storedUser ));
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser (userData);
    localStorage.setItem('jira-user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser (null);
    localStorage.removeItem('jira-user');
  };

  // Sign up function to register new users
  const signUp = async ({ name, email, password, role }) => {
    try {
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name, email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();

      // Automatically log in the user after successful sign-up
      setUser (data.user);
      localStorage.setItem('jira-user', JSON.stringify(data.user));

      // Optionally, save access token if provided
      if (data.access_token) {
        localStorage.setItem('jira-token', data.access_token);
      }

      return data; // Return user data or any other relevant info
    } catch (error) {
      throw error; // Propagate error to be handled in the component
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to access AuthContext easily
export const useAuth = () => useContext(AuthContext);


