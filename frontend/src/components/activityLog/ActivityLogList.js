import React, { useEffect, useState, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const ProjectTaskActivityViewer = () => {
  const [view, setView] = useState('projects'); // 'projects', 'tasks'
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [error, setError] = useState(null);
  const [projectTaskCounts, setProjectTaskCounts] = useState({});

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

  const handleBackToProjects = () => {
    setView('projects');
    setSelectedProject(null);
    setTasks([]);
  };

  // Utility functions
  const getUserName = (userId) => {
    if (!userId) return 'Unknown User';
    const user = users.find(user => user.id === userId);
    return user ? (user.full_name || user.name || user.username) : `User ${userId}`;
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

  // Calculate completion percentage data for pie chart
  const getCompletionData = () => {
    const statusCounts = {};
    tasks.forEach(task => {
      const status = task.status || 'Unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: Math.round((count / tasks.length) * 100)
    }));
  };

  // Colors for pie chart
  const COLORS = {
    'Completed': '#00875A',
    'Done': '#00875A',
    'In Progress': '#0052CC',
    'Active': '#0052CC',
    'Pending': '#FF8B00',
    'Todo': '#FF8B00',
    'To Do': '#FF8B00',
    'Unknown': '#6B778C'
  };

  const getColorForStatus = (status) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('completed') || statusLower.includes('done')) return '#00875A';
    if (statusLower.includes('progress') || statusLower.includes('active')) return '#0052CC';
    if (statusLower.includes('pending') || statusLower.includes('todo')) return '#FF8B00';
    return '#6B778C';
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
            <button style={styles.backButton} onClick={() => window.history.back()}>
              ← Back to Dashboard
            </button>
            <div style={styles.titleSection}>
              <h1 style={styles.pageTitle}>Projects</h1>
              <p style={styles.pageSubtitle}>Select a project to view its tasks and progress</p>
            </div>
          </div>
        </div>

        <div style={styles.mainContent}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>📋 Select a Project</h2>
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
                        <span style={styles.selectText}>View Progress →</span>
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

  // Tasks view with pie chart
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
            <p style={styles.pageSubtitle}>Task overview and completion analytics</p>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>📊 Project Overview</h2>
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
              <div style={styles.dashboardLayout}>
                {/* Pie Chart Section */}
                <div style={styles.chartSection}>
                  <h3 style={styles.sectionTitle}>📊 Completion Status</h3>
                  <div style={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getCompletionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getCompletionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getColorForStatus(entry.name)} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Summary Stats */}
                  <div style={styles.statsGrid}>
                    {getCompletionData().map((item, index) => (
                      <div key={index} style={styles.statCard}>
                        <div 
                          style={{
                            ...styles.statColor,
                            backgroundColor: getColorForStatus(item.name)
                          }}
                        ></div>
                        <div style={styles.statInfo}>
                          <div style={styles.statValue}>{item.value}</div>
                          <div style={styles.statLabel}>{item.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks List Section */}
                <div style={styles.tasksSection}>
                  <h3 style={styles.sectionTitle}>📋 All Tasks ({tasks.length})</h3>
                  <div style={styles.tasksList}>
                    {tasks.map((task) => (
                      <div key={task.id} style={styles.taskItem}>
                        <div style={styles.taskHeader}>
                          <h4 style={styles.taskTitle}>{task.title}</h4>
                          <div style={styles.taskBadges}>
                            {task.status && (
                              <span style={{...styles.taskBadge, ...getStatusColor(task.status)}}>
                                {task.status}
                              </span>
                            )}
                            {task.priority && (
                              <span style={{...styles.taskBadge, ...getPriorityColor(task.priority)}}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        <p style={styles.taskDescription}>
                          {task.description || 'No description provided'}
                        </p>
                        <div style={styles.taskFooter}>
                          {task.assignee_id && (
                            <span style={styles.assignee}>
                              👤 {getUserName(task.assignee_id)}
                            </span>
                          )}
                          {task.due_date && (
                            <span style={styles.dueDate}>
                              📅 Due: {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
  dashboardLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '32px',
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  chartSection: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '24px',
  },
  tasksSection: {
    backgroundColor: '#F4F5F7',
    borderRadius: '8px',
    padding: '24px',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 16px 0',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statColor: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#172B4D',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6B778C',
  },
  tasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  taskItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    padding: '16px',
    border: '1px solid #DFE1E6',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  taskTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
    flex: 1,
  },
  taskBadges: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
    marginLeft: '8px',
  },
  taskBadge: {
    fontSize: '10px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: '12px',
    color: '#6B778C',
    lineHeight: '16px',
    margin: '0 0 8px 0',
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '11px',
    color: '#6B778C',
  },
  assignee: {
    fontSize: '11px',
    color: '#6B778C',
  },
  dueDate: {
    fontSize: '11px',
    color: '#6B778C',
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
    
    @media (max-width: 768px) {
      .dashboardLayout {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProjectTaskActivityViewer;