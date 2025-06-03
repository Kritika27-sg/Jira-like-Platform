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
  const [registerRole, setRegisterRole] = useState('Client');
  const [registerPassword, setRegisterPassword] = useState('');

  // Google signup role selection state
  const [showGoogleRoleSelection, setShowGoogleRoleSelection] = useState(false);
  const [googleCredential, setGoogleCredential] = useState(null);
  const [selectedGoogleRole, setSelectedGoogleRole] = useState('Client');

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
      localStorage.setItem('jira-token', data.access_token);
      await login(data.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;
    
    // If it's a login attempt, proceed directly
    if (isLogin) {
      try {
        const res = await fetch(`http://localhost:8000/auth/google/callback?token=${googleToken}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.detail || 'Google login failed');
        }
        const data = await res.json();
        localStorage.setItem('jira-token', data.access_token);
        await login(data.user);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        alert('Authentication failed: ' + error.message);
      }
    } else {
      // For signup, show role selection first
      setGoogleCredential(googleToken);
      setShowGoogleRoleSelection(true);
    }
  };

  const handleGoogleSignupWithRole = async () => {
    try {
      const res = await fetch(`http://localhost:8000/auth/google/callback?token=${googleCredential}&role=${selectedGoogleRole}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Google signup failed');
      }
      const data = await res.json();
      localStorage.setItem('jira-token', data.access_token);
      await login(data.user);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      alert('Authentication failed: ' + error.message);
    } finally {
      setShowGoogleRoleSelection(false);
      setGoogleCredential(null);
      setSelectedGoogleRole('Client');
    }
  };

  const handleCancelGoogleSignup = () => {
    setShowGoogleRoleSelection(false);
    setGoogleCredential(null);
    setSelectedGoogleRole('Client');
  };

  const handleGoogleError = () => {
    alert('Google login failed');
  };

  // Role selection modal for Google signup
  if (showGoogleRoleSelection) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <div style={styles.container}>
          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <svg width="32" height="32" viewBox="0 0 32 32" style={styles.logo}>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"#2684FF",stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"#0052CC",stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="6" fill="url(#grad1)"/>
                <path d="M8 8h6v6H8V8zm0 10h6v6H8v-6zm10-10h6v6h-6V8z" fill="white"/>
                <path d="M18 18h6v6h-6v-6z" fill="white" fillOpacity="0.8"/>
              </svg>
              <span style={styles.logoText}>Jira</span>
            </div>
          </div>

          <div style={styles.mainContent}>
            <div style={styles.loginCard}>
              <div style={styles.cardHeader}>
                <h1 style={styles.title}>Select Your Role</h1>
                <p style={styles.subtitle}>
                  Please select your role to complete your Google sign-up.
                </p>
              </div>

              <div style={styles.form}>
                <div style={styles.inputGroup}>
                  <label htmlFor="googleRole" style={styles.label}>
                    Role *
                  </label>
                  <select
                    id="googleRole"
                    value={selectedGoogleRole}
                    onChange={(e) => setSelectedGoogleRole(e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="Client">Client</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>

                <div style={styles.buttonGroup}>
                  <button 
                    type="button" 
                    onClick={handleGoogleSignupWithRole}
                    style={styles.primaryButton}
                  >
                    Complete Sign Up
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCancelGoogleSignup}
                    style={styles.secondaryButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <svg width="32" height="32" viewBox="0 0 32 32" style={styles.logo}>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"#2684FF",stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"#0052CC",stopOpacity:1}} />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="6" fill="url(#grad1)"/>
              <path d="M8 8h6v6H8V8zm0 10h6v6H8v-6zm10-10h6v6h-6V8z" fill="white"/>
              <path d="M18 18h6v6h-6v-6z" fill="white" fillOpacity="0.8"/>
            </svg>
            <span style={styles.logoText}>Jira</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          <div style={styles.loginCard}>
            <div style={styles.cardHeader}>
              <h1 style={styles.title}>
                {isLogin ? 'Log in to your account' : 'Sign up for your account'}
              </h1>
              <p style={styles.subtitle}>
                {isLogin 
                  ? 'Enter your email address and password to access your account.' 
                  : 'Create your account to get started with Jira.'
                }
              </p>
            </div>

            {/* Tab Navigation */}
            <div style={styles.tabContainer}>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{
                  ...styles.tab,
                  ...(isLogin ? styles.activeTab : styles.inactiveTab)
                }}
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{
                  ...styles.tab,
                  ...(!isLogin ? styles.activeTab : styles.inactiveTab)
                }}
              >
                Sign up
              </button>
            </div>

            {/* Google Login */}
            <div style={styles.googleContainer}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                size="large"
                width="100%"
                text={isLogin ? "signin_with" : "signup_with"}
              />
            </div>

            <div style={styles.divider}>
              <span style={styles.dividerText}>OR</span>
            </div>

            {/* Forms */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label htmlFor="loginEmail" style={styles.label}>
                    Email address *
                  </label>
                  <input
                    type="email"
                    id="loginEmail"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="loginPassword" style={styles.label}>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="loginPassword"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button type="submit" style={styles.primaryButton}>
                  Log in
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <label htmlFor="registerName" style={styles.label}>
                    Full name *
                  </label>
                  <input
                    type="text"
                    id="registerName"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="registerEmail" style={styles.label}>
                    Email address *
                  </label>
                  <input
                    type="email"
                    id="registerEmail"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="registerRole" style={styles.label}>
                    Role *
                  </label>
                  <select
                    id="registerRole"
                    value={registerRole}
                    onChange={(e) => setRegisterRole(e.target.value)}
                    style={styles.select}
                    required
                  >
                    <option value="Client">Client</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Developer">Developer</option>
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label htmlFor="registerPassword" style={styles.label}>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="registerPassword"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                <button type="submit" style={styles.primaryButton}>
                  Sign up
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFBFC',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '24px 32px',
    borderBottom: '1px solid #DFE1E6',
    backgroundColor: '#FFFFFF',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    borderRadius: '6px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 24px',
  },
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0px 8px 24px rgba(9, 30, 66, 0.15)',
    border: '1px solid #DFE1E6',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
    lineHeight: '28px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '20px',
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '24px',
    borderBottom: '2px solid #F4F5F7',
    position: 'relative',
  },
  tab: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    position: 'relative',
    transition: 'color 0.2s ease',
  },
  activeTab: {
    color: '#0052CC',
    '::after': {
      content: '""',
      position: 'absolute',
      bottom: '-2px',
      left: '0',
      right: '0',
      height: '2px',
      backgroundColor: '#0052CC',
    },
  },
  inactiveTab: {
    color: '#6B778C',
  },
  googleContainer: {
    marginBottom: '24px',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '24px 0',
    '::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '0',
      right: '0',
      height: '1px',
      backgroundColor: '#DFE1E6',
    },
  },
  dividerText: {
    backgroundColor: '#FFFFFF',
    color: '#6B778C',
    padding: '0 16px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#5E6C84',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '3px',
    fontSize: '14px',
    color: '#172B4D',
    backgroundColor: '#FAFBFC',
    outline: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    boxSizing: 'border-box',
    height: '40px',
    ':focus': {
      borderColor: '#0052CC',
      backgroundColor: '#FFFFFF',
    },
  },
  select: {
    width: '100%',
    padding: '8px 12px',
    border: '2px solid #DFE1E6',
    borderRadius: '3px',
    fontSize: '14px',
    color: '#172B4D',
    backgroundColor: '#FAFBFC',
    outline: 'none',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    boxSizing: 'border-box',
    height: '40px',
    cursor: 'pointer',
  },
  primaryButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '3px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '8px',
    height: '40px',
    ':hover': {
      backgroundColor: '#0065FF',
    },
  },
  secondaryButton: {
    width: '100%',
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: '#6B778C',
    border: '2px solid #DFE1E6',
    borderRadius: '3px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, color 0.2s ease',
    marginTop: '8px',
    height: '40px',
    ':hover': {
      borderColor: '#B3BAC5',
      color: '#172B4D',
    },
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
};

export default LoginPage;