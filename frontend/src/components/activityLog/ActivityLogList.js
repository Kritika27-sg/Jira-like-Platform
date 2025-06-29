import React, { useEffect, useState } from 'react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-12">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-medium bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Projects view
  if (view === 'projects') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
            }}
          />
          <div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
            style={{
              transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
            }}
          />
        </div>

        {/* Header */}
        <header className="relative backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
          <div className="px-6 py-4 flex items-center gap-4">
            <button 
              onClick={() => window.history.back()} 
              className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Project Activity Dashboard
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📋 Select a Project</h2>
              <p className="text-gray-600">
                Choose a project to view its tasks and progress analytics
              </p>
            </div>
            
            {!projects.length ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🏗️</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No projects available</h3>
                <p className="text-lg text-gray-600">
                  Contact your project manager for access to projects.
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                    onClick={() => handleProjectClick(project)}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200 line-clamp-2">
                        {project.name}
                      </h3>
                      <div className="ml-4 flex-shrink-0">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg">
                          Active
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-200 mb-4 line-clamp-3">
                      {project.description || 'No description provided'}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">
                          {projectTaskCounts[project.id] || 0} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-medium text-sm">
                        <span>View Progress</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Tasks view with pie chart
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
          style={{
            transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
          }}
        />
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="px-6 py-4 flex items-center gap-4">
          <button
            onClick={handleBackToProjects}
            className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
            title="Back to Projects"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            📋 Tasks - {selectedProject?.name}
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-white/20">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">📊 Project Overview</h2>
            <p className="text-gray-600">
              {selectedProject?.description || 'No description provided'}
            </p>
          </div>
          
          {!tasks.length ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No tasks found</h3>
              <p className="text-lg text-gray-600">
                Tasks will appear here when they are created for this project.
              </p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Pie Chart Section */}
                <div className="backdrop-blur-sm bg-white/40 rounded-2xl p-6 border border-white/30">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    Completion Status
                  </h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
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
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {getCompletionData().map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white/30">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getColorForStatus(item.name) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold text-gray-800">{item.value}</div>
                          <div className="text-sm text-gray-600 truncate">{item.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks List Section */}
                <div className="backdrop-blur-sm bg-white/40 rounded-2xl p-6 border border-white/30">
                  <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    📋 All Tasks ({tasks.length})
                  </h3>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {tasks.map((task, index) => (
                      <div 
                        key={task.id} 
                        className="bg-white/60 rounded-xl p-4 border border-white/30 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        style={{
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-gray-800 line-clamp-2 flex-1 mr-2">
                            {task.title}
                          </h4>
                          <div className="flex gap-2 flex-shrink-0">
                            {task.status && (
                              <span 
                                className="px-2 py-1 text-xs font-semibold rounded-full"
                                style={getStatusColor(task.status)}
                              >
                                {task.status}
                              </span>
                            )}
                            {task.priority && (
                              <span 
                                className="px-2 py-1 text-xs font-semibold rounded-full"
                                style={getPriorityColor(task.priority)}
                              >
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {task.description || 'No description provided'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {task.assignee_id && (
                            <span className="flex items-center gap-1">
                              👤 {getUserName(task.assignee_id)}
                            </span>
                          )}
                          {task.due_date && (
                            <span className="flex items-center gap-1">
                              📅 {new Date(task.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectTaskActivityViewer; 