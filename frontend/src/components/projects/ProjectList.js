import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const buttonColor = '#667eea';
const deleteColor = '#ef4444';
const updateColor = '#10b981';

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
      
      // Remove project from local state
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
      
      // Update project in local state
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
        <p style={styles.message}>Loading projects...</p>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>No projects found.</p>
        {(user.role === 'Admin' || user.role === 'Project Manager') && (
          <Link to="/projects/new" style={{ textDecoration: 'none' }}>
            <button style={styles.createButton}>Create New Project</button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={styles.backButton}>← Back to Dashboard</button>
        </Link>
        <h2 style={styles.header}>Projects</h2>
      </div>
      <ul style={styles.projectList}>
        {projects.map((p) => (
          <li key={p.id} style={styles.projectItem}>
            <strong>{p.name}</strong>: {p.description || '-'}
          </li>
        ))}
      </ul>
      
      {(user.role === 'Admin' || user.role === 'Project Manager') && (
        <div style={styles.buttonContainer}>
          <Link to="/projects/new" style={{ textDecoration: 'none' }}>
            <button style={styles.createButton}>Create New Project</button>
          </Link>
          <button style={styles.updateButton} onClick={openUpdateModal}>
            Update Project
          </button>
          <button style={styles.deleteButton} onClick={openDeleteModal}>
            Delete Project
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeader}>Delete Project</h3>
            <p style={styles.modalText}>Select a project to delete:</p>
            <div style={styles.projectSelection}>
              {projects.map((project) => (
                <div
                  key={project.id}
                  style={{
                    ...styles.projectOption,
                    backgroundColor: selectedProject?.id === project.id ? '#fee2e2' : '#f9fafb'
                  }}
                  onClick={() => selectProjectForDelete(project)}
                >
                  <strong>{project.name}</strong>
                  <p style={styles.projectDesc}>{project.description || 'No description'}</p>
                </div>
              ))}
            </div>
            <div style={styles.modalButtons}>
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
                style={styles.confirmDeleteButton}
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
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeader}>Update Project</h3>
            {!selectedProject ? (
              <>
                <p style={styles.modalText}>Select a project to update:</p>
                <div style={styles.projectSelection}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={styles.projectOption}
                      onClick={() => selectProjectForUpdate(project)}
                    >
                      <strong>{project.name}</strong>
                      <p style={styles.projectDesc}>{project.description || 'No description'}</p>
                    </div>
                  ))}
                </div>
                <div style={styles.modalButtons}>
                  <button
                    style={styles.cancelButton}
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedProject(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateProject}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Project Name:</label>
                  <input
                    type="text"
                    value={updateForm.name}
                    onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description:</label>
                  <textarea
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                    style={styles.textarea}
                    rows="3"
                  />
                </div>
                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedProject(null);
                      setUpdateForm({ name: '', description: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.confirmUpdateButton}>
                    Update Project
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 640,
    margin: '40px auto',
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    margin: '30px 0',
  },
  header: {
    fontSize: 26,
    margin: 0,
    textAlign: 'center',
  },
  projectList: {
    listStyleType: 'disc',
    paddingLeft: 20,
    marginBottom: 30,
  },
  projectItem: {
    marginBottom: 12,
    fontSize: 18,
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  createButton: {
    padding: '12px 25px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: buttonColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${buttonColor}99`,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  updateButton: {
    padding: '12px 25px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: updateColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${updateColor}99`,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  deleteButton: {
    padding: '12px 25px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: deleteColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${deleteColor}99`,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    maxWidth: 500,
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  projectSelection: {
    marginBottom: 20,
  },
  projectOption: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  projectDesc: {
    fontSize: 14,
    color: '#666',
    margin: '5px 0 0 0',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  confirmDeleteButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: deleteColor,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    opacity: 1,
  },
  confirmUpdateButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: updateColor,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
};

export default ProjectList;