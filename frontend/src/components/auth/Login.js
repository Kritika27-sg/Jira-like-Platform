import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const clientId = '1080816176181-p23c90520lrbhc1blep9q4pak6j14ei3.apps.googleusercontent.com';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // State for switching between login and register
  const [isLogin, setIsLogin] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

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
          password: loginPassword,
          role: registerRole // Assuming login also needs a role for backend validation or session
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

  const handleGoogleError = () => {
    alert('Google login failed');
  };

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  // Role selection modal for Google signup
  if (showGoogleRoleSelection) {
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <div className="min-h-screen bg-black overflow-hidden flex flex-col">
          {/* Animated Cursor */}
          <div
            className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
            style={{
              left: mousePosition.x - 12,
              top: mousePosition.y - 12,
            }}
          />

          {/* Enhanced Background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
            <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{animationDelay: '2s'}}></div>
            <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{animationDelay: '4s'}}></div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
            <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
            <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
          </div>

          {/* Navigation */}
          <nav className="fixed w-full z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center space-x-3 group cursor-pointer" onClick={handleBackToHome}>
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                      <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z"/>
                      </svg>
                    </div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                  </div>
                  <span className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Jira
                  </span>
                </div>
                <button
                  onClick={handleBackToHome}
                  className="text-white/60 hover:text-white transition-colors duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Home</span>
                </button>
              </div>
            </div>
          </nav>

          {/* Main Content for Google Role Selection */}
          <div className="flex-grow flex items-center justify-center px-4 py-16 sm:py-20">
            <div className="relative z-10 w-full max-w-sm sm:max-w-md">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur opacity-20"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-10 lg:p-12">
                <div className="text-center mb-6 sm:mb-8">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">Select Your Role</h1>
                  <p className="text-sm sm:text-base text-gray-300">Complete your Google sign-up by selecting your role.</p>
                </div>

                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label htmlFor="googleRole" className="block text-sm font-bold text-white mb-2">
                      Role *
                    </label>
                    <select
                      id="googleRole"
                      value={selectedGoogleRole}
                      onChange={(e) => setSelectedGoogleRole(e.target.value)}
                      className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white backdrop-blur-xl"
                      required
                    >
                      <option value="Client" className="text-black">Client</option>
                      <option value="Project Manager" className="text-black">Project Manager</option>
                      <option value="Developer" className="text-black">Developer</option>
                    </select>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <button
                      type="button"
                      onClick={handleGoogleSignupWithRole}
                      className="relative w-full px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl sm:rounded-2xl overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-2xl text-base sm:text-lg"
                    >
                      <span className="relative z-10">Complete Sign Up</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
      <div className="h-screen bg-black flex flex-col overflow-auto">
        {/* Animated Cursor */}
        <div
          className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
          }}
        />

        {/* Enhanced Background - make this fixed to prevent scrolling with content */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{animationDelay: '4s'}}></div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        </div>

        {/* Navigation */}
        <nav className="fixed w-full z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4">
              <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={handleBackToHome}>
                <div className="relative">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z"/>
                    </svg>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                </div>
                <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Jira
                </span>
              </div>
              <button
                onClick={handleBackToHome}
                className="text-white/60 hover:text-white transition-colors duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base bg-transparent hover:bg-white/10 px-3 py-2 rounded-lg"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Home</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content for Login/Register */}
        <div className="flex-grow flex items-center justify-center px-4 py-8 sm:py-12 md:py-16 mt-16 sm:mt-20">
          <div className="w-full max-w-lg lg:max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">

            {/* Left Side - Features */}
            <div className="relative z-10 text-center lg:text-left">
              <div className="mb-8 sm:mb-12">
                <div className="inline-flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-xs sm:text-sm font-medium mb-6 sm:mb-8 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Secure authentication powered by AI</span>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 sm:mb-8 leading-tight">
                <span className="block">Welcome to the</span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
                  Future of Work
                </span>
              </h1>

              <p className="text-base sm:text-lg text-gray-300 mb-8 sm:mb-12 leading-relaxed max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
                Join thousands of teams revolutionizing project management with AI-powered insights, seamless collaboration, and cutting-edge design.
              </p>

              {/* Features List */}
              <div className="space-y-4 sm:space-y-6">
                {[
                  { icon: '🚀', title: 'Lightning Fast Setup', desc: 'Get started in under 60 seconds' },
                  { icon: '🛡️', title: 'Enterprise Security', desc: 'Bank-level encryption and SOC 2 compliance' },
                  { icon: '🎯', title: 'AI-Powered Insights', desc: 'Smart analytics and predictive project management' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 sm:space-x-4 group">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300">
                      <span className="text-xl sm:text-2xl">{feature.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base sm:text-lg group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-400 group-hover:to-pink-400 transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Login/Register Form */}
            <div className="relative z-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur opacity-20"></div>
              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8 sm:p-10 lg:p-12 min-h-fit max-h-full">
                <div className="text-center mb-6 sm:mb-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl transform hover:rotate-12 transition-all duration-300">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 sm:mb-3">
                    {isLogin ? 'Welcome Back!' : 'Join Our Community'}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-300">
                    {isLogin
                      ? 'Continue your project management journey'
                      : 'Start managing projects like never before'
                    }
                  </p>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white/5 backdrop-blur-xl rounded-xl sm:rounded-2xl p-1.5 sm:p-2 mb-6 sm:mb-8 border border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`w-1/2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                      isLogin
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-xl'
                        : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`w-1/2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-300 ${
                      !isLogin
                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-xl'
                        : 'bg-transparent text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Google Login - Removed the surrounding box */}
                <div className="mb-6 sm:mb-8">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    text={isLogin ? "signin_with" : "signup_with"}
                    size="large"
                    width="100%"
                  />
                </div>

                <div className="relative mb-6 sm:mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-xs sm:text-sm">
                    <span className="px-3 sm:px-4 bg-black text-white/60 font-medium">OR</span>
                  </div>
                </div>

                {/* Forms */}
                {isLogin ? (
                  <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label htmlFor="loginEmail" className="block text-xs sm:text-sm font-bold text-white mb-2">
                        Email address *
                      </label>
                      <input
                        type="email"
                        id="loginEmail"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40 backdrop-blur-xl text-sm sm:text-base"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="loginPassword" className="block text-xs sm:text-sm font-bold text-white mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="loginPassword"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40 backdrop-blur-xl text-sm sm:text-base"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="relative w-full px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl sm:rounded-2xl overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-2xl text-base sm:text-lg"
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>Sign In</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-6">
                    <div>
                      <label htmlFor="registerName" className="block text-xs sm:text-sm font-bold text-white mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="registerName"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40 backdrop-blur-xl text-sm sm:text-base"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="registerEmail" className="block text-xs sm:text-sm font-bold text-white mb-2">
                        Email address *
                      </label>
                      <input
                        type="email"
                        id="registerEmail"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40 backdrop-blur-xl text-sm sm:text-base"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="registerRole" className="block text-xs sm:text-sm font-bold text-white mb-2">
                        Role *
                      </label>
                      <select
                        id="registerRole"
                        value={registerRole}
                        onChange={(e) => setRegisterRole(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white backdrop-blur-xl text-sm sm:text-base"
                        required
                      >
                        <option value="Client" className="text-black">Client</option>
                        <option value="Project Manager" className="text-black">Project Manager</option>
                        <option value="Developer" className="text-black">Developer</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="registerPassword" className="block text-xs sm:text-sm font-bold text-white mb-2">
                        Password *
                      </label>
                      <input
                        type="password"
                        id="registerPassword"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="w-full px-4 py-3 sm:py-4 bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-white placeholder-white/40 backdrop-blur-xl text-sm sm:text-base"
                        placeholder="Create your password"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="relative w-full px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-xl sm:rounded-2xl overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-2xl text-base sm:text-lg"
                    >
                      <span className="relative z-10 flex items-center justify-center space-x-2">
                        <span>Sign Up</span>
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;