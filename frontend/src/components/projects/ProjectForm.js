import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
    navigate('/projects'); // Navigate back to projects list
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Creating project...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button 
            style={styles.backButton}
            onClick={handleBackClick}
            type="button"
          >
            ← Back to Projects
          </button>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>➕ Create New Project</h1>
            <p style={styles.pageSubtitle}>
              Set up a new project to organize your work
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.formCard}>
          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Alert Messages */}
            {errorMsg && (
              <div style={styles.errorAlert}>
                <span style={styles.alertIcon}>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}
            
            {successMsg && (
              <div style={styles.successAlert}>
                <span style={styles.alertIcon}>✅</span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Form Fields */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Project Name <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                style={{
                  ...styles.input,
                  ...(name.trim() ? {} : styles.inputEmpty)
                }}
                placeholder="Enter project name"
                required
                maxLength={255}
              />
              <p style={styles.fieldHint}>
                Choose a clear, descriptive name for your project
              </p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
                style={styles.textarea}
                placeholder="Enter project description (optional)"
                maxLength={1000}
                rows="4"
              />
              <p style={styles.fieldHint}>
                Provide additional context about the project's goals and scope
              </p>
            </div>

            {/* Form Actions */}
            <div style={styles.formActions}>
              <button
                type="button"
                onClick={handleBackClick}
                disabled={loading}
                style={{
                  ...styles.cancelButton,
                  ...(loading ? styles.disabledButton : {})
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !name.trim()} 
                style={{
                  ...styles.submitButton,
                  ...(loading || !name.trim() ? styles.disabledButton : {})
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.buttonSpinner}></span>
                    Creating...
                  </>
                ) : (
                  <>
                    ➕ Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFBFC',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #DFE1E6',
    padding: '24px 32px',
  },
  headerContent: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#172B4D',
    marginBottom: '16px',
    transition: 'background-color 0.2s ease',
  },
  titleSection: {
    marginBottom: '8px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
    lineHeight: '32px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '24px',
  },
  mainContent: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #DFE1E6',
    borderTop: '3px solid #0052CC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6B778C',
    marginTop: '16px',
    margin: '16px 0 0 0',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  errorAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#FFEBE6',
    border: '1px solid #FFBDAD',
    borderRadius: '4px',
    color: '#BF2600',
    fontSize: '14px',
    fontWeight: '500',
  },
  successAlert: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    backgroundColor: '#E3FCEF',
    border: '1px solid #ABF5D1',
    borderRadius: '4px',
    color: '#00875A',
    fontSize: '14px',
    fontWeight: '500',
  },
  alertIcon: {
    fontSize: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
    lineHeight: '20px',
  },
  required: {
    color: '#DE350B',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    backgroundColor: '#FFFFFF',
  },
  inputEmpty: {
    borderColor: '#DFE1E6',
  },
  textarea: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '80px',
    backgroundColor: '#FFFFFF',
  },
  fieldHint: {
    fontSize: '12px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '16px',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '8px',
  },
  cancelButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#172B4D',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  submitButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  disabledButton: {
    opacity: '0.5',
    cursor: 'not-allowed',
  },
  buttonSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid transparent',
    borderTop: '2px solid #FFFFFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
};

// Add CSS animation for spinner
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default ProjectForm;