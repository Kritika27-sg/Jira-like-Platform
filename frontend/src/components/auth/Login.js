import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';

const clientId = '1080816176181-p23c90520lrbhc1blep9q4pak6j14ei3.apps.googleusercontent.com';

const Login = () => {
  const { login } = useAuth();

  const handleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;

    // Send the credential (Google ID token) to your backend for verification / login
    try {
      const res = await fetch(`http://localhost:8000/auth/google/callback?token=${googleToken}`);
      if (!res.ok) throw new Error('Login failed');

      const data = await res.json();

      // {
      //   user: { id, email, full_name, role },
      //   access_token: "your_jwt_token"
      // }

      // Store user info and token securely
      login(data.user);
      localStorage.setItem('jira-token', data.access_token);

    } catch (error) {
      alert('Authentication failed: ' + error.message);
    }
  };

  const handleError = () => {
    alert('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={{ maxWidth: 400, margin: 'auto', padding: 20, textAlign: 'center' }}>
        <h2>Login with Google</h2>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap
        />
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;
