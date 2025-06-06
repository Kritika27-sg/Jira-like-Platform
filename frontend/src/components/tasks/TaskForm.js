import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Todo');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
    })
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert('Choose a project');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify({ 
          title, 
          description, 
          status, 
          project_id: parseInt(projectId) 
        }),
      });
      
      if (!res.ok) throw new Error('Failed to create task');
      await res.json();
      
      setShowSuccessModal(true);
      
      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);
      
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/tasks');
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/tasks" style={styles.backLink}>
            <button style={styles.backButton}>
              ← Back to Tasks
            </button>
          </Link>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>➕ Create New Task</h1>
            <p style={styles.pageSubtitle}>
              Add a new task to your project
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Task Details</h2>
            <p style={styles.formSubtitle}>
              Fill in the information below to create your task
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📁</span>
                Project *
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
                disabled={loading}
                style={styles.select}
              >
                <option value="">Select a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📝</span>
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
                style={styles.input}
                placeholder="Enter a descriptive task title"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>📄</span>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
                style={styles.textarea}
                rows="4"
                placeholder="Provide additional details about the task (optional)"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                <span style={styles.labelIcon}>🏷️</span>
                Status *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={loading}
                style={styles.select}
              >
                <option value="To Do">📋 To Do</option>
                <option value="In Progress">⚡ In Progress</option>
                <option value="Done">✅ Done</option>
              </select>
            </div>

            <div style={styles.formActions}>
              <Link to="/tasks" style={styles.linkButton}>
                <button type="button" style={styles.cancelButton}>
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  ...styles.submitButton,
                  ...(loading ? styles.disabledButton : {})
                }}
              >
                {loading ? (
                  <>
                    <span style={styles.spinner}></span>
                    Creating...
                  </>
                ) : (
                  <>➕ Create Task</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.successModal}>
            <div style={styles.successIcon}>✅</div>
            <h3 style={styles.successTitle}>Task Created Successfully!</h3>
            <p style={styles.successMessage}>
              Your task has been created and added to the project.
            </p>
            <p style={styles.redirectMessage}>
              Redirecting you back to the task list...
            </p>
            <div style={styles.successActions}>
              <button 
                style={styles.successButton}
                onClick={handleSuccessModalClose}
              >
                Go to Tasks
              </button>
            </div>
          </div>
        </div>
      )}
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
  backLink: {
    textDecoration: 'none',
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
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  formHeader: {
    padding: '24px 32px 16px 32px',
    borderBottom: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '20px',
  },
  form: {
    padding: '32px',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
    marginBottom: '8px',
  },
  labelIcon: {
    fontSize: '16px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    resize: 'vertical',
    fontFamily: 'inherit',
    minHeight: '100px',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    fontFamily: 'inherit',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    paddingTop: '16px',
    borderTop: '1px solid #DFE1E6',
    marginTop: '32px',
  },
  linkButton: {
    textDecoration: 'none',
  },
  cancelButton: {
    padding: '12px 24px',
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
    padding: '12px 24px',
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
    opacity: '0.6',
    cursor: 'not-allowed',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #FFFFFF',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(9, 30, 66, 0.54)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
  },
  successModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    padding: '32px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
  },
  successIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 12px 0',
  },
  successMessage: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0 0 8px 0',
    lineHeight: '20px',
  },
  redirectMessage: {
    fontSize: '12px',
    color: '#6B778C',
    margin: '0 0 24px 0',
    fontStyle: 'italic',
  },
  successActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  successButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#00875A',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
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

export default TaskForm;