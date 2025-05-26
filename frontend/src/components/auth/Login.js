import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const clientId = '1080816176181-p23c90520lrbhc1blep9q4pak6j14ei3.apps.googleusercontent.com'; 

const LoginPage = () => {
  const { login, signUp } = useAuth();
  const navigate = useNavigate();

  const [isNewUser, setIsNewUser] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Client'); // Default role: Client

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isNewUser) {
        // Sign-up logic
        await signUp({ name, email, password, role });
        alert('Account created successfully! You can now log in.');
        setIsNewUser(false); // Switch to login mode after successful sign-up, user still needs to explicitly log in
        // OR, if you want them immediately on dashboard after signup, use:
        // navigate('/dashboard', { replace: true });
      } else {
        // Login logic
        // This part currently doesn't call an API in your AuthContext.js
        // If you had a login API call in AuthContext, it would look like this:
        // await login({ email, password });
        // For demonstration purposes, assuming 'login' handles the actual login and sets 'user'
        // For a real scenario, you'd call an API here and then call context's login
        login({ id: 1, email: email, full_name: "Logged In User", role: "Client" }); // Placeholder for actual login

        // *** IMPORTANT CHANGE HERE ***
        navigate('/dashboard', { replace: true }); // Replace the current history entry
      }
    } catch (error) {
      alert('Operation failed: ' + error.message);
    }
  };

  const handleSuccess = async (credentialResponse) => {
    const googleToken = credentialResponse.credential;

    try {
      const res = await fetch(`http://localhost:8000/auth/google/callback?token=${googleToken}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Google login failed');
      }

      const data = await res.json();
      login(data.user); // Use the login function from context
      localStorage.setItem('jira-token', data.access_token);
      // *** IMPORTANT CHANGE HERE ***
      navigate('/dashboard', { replace: true }); // Replace the current history entry
    } catch (error) {
      alert('Authentication failed: ' + error.message);
    }
  };

  const handleError = () => {
    alert('Google login failed');
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div style={styles.container}>
        <div style={styles.loginBox}>
          <h2 style={styles.title}>{isNewUser ? 'Create Account' : 'Welcome!'}</h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            {isNewUser && (
              <>
                <label htmlFor="name" style={styles.label}>Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={styles.input}
                  required
                />
                <label htmlFor="role" style={styles.label}>Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ ...styles.input, ...styles.selectInput }}
                  required
                >
                  <option value="Client">Client</option>
                  <option value="Developer">Developer</option>
                  <option value="Project Manager">Project Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </>
            )}
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
            <button type="submit" style={styles.button}>{isNewUser ? 'Sign Up' : 'Login'}</button>
          </form>
          <div style={styles.orSeparator}>OR</div>
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
          />
          <div style={styles.toggleLink}>
            {isNewUser ? (
              <span>Already have an account? <button onClick={() => setIsNewUser(false)} style={styles.linkButton}>Login</button></span>
            ) : (
              <span>New user? <button onClick={() => setIsNewUser(true)} style={styles.linkButton}>Create Account</button></span>
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
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
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
  title: {
    marginBottom: '30px',
    color: '#333',
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
  selectInput: {
    appearance: 'none',
    backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'%23667eea\'%3E%3Cpath d=\'M7 10l5 5 5-5z\'/%3E%3C/svg%3E")',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 15px center',
    backgroundSize: '16px',
    paddingRight: '40px',
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
  },
  orSeparator: {
    margin: '20px 0',
    color: '#777',
  },
  googleButton: {
    marginTop: '10px',
  },
  toggleLink: {
    marginTop: '15px',
    color: '#555',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#667eea',
    cursor: 'pointer',
    textDecoration: 'underline',
    padding: 0,
  },
};

export default LoginPage;