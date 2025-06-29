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
          {/* Animated Background */}
          <div style={styles.backgroundImage}></div>
          <div style={styles.backgroundAnimation}>
            <div style={styles.floatingShape1}></div>
            <div style={styles.floatingShape2}></div>
            <div style={styles.floatingShape3}></div>
          </div>

          <div style={styles.header}>
            <div style={styles.logoContainer}>
              <svg width="40" height="40" viewBox="0 0 32 32" style={styles.logo}>
                <defs>
                  <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{stopColor:"rgba(83, 22, 180, 0.93)",stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:"rgba(65, 39, 161, 0.6)",stopOpacity:1}} />
                  </linearGradient>
                </defs>
                <rect width="32" height="32" rx="8" fill="url(#grad1)"/>
                <path d="M8 8h6v6H8V8zm0 10h6v6H8v-6zm10-10h6v6h-6V8z" fill="white"/>
                <path d="M18 18h6v6h-6v-6z" fill="white" fillOpacity="0.8"/>
              </svg>
              <span style={styles.logoText}>Jira</span>
            </div>
          </div>

          <div style={styles.mainContent}>
            {/* Left Side - Illustration (same as main page) */}
            <div style={styles.leftSide}>
              <div style={styles.illustrationContainer}>
                <div style={styles.teamIllustration}>
                  <svg width="300" height="250" viewBox="0 0 300 250" style={styles.illustrationSvg}>
                    {/* Team collaboration illustration */}
                    <defs>
                      <linearGradient id="teamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{stopColor:"rgba(83, 22, 180, 0.8)",stopOpacity:0.8}} />
                        <stop offset="100%" style={{stopColor:"rgba(65, 39, 161, 0.6)",stopOpacity:0.9}} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div style={styles.featureHighlight}>
                  <h2 style={styles.featureTitle}>Collaborate Better</h2>
                  <p style={styles.featureText}>
                    Streamline your project management with powerful tools designed for modern teams.
                  </p>
                  <div style={styles.featureList}>
                    <div style={styles.featureItem}>
                      <span style={styles.checkmark}>✓</span>
                      <span>Efficient management of projects and tasks</span>
                    </div>
                    <div style={styles.featureItem}>
                      <span style={styles.checkmark}>✓</span>
                      <span>Advanced task tracking</span>
                    </div>
                    <div style={styles.featureItem}>
                      <span style={styles.checkmark}>✓</span>
                      <span>Customizable workflows</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Role Selection Card (in same position as login card) */}
            <div style={styles.rightSide}>
              <div style={styles.loginCard}>
                <div style={styles.roleSelectionIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="3" stroke="rgba(83, 22, 180, 0.93)" strokeWidth="2" fill="#E3F2FD"/>
                    <path d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4z" stroke="rgba(83, 22, 180, 0.93)" strokeWidth="2" fill="#E3F2FD"/>
                  </svg>
                </div>

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
        </div>
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={styles.container}>
        <div style={styles.backgroundImage}></div>
        {/* Animated Background */}
        <div style={styles.backgroundAnimation}>
          <div style={styles.floatingShape1}></div>
          <div style={styles.floatingShape2}></div>
          <div style={styles.floatingShape3}></div>
        </div>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <svg width="40" height="40" viewBox="0 0 32 32" style={styles.logo}>
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor:"rgba(83, 22, 180, 0.93)",stopOpacity:1}} />
                  <stop offset="100%" style={{stopColor:"rgba(65, 39, 161, 0.6)",stopOpacity:1}} />
                </linearGradient>
              </defs>
              <rect width="32" height="32" rx="8" fill="url(#grad1)"/>
              <path d="M8 8h6v6H8V8zm0 10h6v6H8v-6zm10-10h6v6h-6V8z" fill="white"/>
              <path d="M18 18h6v6h-6v-6z" fill="white" fillOpacity="0.8"/>
            </svg>
            <span style={styles.logoText}>Jira</span>
          </div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Left Side - Illustration */}
          <div style={styles.leftSide}>
            <div style={styles.illustrationContainer}>
              <div style={styles.teamIllustration}>
                <svg width="300" height="250" viewBox="0 0 300 250" style={styles.illustrationSvg}>
                  {/* Team collaboration illustration */}
                  <defs>
                    <linearGradient id="teamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{stopColor:"rgba(83, 22, 180, 0.8)",stopOpacity:0.8}} />
                      <stop offset="100%" style={{stopColor:"rgba(65, 39, 161, 0.6)",stopOpacity:0.9}} />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div style={styles.featureHighlight}>
                <h2 style={styles.featureTitle}>Collaborate Better</h2>
                <p style={styles.featureText}>
                  Streamline your project management with powerful tools designed for modern teams.
                </p>
                <div style={styles.featureList}>
                  <div style={styles.featureItem}>
                    <span style={styles.checkmark}>✓</span>
                    <span>Efficient management of projects and tasks</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.checkmark}>✓</span>
                    <span>Advanced task tracking</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.checkmark}>✓</span>
                    <span>Customizable workflows</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div style={styles.rightSide}>
            <div style={styles.loginCard}>
              <div style={styles.cardHeader}>
                <h1 style={styles.title}>
                  {isLogin ? 'Welcome Back!' : 'Join Our Team'}
                </h1>
                <p style={styles.subtitle}>
                  {isLogin 
                    ? 'Sign in to continue your project management journey' 
                    : 'Create your account and start managing projects like a pro'
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
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  style={{
                    ...styles.tab,
                    ...(!isLogin ? styles.activeTab : styles.inactiveTab)
                  }}
                >
                  Sign Up
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
                    Sign In
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
                    Create Account
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.5))',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    zIndex: 1,
  },

  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://ik.imagekit.io/kxva6i8j3/bg(4).jpg?updatedAt=1751076149986")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    opacity: 0.7, 
    zIndex: -1,
  },

  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    pointerEvents: 'none',
  },
  floatingShape1: {
    position: 'absolute',
    top: '10%',
    left: '10%',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.1)',
    animation: 'float 6s ease-in-out infinite',
  },
  floatingShape2: {
    position: 'absolute',
    top: '60%',
    right: '10%',
    width: '80px',
    height: '80px',
    borderRadius: '30%',
    background: 'rgba(255, 255, 255, 0.05)',
    animation: 'float 8s ease-in-out infinite reverse',
  },
  floatingShape3: {
    position: 'absolute',
    bottom: '20%',
    left: '20%',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.08)',
    animation: 'float 10s ease-in-out infinite',
  },
  header: {
    padding: '24px 32px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
    position: 'relative',
    zIndex: 10,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    borderRadius: '8px',
    filter: 'drop-shadow(0 4px 12px rgba(83, 22, 180, 0.3))',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#172B4D',
    letterSpacing: '-0.5px',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    position: 'relative',
    zIndex: 10,
  },
  leftSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    minHeight: 'calc(100vh - 96px)',
  },
  illustrationContainer: {
    textAlign: 'center',
    maxWidth: '500px',
  },
  teamIllustration: {
    marginBottom: '60px', // Increased from 40px to 60px to shift feature text down
    filter: 'drop-shadow(0 10px 30px rgba(0, 0, 0, 0.1))',
  },
  illustrationSvg: {
    width: '100%',
    height: 'auto',
    maxWidth: '350px',
  },
  featureHighlight: {
    color: 'white',
    textAlign: 'left',
  },
  featureTitle: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '16px',
    color: 'white',
    lineHeight: '1.2',
  },
  featureText: {
    fontSize: '18px',
    marginBottom: '32px',
    opacity: 0.9,
    lineHeight: '1.6',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontSize: '16px',
  },
  checkmark: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  rightSide: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    minHeight: 'calc(100vh - 96px)',
  },
  loginCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '20px',
    boxShadow: '0px 20px 60px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: '48px',
    width: '100%',
    maxWidth: '440px',
    backdropFilter: 'blur(10px)',
    position: 'relative',
    overflow: 'hidden',
  },
  welcomeIcon: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  roleSelectionIcon: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  cardHeader: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#172B4D',
    margin: '0 0 12px 0',
    lineHeight: '1.2',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '1.5',
  },
  tabContainer: {
    display: 'flex',
    marginBottom: '32px',
    backgroundColor: '#F4F5F7',
    borderRadius: '12px',
    padding: '4px',
    position: 'relative',
  },
  tab: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  activeTab: {
    color: '#FFFFFF',
    background: 'linear-gradient(135deg,rgba(83, 22, 180, 0.93) 0%,rgba(65, 39, 161, 0.6) 100%)',
    boxShadow: '0 2px 8px rgba(83, 22, 180, 0.3)',
  },
  inactiveTab: {
    color: '#6B778C',
    backgroundColor: '#FFFFFF',
  },
  googleContainer: {
    marginBottom: '24px',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '32px 0',
  },
  dividerText: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#6B778C',
    padding: '0 20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    position: 'relative',
    '::before': {
      content: '""',
      position: 'absolute',
      top: '50%',
      left: '-100px',
      right: '-100px',
      height: '1px',
      backgroundColor: '#E1E5E9',
      zIndex: -1,
    },
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  inputGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#5E6C84',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #E1E5E9',
    borderRadius: '12px',
    fontSize: '16px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    '::placeholder': {
      color: '#8B9DC3',
    },
    ':focus': {
      borderColor: '#0052CC',
      boxShadow: '0 0 0 3px rgba(0, 82, 204, 0.1)',
      transform: 'translateY(-1px)',
    },
  },
  select: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #E1E5E9',
    borderRadius: '12px',
    fontSize: '16px',
    color: '#172B4D',
    backgroundColor: '#FFFFFF',
    outline: 'none',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    cursor: 'pointer',
    ':focus': {
      borderColor: '#0052CC',
      boxShadow: '0 0 0 3px rgba(0, 82, 204, 0.1)',
    },
  },
  primaryButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg,rgba(83, 22, 180, 0.93) 0%,rgba(65, 39, 161, 0.6) 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginTop: '8px',
    boxShadow: '0 4px 12px rgba(0, 82, 204, 0.3)',
    ':hover': {
      transform: 'translateY(-2px)',
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