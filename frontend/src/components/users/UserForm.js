import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const successColor = '#10b981';

const UserForm = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Developer');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role,
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create user');
      
      await res.json();
      alert('User created successfully');
      navigate('/users');
    } catch (err) {
      alert(err.message);
    }
    
    setLoading(false);
  };

  const handleCancel = () => {
    navigate('/users');
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <Link to="/users" style={{ textDecoration: 'none' }}>
          <button style={styles.backButton}>← Back to Users</button>
        </Link>
        <h2 style={styles.header}>Create New User</h2>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Email Address <span style={styles.required}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              ...styles.input,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
            placeholder="Enter user's email address"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Full Name
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={loading}
            style={{
              ...styles.input,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'text'
            }}
            placeholder="Enter user's full name"
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Role <span style={styles.required}>*</span>
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={loading}
            required
            style={{
              ...styles.select,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="Developer">Developer</option>
            <option value="Project Manager">Project Manager</option>
            <option value="Admin">Admin</option>
            <option value="Tester">Tester</option>
            <option value="Client">Client</option>
          </select>
        </div>

        <div style={styles.buttonContainer}>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            style={{
              ...styles.cancelButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? (
              <span style={styles.loadingContainer}>
                <span style={styles.spinner}></span>
                Creating...
              </span>
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 700,
    margin: '40px auto',
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  header: {
    fontSize: 26,
    margin: 0,
    textAlign: 'center',
    color: '#333',
  },
  form: {
    backgroundColor: '#f8f9fa',
    padding: 30,
    borderRadius: 10,
    border: '1px solid #e9ecef',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 25,
  },
  label: {
    display: 'block',
    fontSize: 15,
    fontWeight: 600,
    marginBottom: 8,
    color: '#374151',
  },
  required: {
    color: '#ef4444',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 15,
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: 15,
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 12px center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '16px',
    paddingRight: '40px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  cancelButton: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 500,
    color: '#6b7280',
    backgroundColor: '#f9fafb',
    border: '2px solid #e5e7eb',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  submitButton: {
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: successColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${successColor}99`,
    transition: 'all 0.2s ease',
    minWidth: '120px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add CSS animation for spinner
const spinnerCSS = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerCSS;
  document.head.appendChild(style);
}

export default UserForm;