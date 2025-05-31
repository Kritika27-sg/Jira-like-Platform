import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const clientId = '1080816176181-p23c90520lrbhc1blep9q4pak6j14ei3.apps.googleusercontent.com';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // State for switching between login and register
  const [isLogin, setIsLogin] = useState(true);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration form states
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerRole, setRegisterRole] = useState('Client'); // Default role
  const [registerPassword, setRegisterPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      // Store token and user data
      localStorage.setItem('jira-token', data.access_token);
      login(data.user);
      
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert('Login failed: ' + error.message);
    }
  };


  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    try {
      const registrationData = {
        full_name: registerName,
        email: registerEmail,
        role: registerRole,
        password: registerPassword
      };
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      const data = await response.json();
      // Store token and user data
      localStorage.setItem('jira-token', data.access_token);
      await login(data.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };


  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    try {
      const res = await fetch(`http://localhost:8000/auth/google/callback?token=${googleToken}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Google login failed');
      }
      const data = await res.json();
      // Store token and login user
      localStorage.setItem('jira-token', data.access_token);
      await login(data.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert('Authentication failed: ' + error.message);
    }
  };
  const handleGoogleError = () => {
    alert('Google login failed');
  };


  
  //UI 
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={styles.container}>
        {/* Title Text */}
        <h1 style={styles.titleText}>JIRA-LIKE PLATFORM</h1>

        <div style={styles.loginBox}>
          <h2 style={styles.subtitle}>
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          
          {/* Toggle buttons */}
          <div style={styles.toggleContainer}>
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              style={{
                ...styles.toggleButton,
                ...(isLogin ? styles.activeToggle : styles.inactiveToggle)
              }}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              style={{
                ...styles.toggleButton,
                ...(!isLogin ? styles.activeToggle : styles.inactiveToggle)
              }}
            >
              Register
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <form onSubmit={handleLoginSubmit} style={styles.form}>
              <label htmlFor="loginEmail" style={styles.label}>Email</label>
              <input
                type="email"
                id="loginEmail"
                placeholder="Enter your email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                style={styles.input}
                required
              />

              <label htmlFor="loginPassword" style={styles.label}>Password</label>
              <input
                type="password"
                id="loginPassword"
                placeholder="Enter your password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                style={styles.input}
                required
              />
              
              <button type="submit" style={styles.button}>Login</button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegisterSubmit} style={styles.form}>
              <label htmlFor="registerName" style={styles.label}>Full Name</label>
              <input
                type="text"
                id="registerName"
                placeholder="Enter your full name"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                style={styles.input}
                required
              />

              <label htmlFor="registerEmail" style={styles.label}>Email</label>
              <input
                type="email"
                id="registerEmail"
                placeholder="Enter your email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                style={styles.input}
                required
              />
              
              <label htmlFor="registerRole" style={styles.label}>Role</label>
              <select
                id="registerRole"
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
                style={styles.input}
                required
              >
                <option value="Client">Client</option>
                <option value="Admin">Admin</option>
                <option value="Project Manager">Project Manager</option>
                <option value="Developer">Developer</option>
              </select>

              <label htmlFor="registerPassword" style={styles.label}>Password</label>
              <input
                type="password"
                id="registerPassword"
                placeholder="Enter your password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                style={styles.input}
                required
              />
              
              <button type="submit" style={styles.button}>Register</button>
            </form>
          )}

          <div style={styles.orSeparator}>OR</div>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
  },
  titleText: {
    fontSize: '50px',
    fontFamily: "'Arial', sans-serif",
    color: '#fff',
    marginBottom: '40px',
  },
  loginBox: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'center',
  },
  subtitle: {
    marginBottom: '20px',
    color: '#333',
  },
  toggleContainer: {
    display: 'flex',
    marginBottom: '30px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #ddd',
  },
  toggleButton: {
    flex: 1,
    padding: '10px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
  },
  activeToggle: {
    backgroundColor: '#667eea',
    color: '#fff',
  },
  inactiveToggle: {
    backgroundColor: '#f8f9fa',
    color: '#666',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  label: {
    marginBottom: '8px',
    fontWeight: '600',
    color: '#555',
  },
  input: {
    padding: '12px 15px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    padding: '14px',
    backgroundColor: '#667eea',
    color: '#fff',
    fontWeight: '700',
    fontSize: '16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
    marginBottom: '20px',
  },
  orSeparator: {
    margin: '20px 0',
    color: '#777',
  },
};

export default LoginPage;