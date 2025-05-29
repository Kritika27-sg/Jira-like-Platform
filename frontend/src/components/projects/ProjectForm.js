import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const buttonColor = '#667eea'; 

const ProjectForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Project name is required');
      return;
    }

    // Check for token before making request
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('jira-token') ||
                  localStorage.getItem('authToken');
    
    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    
    if (!token) {
      setErrorMsg('Authentication required. Please log in again.');
      // Optionally redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      // Updated API endpoint - remove /api/ if router is mounted directly
      const res = await fetch('http://localhost:8000/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          description: description.trim() || null 
        }),
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        let errorMessage = 'Failed to create project';
        
        // Handle specific HTTP status codes
        if (res.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
          // Optionally redirect to login
          // navigate('/login');
        } else if (res.status === 403) {
          errorMessage = 'You do not have permission to create projects.';
        } else if (res.status === 422) {
          errorMessage = 'Invalid project data provided.';
        }
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the default error message
        }
        
        throw new Error(errorMessage);
      }

      const projectData = await res.json();
      console.log('Created project:', projectData);
      
      setSuccessMsg('Project created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      
      setTimeout(() => {
        // Navigate to projects list page
        navigate('/projects');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMsg(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard'); // Or navigate to projects list: navigate('/projects')
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.header}>Create Project</h2>

      {errorMsg && <p style={styles.error}>{errorMsg}</p>}
      {successMsg && <p style={styles.success}>{successMsg}</p>}

      <label style={styles.label}>
        Project Name <span style={{ color: 'red' }}>*</span>
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
        style={styles.input}
        placeholder="Enter project name"
        required
        maxLength={255} 
      />

      <label style={styles.label}>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        disabled={loading}
        style={styles.textarea}
        placeholder="Enter project description (optional)"
        maxLength={1000} 
      />

      <div style={styles.buttonContainer}>
        <button 
          type="submit" 
          disabled={loading || !name.trim()} 
          style={{
            ...styles.submitButton,
            ...(loading || !name.trim() ? styles.disabledButton : {})
          }}
        >
          {loading ? 'Creating...' : 'Create'}
        </button>
        <button
          type="button"
          onClick={handleBackClick}
          disabled={loading}
          style={{
            ...styles.backButton,
            ...(loading ? styles.disabledButton : {})
          }}
        >
          Back
        </button>
      </div>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: 600,
    margin: '40px auto',
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    fontSize: 26,
    marginBottom: 25,
    color: '#333',
    textAlign: 'center',
  },
  label: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
    marginBottom: 6,
  },
  input: {
    fontSize: 16,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ccc',
    marginBottom: 20,
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  textarea: {
    fontSize: 16,
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid #ccc',
    resize: 'vertical',
    minHeight: 80,
    marginBottom: 20,
    outline: 'none',
    transition: 'border-color 0.3s ease',
    fontFamily: 'inherit',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: buttonColor,
    color: '#fff',
    padding: '12px 18px',
    fontWeight: 600,
    fontSize: 16,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${buttonColor}99`,
    transition: 'all 0.3s ease',
    flex: 1,
    marginRight: 10,
  },
  backButton: {
    backgroundColor: '#6c757d',
    color: '#fff',
    padding: '12px 18px',
    fontWeight: 600,
    fontSize: 16,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(108, 117, 125, 0.4)',
    transition: 'all 0.3s ease',
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.6,
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  error: {
    color: '#dc3545',
    fontWeight: 600,
    marginBottom: 15,
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: 6,
  },
  success: {
    color: '#155724',
    fontWeight: 600,
    marginBottom: 15,
    textAlign: 'center',
    padding: '10px',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: 6,
  },
};

export default ProjectForm;