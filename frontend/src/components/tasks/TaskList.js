import React, { useEffect, useState } from 'react';
//import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const TaskList = () => {
  //const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateForm, setUpdateForm] = useState({ title: '', description: '', status: '' });

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete task');
      
      setTasks(tasks.filter(t => t.id !== taskId));
      setShowDeleteModal(false);
      setSelectedTask(null);
      alert('Task deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!updateForm.title.trim()) {
      alert('Task title is required');
      return;
    }
    
    if (!updateForm.status) {
      alert('Task status is required');
      return;
    }
    
    if (!selectedTask) {
      alert('No task selected');
      return;
    }

    try {
      // Prepare the update data - ensure all fields are properly formatted
      const updateData = {
        title: updateForm.title.trim(),
        description: updateForm.description.trim(),
        status: updateForm.status,
        project_id: selectedTask.project_id
      };

      console.log('Sending update data:', updateData); // Debug log

      const res = await fetch(`http://localhost:8000/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify(updateData),
      });

      // Check if response is ok
      if (!res.ok) {
        const errorData = await res.text(); // Get error details
        console.error('Update failed:', errorData);
        throw new Error(`Failed to update task: ${res.status} ${res.statusText}`);
      }
      
      const updatedTask = await res.json();
      setTasks(tasks.map(t => 
        t.id === selectedTask.id ? updatedTask : t
      ));
      
      setShowUpdateModal(false);
      setSelectedTask(null);
      setUpdateForm({ title: '', description: '', status: '' });
      alert('Task updated successfully!');
    } catch (error) {
      console.error('Update error:', error);
      alert(`Error updating task: ${error.message}`);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const openUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const selectTaskForDelete = (task) => {
    setSelectedTask(task);
  };

  const selectTaskForUpdate = (task) => {
    setSelectedTask(task);
    setUpdateForm({
      title: task.title,
      description: task.description || '',
      status: task.status
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'to do':
        return { color: '#6B778C', backgroundColor: '#F4F5F7' };
      case 'in progress':
        return { color: '#0052CC', backgroundColor: '#DEEBFF' };
      case 'done':
        return { color: '#00875A', backgroundColor: '#E3FCEF' };
      default:
        return { color: '#6B778C', backgroundColor: '#F4F5F7' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'to do':
        return '📋';
      case 'in progress':
        return '⚡';
      case 'done':
        return '✅';
      default:
        return '📋';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading tasks...</p>
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
            <h1 style={styles.pageTitle}>📋 Tasks</h1>
            <p style={styles.pageSubtitle}>
              Manage and track your tasks
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {!tasks.length ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📋</div>
            <h3 style={styles.emptyTitle}>No tasks found</h3>
            <p style={styles.emptySubtitle}>
              Get started by creating your first task
            </p>
            <Link to="/tasks/new" style={styles.linkButton}>
              <button style={styles.primaryButton}>
                ➕ Create New Task
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Tasks Grid */}
            <div style={styles.tasksGrid}>
              {tasks.map((task) => (
                <div key={task.id} style={styles.taskCard}>
                  <div style={styles.taskHeader}>
                    <div style={styles.taskTitleSection}>
                      <h3 style={styles.taskTitle}>{task.title}</h3>
                      <div style={styles.taskMeta}>
                        <span style={styles.taskId}>#{task.id}</span>
                        {task.priority && (
                          <span style={styles.priorityIndicator}>
                            {getPriorityIcon(task.priority)} {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                    <div 
                      style={{
                        ...styles.statusBadge,
                        ...getStatusColor(task.status)
                      }}
                    >
                      {getStatusIcon(task.status)} {task.status}
                    </div>
                  </div>
                  <p style={styles.taskDescription}>
                    {task.description || 'No description provided'}
                  </p>
                  {task.assignee && (
                    <div style={styles.taskFooter}>
                      <span style={styles.statItem}>
                        <span style={styles.statIcon}>👤</span>
                        {task.assignee}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionsCard}>
              <h3 style={styles.actionsTitle}>Task Actions</h3>
              <div style={styles.actionButtons}>
                <Link to="/tasks/new" style={styles.linkButton}>
                  <button style={styles.primaryButton}>
                    ➕ Create New Task
                  </button>
                </Link>
                <button style={styles.secondaryButton} onClick={openUpdateModal}>
                  ✏️ Update Task
                </button>
                <button style={styles.dangerButton} onClick={openDeleteModal}>
                  🗑️ Delete Task
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Delete Task</h3>
              <p style={styles.modalSubtitle}>
                Select a task to delete. This action cannot be undone.
              </p>
            </div>
            
            <div style={styles.modalContent}>
              <div style={styles.taskSelection}>
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    style={selectedTask?.id === task.id ? styles.taskOptionSelected : styles.taskOption}
                    onClick={() => selectTaskForDelete(task)}
                  >
                    <div style={styles.taskOptionHeader}>
                      <strong style={styles.taskOptionName}>{task.title}</strong>
                      <div style={styles.taskOptionMeta}>
                        <span 
                          style={{
                            ...styles.taskOptionStatus,
                            ...getStatusColor(task.status)
                          }}
                        >
                          {task.status}
                        </span>
                        {selectedTask?.id === task.id && (
                          <span style={styles.selectedIndicator}>✓</span>
                        )}
                      </div>
                    </div>
                    <p style={styles.taskOptionDesc}>
                      {task.description || 'No description'}
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
                  setSelectedTask(null);
                }}
              >
                Cancel
              </button>
              <button
                style={{
                  ...styles.confirmDeleteButton,
                  ...(selectedTask ? {} : styles.disabledButton)
                }}
                onClick={() => handleDeleteTask(selectedTask.id)}
                disabled={!selectedTask}
              >
                Delete Task
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
              <h3 style={styles.modalTitle}>Update Task</h3>
              <p style={styles.modalSubtitle}>
                {!selectedTask ? 'Select a task to update' : 'Update task details'}
              </p>
            </div>

            <div style={styles.modalContent}>
              {!selectedTask ? (
                <div style={styles.taskSelection}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      style={styles.taskOption}
                      onClick={() => selectTaskForUpdate(task)}
                    >
                      <div style={styles.taskOptionHeader}>
                        <strong style={styles.taskOptionName}>{task.title}</strong>
                        <div style={styles.taskOptionMeta}>
                          <span 
                            style={{
                              ...styles.taskOptionStatus,
                              ...getStatusColor(task.status)
                            }}
                          >
                            {task.status}
                          </span>
                          <span style={styles.editIcon}>✏️</span>
                        </div>
                      </div>
                      <p style={styles.taskOptionDesc}>
                        {task.description || 'No description'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateTask} style={styles.form}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Task Title</label>
                    <input
                      type="text"
                      value={updateForm.title}
                      onChange={(e) => setUpdateForm({...updateForm, title: e.target.value})}
                      style={styles.input}
                      required
                      placeholder="Enter task title"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description</label>
                    <textarea
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                      style={styles.textarea}
                      rows="4"
                      placeholder="Enter task description"
                    />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                      style={styles.select}
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                  <div style={styles.modalFooter}>
                    <button
                      type="button"
                      style={styles.cancelButton}
                      onClick={() => {
                        setShowUpdateModal(false);
                        setSelectedTask(null);
                        setUpdateForm({ title: '', description: '', status: '' });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={styles.confirmUpdateButton}
                    >
                      Update Task
                    </button>
                  </div>
                </form>
              )}
            </div>

            {!selectedTask && (
              <div style={styles.modalFooter}>
                <button
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowUpdateModal(false);
                    setSelectedTask(null);
                    setUpdateForm({ title: '', description: '', status: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
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
  tasksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
    cursor: 'pointer',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  taskTitleSection: {
    flex: '1',
  },
  taskTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 4px 0',
    lineHeight: '24px',
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  taskId: {
    fontSize: '12px',
    color: '#6B778C',
    fontWeight: '500',
  },
  priorityIndicator: {
    fontSize: '11px',
    color: '#6B778C',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  statusBadge: {
    fontSize: '11px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap',
  },
  taskDescription: {
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: '20px',
    margin: '0 0 16px 0',
    minHeight: '40px',
  },
  taskFooter: {
    display: 'flex',
    alignItems: 'center',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: '#6B778C',
  },
  statIcon: {
    fontSize: '14px',
  },
  actionsCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
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
  taskSelection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskOption: {
    padding: '16px',
    borderTop: '1px solid #DFE1E6',
    borderRight: '1px solid #DFE1E6',
    borderBottom: '1px solid #DFE1E6',
    borderLeft: '1px solid #DFE1E6',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    backgroundColor: '#FAFBFC',
  },
  taskOptionSelected: {
    padding: '16px',
    borderTop: '1px solid #0052CC',
    borderRight: '1px solid #0052CC',
    borderBottom: '1px solid #0052CC',
    borderLeft: '1px solid #0052CC',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease, background-color 0.2s ease',
    backgroundColor: '#DEEBFF',
  },
  taskOptionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  taskOptionName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
  },
  taskOptionMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  taskOptionStatus: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  selectedIndicator: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: '600',
  },
  editIcon: {
    fontSize: '12px',
  },
  taskOptionDesc: {
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
  select: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
    backgroundColor: '#FFFFFF',
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

export default TaskList;