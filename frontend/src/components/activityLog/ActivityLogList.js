import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

const ProjectTaskActivityViewer = () => {
  const [view, setView] = useState('projects'); // 'projects', 'tasks', 'activity'
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loadingComments, setLoadingComments] = useState(false);
  const [error, setError] = useState(null);
  const [projectTaskCounts, setProjectTaskCounts] = useState({}); // New state for task counts

  // Fetch task count for a specific project
  const fetchTaskCount = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) return 0;
      const data = await res.json();
      return data.length;
    } catch (error) {
      console.error(`Error fetching task count for project ${projectId}:`, error);
      return 0;
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
      
      // Fetch task counts for all projects
      const taskCounts = {};
      await Promise.all(
        data.map(async (project) => {
          const count = await fetchTaskCount(project.id);
          taskCounts[project.id] = count;
        })
      );
      setProjectTaskCounts(taskCounts);
    } catch (error) {
      setError('Failed to load projects. Please try again.');
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
    setLoading(false);
  };

  // Fetch tasks for a project
  const fetchTasks = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}/tasks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      setError('Failed to load tasks. Please try again.');
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
    setLoading(false);
  };

  // Fetch activity logs for a task
  const fetchActivityLogs = async (taskId) => {
    setLoadingComments(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:8000/activity-log/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch activity logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      setError('Failed to load activity logs. Please try again.');
      console.error('Error fetching activity logs:', error);
      setLogs([]);
    }
    setLoadingComments(false);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  // Navigation handlers
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setView('tasks');
    fetchTasks(project.id);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setView('activity');
    fetchActivityLogs(task.id);
  };

  const handleBackToProjects = () => {
    setView('projects');
    setSelectedProject(null);
    setSelectedTask(null);
    setTasks([]);
    setLogs([]);
  };

  const handleBackToTasks = () => {
    setView('tasks');
    setSelectedTask(null);
    setLogs([]);
  };

  const handleBackToDashboard = () => {
    window.history.back();
  };

  // Utility functions
  const getUserName = (userId) => {
    if (!userId) return 'Unknown User';
    const user = users.find(user => user.id === userId);
    return user ? (user.full_name || user.name || user.username) : `User ${userId}`;
  };

  const getActionIcon = (action) => {
    const actionLower = action?.toLowerCase();
    if (actionLower?.includes('create')) return '➕';
    if (actionLower?.includes('update')) return '✏️';
    if (actionLower?.includes('delete')) return '🗑️';
    if (actionLower?.includes('assign')) return '👤';
    if (actionLower?.includes('comment')) return '💬';
    if (actionLower?.includes('status')) return '🔄';
    return '📝';
  };

  const getActionColor = (action) => {
    const actionLower = action?.toLowerCase();
    if (actionLower?.includes('create')) return { color: '#00875A', backgroundColor: '#E3FCEF' };
    if (actionLower?.includes('update')) return { color: '#0052CC', backgroundColor: '#DEEBFF' };
    if (actionLower?.includes('delete')) return { color: '#DE350B', backgroundColor: '#FFEBE6' };
    if (actionLower?.includes('assign')) return { color: '#6554C0', backgroundColor: '#EAE6FF' };
    if (actionLower?.includes('comment')) return { color: '#FF8B00', backgroundColor: '#FFF4E6' };
    if (actionLower?.includes('status')) return { color: '#00A3BF', backgroundColor: '#E6FCFF' };
    return { color: '#6B778C', backgroundColor: '#F4F5F7' };
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffInMs = now - logTime;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      if (diffInMinutes > 0) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower?.includes('completed') || statusLower?.includes('done')) {
      return { color: '#00875A', backgroundColor: '#E3FCEF' };
    }
    if (statusLower?.includes('progress') || statusLower?.includes('active')) {
      return { color: '#0052CC', backgroundColor: '#DEEBFF' };
    }
    if (statusLower?.includes('pending') || statusLower?.includes('todo')) {
      return { color: '#FF8B00', backgroundColor: '#FFF4E6' };
    }
    return { color: '#6B778C', backgroundColor: '#F4F5F7' };
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    if (priorityLower?.includes('high') || priorityLower?.includes('urgent')) {
      return { color: '#DE350B', backgroundColor: '#FFEBE6' };
    }
    if (priorityLower?.includes('medium')) {
      return { color: '#FF8B00', backgroundColor: '#FFF4E6' };
    }
    if (priorityLower?.includes('low')) {
      return { color: '#00875A', backgroundColor: '#E3FCEF' };
    }
    return { color: '#6B778C', backgroundColor: '#F4F5F7' };
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <span style={styles.loadingText}>Loading...</span>
        </div>
      </div>
    );
  }

  // Projects view
  if (view === 'projects') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <Link to="/dashboard" style={styles.backLink}>
              <button style={styles.backButton}>
                ← Back to Dashboard
              </button>
            </Link>
            <div style={styles.titleSection}>
              <h1 style={styles.pageTitle}>🏗️ Projects</h1>
              <p style={styles.pageSubtitle}>Select a project to view its tasks and activities</p>
            </div>
          </div>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>📋 Select a Project</h2>
              <p style={styles.formSubtitle}>
                Choose a project to view its tasks and activity logs
              </p>
            </div>
            
            <div style={styles.cardContent}>
              {!projects.length ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>🏗️</div>
                  <p style={styles.emptyText}>No projects available</p>
                  <p style={styles.emptySubtext}>Contact your project manager for access.</p>
                </div>
              ) : (
                <div style={styles.projectGrid}>
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      style={styles.projectCard}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div style={styles.projectHeader}>
                        <h4 style={styles.projectName}>{project.name}</h4>
                        <div style={styles.projectBadge}>Active</div>
                      </div>
                      <p style={styles.projectDescription}>
                        {project.description || 'No description provided'}
                      </p>
                      <div style={styles.projectFooter}>
                        <span style={styles.taskCount}>
                          {projectTaskCounts[project.id] || 0} tasks
                        </span>
                        <span style={styles.selectText}>View Tasks →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tasks view
  if (view === 'tasks') {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.headerContent}>
            <button
              style={styles.backButton}
              onClick={handleBackToProjects}
            >
              ← Back to Projects
            </button>
            <div style={styles.titleSection}>
              <h1 style={styles.pageTitle}>📋 Tasks - {selectedProject?.name}</h1>
              <p style={styles.pageSubtitle}>Select a task to view its activity log</p>
            </div>
          </div>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>📋 Project Tasks</h2>
              <p style={styles.formSubtitle}>
                {selectedProject?.description || 'No description provided'}
              </p>
            </div>
            
            <div style={styles.cardContent}>
              {!tasks.length ? (
                <div style={styles.emptyState}>
                  <div style={styles.emptyIcon}>📋</div>
                  <p style={styles.emptyText}>No tasks found</p>
                  <p style={styles.emptySubtext}>Tasks will appear here when they are created.</p>
                </div>
              ) : (
                <div style={styles.projectGrid}>
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      style={styles.projectCard}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div style={styles.projectHeader}>
                        <h4 style={styles.projectName}>{task.title}</h4>
                        <div style={styles.taskBadges}>
                          {task.status && (
                            <span style={{...styles.taskBadge, ...getStatusColor(task.status)}}>
                              {task.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <p style={styles.projectDescription}>
                        {task.description || 'No description provided'}
                      </p>
                      <div style={styles.projectFooter}>
                        <div style={styles.taskMeta}>
                          {task.assignee && (
                            <span style={styles.assignee}>
                              👤 {getUserName(task.assignee_id)}
                            </span>
                          )}
                          {task.priority && (
                            <span style={{...styles.taskBadge, ...getPriorityColor(task.priority)}}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                        <span style={styles.selectText}>View Activity →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Activity logs view
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <button
            style={styles.backButton}
            onClick={handleBackToTasks}
          >
            ← Back to Tasks
          </button>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>📋 Activity Log - {selectedTask?.title}</h1>
            <p style={styles.pageSubtitle}>Task activity history and changes</p>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.selectedProjectCard}>
          <div style={styles.selectedProjectHeader}>
            <button
              style={styles.projectBackButton}
              onClick={handleBackToTasks}
            >
              ← Back to Tasks
            </button>
            <div style={styles.selectedProjectInfo}>
              <h3 style={styles.selectedProjectName}>{selectedTask?.title}</h3>
              <p style={styles.selectedProjectDesc}>
                {selectedTask?.description || 'No description provided'}
              </p>
            </div>
          </div>

          <div style={styles.commentsSection}>
            <div style={styles.commentsSectionHeader}>
              <h4 style={styles.commentsTitle}>Activity Log ({logs.length})</h4>
            </div>

            {/* Loading Activity Logs */}
            {loadingComments && (
              <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>
                <span style={styles.loadingText}>Loading activity logs...</span>
              </div>
            )}

            {/* Activity Logs List */}
            {!loadingComments && (
              <div style={styles.commentsContainer}>
                {logs.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📝</div>
                    <p style={styles.emptyText}>No activity logs found</p>
                    <p style={styles.emptySubtext}>Activity will appear here as changes are made to this task</p>
                  </div>
                ) : (
                  <div style={styles.commentsList}>
                    {logs.map((log) => (
                      <div key={log.id} style={styles.commentItem}>
                        <div style={styles.commentHeader}>
                          <div style={styles.commentAuthor}>
                            <div style={styles.authorAvatar}>
                              {getUserName(log.user_id).charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.authorInfo}>
                              <div style={styles.logHeaderInfo}>
                                <span style={styles.authorName}>
                                  {getUserName(log.user_id)}
                                </span>
                                <div 
                                  style={{
                                    ...styles.actionBadge,
                                    ...getActionColor(log.action)
                                  }}
                                >
                                  {getActionIcon(log.action)} {log.action}
                                </div>
                              </div>
                              <div style={styles.logTimeInfo}>
                                <span style={styles.relativeTime}>
                                  {getRelativeTime(log.timestamp)}
                                </span>
                                <span style={styles.commentDate}>
                                  {formatDate(log.timestamp)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {log.details && (
                          <div style={styles.commentContent}>
                            {log.details}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '12px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #DFE1E6',
    borderTop: '2px solid #0052CC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B778C',
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
  cardContent: {
    padding: '32px',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  projectCard: {
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
    flex: 1,
  },
  projectBadge: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    marginLeft: '8px',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: '20px',
    margin: '0 0 16px 0',
    minHeight: '40px',
  },
  projectFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  selectText: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: '500',
  },
  taskBadges: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  taskBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  taskMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  assignee: {
    fontSize: '12px',
    color: '#6B778C',
  },
  selectedProjectCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  selectedProjectHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
  },
  projectBackButton: {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#0052CC',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background-color 0.2s ease',
  },
  selectedProjectInfo: {
    textAlign: 'center',
  },
  selectedProjectName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  selectedProjectDesc: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
  },
  commentsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px 16px 32px',
    borderBottom: '1px solid #DFE1E6',
  },
  commentsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
  },
  commentsContainer: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#172B4D',
    margin: '0 0 4px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
  },
  commentsList: {
    padding: '0',
  },
  commentItem: {
    padding: '16px 32px',
    borderBottom: '1px solid #F4F5F7',
  },
  commentHeader: {
    marginBottom: '8px',
  },
  commentAuthor: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
    flexShrink: 0,
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  logHeaderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  authorName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
  },
  actionBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  logTimeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  relativeTime: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: '500',
  },
  commentDate: {
    fontSize: '12px',
    color: '#6B778C',
  },
  commentContent: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: '20px',
    marginLeft: '44px',
    whiteSpace: 'pre-wrap',
    backgroundColor: '#F4F5F7',
    padding: '12px 16px',
    borderRadius: '8px',
    marginTop: '8px',
  },
};

// Add CSS animation for spinner and hover effects
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .projectCard:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(9, 30, 66, 0.15);
      border-color: #0052CC;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProjectTaskActivityViewer;