import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: '', description: '' });

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete project');
      
      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteModal(false);
      setSelectedProject(null);
      alert('Project deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify(updateForm),
      });
      if (!res.ok) throw new Error('Failed to update project');
      
      const updatedProject = await res.json();
      setProjects(projects.map(p => 
        p.id === selectedProject.id ? updatedProject : p
      ));
      
      setShowUpdateModal(false);
      setSelectedProject(null);
      setUpdateForm({ name: '', description: '' });
      alert('Project updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const openUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const selectProjectForDelete = (project) => {
    setSelectedProject(project);
  };

  const selectProjectForUpdate = (project) => {
    setSelectedProject(project);
    setUpdateForm({
      name: project.name,
      description: project.description || ''
    });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/dashboard" style={styles.backLink}>
            <button style={styles.backButton}>
              ← Back to Dashboard
            </button>
          </Link>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>📋 Projects</h1>
            <p style={styles.pageSubtitle}>
              Manage and view projects
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {!projects.length ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>No projects found</h3>
            <p style={styles.emptySubtitle}>
              Get started by creating your first project
            </p>
            {(user.role === 'Admin' || user.role === 'Project Manager') && (
              <Link to="/projects/new" style={styles.linkButton}>
                <button style={styles.primaryButton}>
                  ➕ Create New Project
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Action Buttons - Now above projects */}
            {(user.role === 'Admin' || user.role === 'Project Manager') && (
              <div style={styles.actionsCard}>
                <h3 style={styles.actionsTitle}>Actions</h3>
                <div style={styles.actionButtons}>
                  <Link to="/projects/new" style={styles.linkButton}>
                    <button style={styles.primaryButton}>
                      ➕ Create New Project
                    </button>
                  </Link>
                  <button style={styles.secondaryButton} onClick={openUpdateModal}>
                    ✏️ Update Project
                  </button>
                  <button style={styles.dangerButton} onClick={openDeleteModal}>
                    🗑️ Delete Project
                  </button>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            <div style={styles.projectsGrid}>
              {projects.map((project) => (
                <div key={project.id} style={styles.projectCard}>
                  <div style={styles.projectHeader}>
                    <h3 style={styles.projectName}>{project.name}</h3>
                    <div style={styles.projectBadge}>Active</div>
                  </div>
                  <p style={styles.projectDescription}>
                    {project.description || 'No description provided'}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete Project</h3>
              <p style={styles.modalSubtitle}>
                Select a project to delete. This action cannot be undone.
              </p>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.projectSelection}>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    style={{
                      ...styles.projectOption,
                      ...(selectedProject?.id === project.id ? styles.projectOptionSelected : {})
                    }}
                    onClick={() => selectProjectForDelete(project)}
                  >
                    <div style={styles.projectOptionHeader}>
                      <strong style={styles.projectOptionName}>{project.name}</strong>
                      {selectedProject?.id === project.id && (
                        <span style={styles.selectedIndicator}>✓</span>
                      )}
                    </div>
                    <p style={styles.projectOptionDesc}>
                      {project.description || 'No description'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.confirmDeleteButton,
                  ...(selectedProject ? {} : styles.disabledButton)
                }}
                onClick={() => handleDeleteProject(selectedProject.id)}
                disabled={!selectedProject}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Update Project</h3>
              <p style={styles.modalSubtitle}>
                {!selectedProject ? 'Select a project to update' : 'Update project details'}
              </p>
            </div>

            <div style={styles.modalContent}>
              {!selectedProject ? (
                <div style={styles.projectSelection}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={styles.projectOption}
                      onClick={() => selectProjectForUpdate(project)}
                    >
                      <div style={styles.projectOptionHeader}>
                        <strong style={styles.projectOptionName}>{project.name}</strong>
                        <span style={styles.editIcon}>✏️</span>
                      </div>
                      <p style={styles.projectOptionDesc}>
                        {project.description || 'No description'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateProject} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Project Name</label>
                    <input
                      type="text"
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                      style={styles.input}
                      required
                      placeholder="Enter project name"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                      style={styles.textarea}
                      rows="4"
                      placeholder="Enter project description"
                    />
                  </div>
                </form>
              )}
            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedProject(null);
                  setUpdateForm({ name: '', description: '' });
                }}
              >
                Cancel
              </button>
              {selectedProject && (
                <button
                  style={styles.confirmUpdateButton}
                  onClick={handleUpdateProject}
                >
                  Update Project
                </button>
              )}
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
    maxWidth: '1200px',
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
    maxWidth: '1200px',
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
  emptyState: {
    textAlign: 'center',
    padding: '64px 32px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  emptySubtitle: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0 0 32px 0',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    marginBottom: '32px',
  },
  actionsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 16px 0',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    cursor: 'pointer',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectName: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
    lineHeight: '24px',
  },
  projectBadge: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: '20px',
    margin: '0 0 16px 0',
    minHeight: '40px',
  },
  linkButton: {
    textDecoration: 'none',
  },
  primaryButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  secondaryButton: {
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
  dangerButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#DE350B',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
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
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 8px 16px rgba(9, 30, 66, 0.25)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: '24px 24px 16px 24px',
    borderBottom: '1px solid #DFE1E6',
  },
  modalTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  modalSubtitle: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '20px',
  },
  modalContent: {
    padding: '24px',
    flex: '1',
    overflowY: 'auto',
  },
  modalFooter: {
    padding: '16px 24px 24px 24px',
    borderTop: '1px solid #DFE1E6',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  projectSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  projectOption: {
    padding: '16px',
    border: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    backgroundColor: '#FAFBFC',
  },
  projectOptionSelected: {
    borderColor: '#0052CC',
    backgroundColor: '#DEEBFF',
  },
  projectOptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  projectOptionName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
  },
  selectedIndicator: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: '600',
  },
  editIcon: {
    fontSize: '12px',
  },
  projectOptionDesc: {
    fontSize: '12px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
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
  confirmDeleteButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#DE350B',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  confirmUpdateButton: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  disabledButton: {
    opacity: '0.5',
    cursor: 'not-allowed',
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

export default ProjectList;