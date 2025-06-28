import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dev_Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, to do, in progress, done

  useEffect(() => {
    fetchUserProfile();
    fetchMyTasks();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      const userData = await res.json();
      setUser(userData);
    } catch (err) {
      console.error('Error fetching users :', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const projectsData = await res.json();
      
      // Create a map of project_id to project_name for quick lookup
      const projectsMap = {};
      projectsData.forEach(project => {
        projectsMap[project.id] = project.name || project.title || `Project ${project.id}`;
      });
      setProjects(projectsMap);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
      
      // Fetch projects after getting tasks
      await fetchProjects();
    } catch (err) {
      setError('Error loading your tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update task');
      
      // Update the task in the local state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      alert('Error updating task status. Please try again.');
      console.error('Error updating task:', err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'to do':
        return '#DFE1E6';
      case 'in progress':
        return '#FFF4E6';
      case 'done':
        return '#E3FCEF';
      default:
        return '#DFE1E6';
    }
  };

  const getStatusTextColor = (status) => {
    switch (status.toLowerCase()) {
      case 'to do':
        return '#172B4D';
      case 'in progress':
        return '#FF8B00';
      case 'done':
        return '#00875A';
      default:
        return '#172B4D';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return '#DE350B';
      case 'medium':
        return '#FF8B00';
      case 'low':
        return '#00875A';
      default:
        return '#6B778C';
    }
  };

  const getProjectName = (projectId) => {
    return projects[projectId] || `Project ${projectId}`;
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'todo') return task.status.toLowerCase() === 'to do' || task.status.toLowerCase() === 'todo';
    if (filter === 'inprogress') return task.status.toLowerCase() === 'in progress';
    if (filter === 'done') return task.status.toLowerCase() === 'done';
    return true;
  });

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status.toLowerCase() === 'to do' || t.status.toLowerCase() === 'todo').length,
      inProgress: tasks.filter(t => t.status.toLowerCase() === 'in progress').length,
      done: tasks.filter(t => t.status.toLowerCase() === 'done').length,
    };
    return stats;
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.navigationSection}>
            <Link to="/dashboard" style={styles.backButton}>
              ← Back to Dashboard
            </Link>
          </div>
          
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>My Tasks</h1>
            <p style={styles.pageSubtitle}>
              Here are the tasks assigned to you.
            </p>
          </div>
          
          {/* Stats Cards */}
          <div style={styles.statsContainer}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Tasks</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.todo}</div>
              <div style={styles.statLabel}>To Do</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.inProgress}</div>
              <div style={styles.statLabel}>In Progress</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{stats.done}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {error && (
          <div style={styles.errorMessage}>
            <span style={styles.errorIcon}>⚠️</span>
            {error}
            <button style={styles.retryButton} onClick={fetchMyTasks}>
              Retry
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div style={styles.filterTabs}>
          <button 
            style={{
              ...styles.filterTab,
              ...(filter === 'all' ? styles.activeTab : {})
            }}
            onClick={() => setFilter('all')}
          >
            All Tasks ({stats.total})
          </button>
          <button 
            style={{
              ...styles.filterTab,
              ...(filter === 'todo' ? styles.activeTab : {})
            }}
            onClick={() => setFilter('todo')}
          >
            📋 To Do ({stats.todo})
          </button>
          <button 
            style={{
              ...styles.filterTab,
              ...(filter === 'inprogress' ? styles.activeTab : {})
            }}
            onClick={() => setFilter('inprogress')}
          >
            ⚡ In Progress ({stats.inProgress})
          </button>
          <button 
            style={{
              ...styles.filterTab,
              ...(filter === 'done' ? styles.activeTab : {})
            }}
            onClick={() => setFilter('done')}
          >
            ✅ Done ({stats.done})
          </button>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              {filter === 'all' ? '📋' : 
               filter === 'todo' ? '📋' :
               filter === 'inprogress' ? '⚡' : '✅'}
            </div>
            <h3 style={styles.emptyTitle}>
              {filter === 'all' ? 'No tasks assigned yet' :
               filter === 'todo' ? 'No tasks to do' :
               filter === 'inprogress' ? 'No tasks in progress' :
               'No completed tasks'}
            </h3>
            <p style={styles.emptyMessage}>
              {filter === 'all' 
                ? 'Tasks assigned to you by project managers will appear here.'
                : `You don't have any ${filter === 'todo' ? 'pending' : filter === 'inprogress' ? 'active' : 'completed'} tasks right now.`
              }
            </p>
          </div>
        ) : (
          <div style={styles.tasksList}>
            {filteredTasks.map(task => (
              <div key={task.id} style={styles.taskCard}>
                <div style={styles.taskHeader}>
                  <div style={styles.taskTitleSection}>
                    <h3 style={styles.taskTitle}>{task.title}</h3>
                    <div style={styles.taskMeta}>
                      {task.project_id && (
                        <span style={styles.projectName}>
                          📁 {getProjectName(task.project_id)}
                        </span>
                      )}
                      <span style={styles.taskId}>#{task.id}</span>
                    </div>
                  </div>
                  
                  <div style={styles.taskActions}>
                    <div 
                      style={{
                        ...styles.statusBadge,
                        backgroundColor: getStatusColor(task.status),
                        color: getStatusTextColor(task.status)
                      }}
                    >
                      {getStatusIcon(task.status)} {task.status}
                    </div>
                  </div>
                </div>

                {task.description && (
                  <div style={styles.taskDescription}>
                    {task.description}
                  </div>
                )}

                <div style={styles.taskFooter}>
                  <div style={styles.taskInfo}>
                    {task.priority && (
                      <span 
                        style={{
                          ...styles.priorityBadge,
                          color: getPriorityColor(task.priority)
                        }}
                      >
                        🔥 {task.priority}
                      </span>
                    )}
                    {task.created_at && (
                      <span style={styles.createdDate}>
                        Created: {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  
                  <div style={styles.statusActions}>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      style={styles.statusSelect}
                    >
                      <option value="To Do">📋 To Do</option>
                      <option value="In Progress">⚡ In Progress</option>
                      <option value="Done">✅ Done</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#FAFBFC',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #DFE1E6',
    borderTop: '4px solid #0052CC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#6B778C',
    margin: '0',
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
  navigationSection: {
    marginBottom: '16px',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#0052CC',
    backgroundColor: 'transparent',
    border: '1px solid #0052CC',
    borderRadius: '4px',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  titleSection: {
    marginBottom: '24px',
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  statCard: {
    backgroundColor: '#F4F5F7',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #DFE1E6',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#0052CC',
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '14px',
    color: '#6B778C',
    fontWeight: '500',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px',
  },
  errorMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    backgroundColor: '#FFEBE6',
    border: '1px solid #FFBDAD',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '24px',
    color: '#DE350B',
  },
  errorIcon: {
    fontSize: '20px',
  },
  retryButton: {
    padding: '6px 12px',
    fontSize: '12px',
    backgroundColor: '#DE350B',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  filterTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    borderBottom: '1px solid #DFE1E6',
    paddingBottom: '16px',
  },
  filterTab: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    backgroundColor: 'transparent',
    border: '1px solid #DFE1E6',
    borderRadius: '20px',
    cursor: 'pointer',
    color: '#6B778C',
    transition: 'all 0.2s ease',
  },
  activeTab: {
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    borderColor: '#0052CC',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #DFE1E6',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  emptyMessage: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '20px',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    transition: 'box-shadow 0.2s ease',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  taskTitleSection: {
    flex: 1,
  },
  taskTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
    lineHeight: '24px',
  },
  taskMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
  },
  projectName: {
    fontSize: '14px',
    color: '#0052CC',
    fontWeight: '500',
    backgroundColor: '#E6F3FF',
    padding: '4px 8px',
    borderRadius: '12px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
  },
  taskId: {
    fontSize: '12px',
    color: '#6B778C',
    backgroundColor: '#F4F5F7',
    padding: '2px 8px',
    borderRadius: '12px',
  },
  taskActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid transparent',
  },
  taskDescription: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: '20px',
    marginBottom: '16px',
    backgroundColor: '#F4F5F7',
    padding: '12px',
    borderRadius: '4px',
    borderLeft: '3px solid #0052CC',
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #DFE1E6',
  },
  taskInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  priorityBadge: {
    fontSize: '12px',
    fontWeight: '600',
  },
  createdDate: {
    fontSize: '12px',
    color: '#6B778C',
  },
  statusActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusSelect: {
    padding: '6px 12px',
    fontSize: '12px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    fontWeight: '500',
  },
};

// Add CSS animation for spinner and hover effects
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  a[style*="backButton"]:hover {
    background-color: #0052CC !important;
    color: #FFFFFF !important;
  }
`;
document.head.appendChild(styleSheet);

export default Dev_Tasks;