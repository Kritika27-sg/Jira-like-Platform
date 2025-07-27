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
      return 'from-green-400 to-emerald-500';
    }
    if (statusLower?.includes('progress') || statusLower?.includes('active')) {
      return 'from-blue-400 to-blue-500';
    }
    if (statusLower?.includes('pending') || statusLower?.includes('todo')) {
      return 'from-orange-400 to-orange-500';
    }
    return 'from-gray-400 to-gray-500';
  };

  const getPriorityColor = (priority) => {
    const priorityLower = priority?.toLowerCase();
    if (priorityLower?.includes('high') || priorityLower?.includes('urgent')) {
      return 'from-red-400 to-red-500';
    }
    if (priorityLower?.includes('medium')) {
      return 'from-orange-400 to-orange-500';
    }
    if (priorityLower?.includes('low')) {
      return 'from-green-400 to-green-500';
    }
    return 'from-gray-400 to-gray-500';
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
    if (statusLower.includes('completed') || statusLower.includes('done')) return '#10B981';
    if (statusLower.includes('progress') || statusLower.includes('active')) return '#3B82F6';
    if (statusLower.includes('pending') || statusLower.includes('todo')) return '#F59E0B';
    return '#6B7280';
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col overflow-hidden">
        {/* Animated Cursor */}
        <div
          className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
          }}
        />

        {/* Enhanced Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        </div>

        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="w-16 h-16 border-4 border-purple-200/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
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
      <div className="min-h-screen bg-black flex flex-col overflow-hidden">
        {/* Animated Cursor */}
        <div
          className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
          }}
        />

        {/* Enhanced Background */}
        <div className="fixed inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>

          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
        </div>

        {/* Header */}
        <header className="fixed w-full z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4 gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 hover:shadow-md group"
                title="Back to Dashboard"
              >
                <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Project Activity
                </h1>
                <p className="text-sm text-white/60 mt-1">
                  View project progress and analytics
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Padded to push content below the fixed header */}
        <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto relative z-10">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 max-w-7xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">📋 Select a Project</h2>
              <p className="text-white/70">
                Choose a project to view its tasks and progress analytics
              </p>
            </div>

            {error && (
              <div className="mb-8 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="text-red-300 font-medium">{error}</p>
                    <button
                      onClick={fetchProjects}
                      className="mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!projects.length ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">🏗️</div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">No projects available</h3>
                <p className="text-lg text-white/60">
                  Contact your project manager for access to projects.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {projects.map((project, index) => (
                  <div
                    key={project.id}
                    className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer flex flex-col"
                    onClick={() => handleProjectClick(project)}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-200 line-clamp-2">
                        {project.name}
                      </h3>
                      <div className="ml-4 flex-shrink-0">
                        <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg">
                          Active
                        </span>
                      </div>
                    </div>

                    <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-200 mb-4 line-clamp-3 flex-grow">
                      {project.description || 'No description provided'}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white/80">
                          {projectTaskCounts[project.id] || 0} tasks
                        </span>
                      </div>
                      <button className="flex items-center gap-2 px-3 py-1 bg-transparent border border-white/20 text-white/70 rounded-lg hover:border-white hover:text-white transition-all duration-200">
                        <span>View Progress</span>
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
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
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Animated Cursor */}
      <div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
        }}
      />

      {/* Enhanced Background */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      </div>

      {/* Header */}
      <header className="fixed w-full z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4 gap-4">
            <button
              onClick={handleBackToProjects}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 hover:shadow-md group"
              title="Back to Projects"
            >
              <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                📋 Tasks - {selectedProject?.name}
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Project analytics and task overview
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Padded to push content below the fixed header */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto relative z-10">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden max-w-7xl mx-auto">
          <div className="p-8 border-b border-white/10">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">📊 Project Overview</h2>
            <p className="text-white/70">
              {selectedProject?.description || 'No description provided'}
            </p>
          </div>

          {error && (
            <div className="m-8 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-300 font-medium">{error}</p>
                  <button
                    onClick={() => fetchTasks(selectedProject?.id)}
                    className="mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          )}

          {!tasks.length ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-6">📋</div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">No tasks found</h3>
              <p className="text-lg text-white/60">
                Tasks will appear here when they are created for this project.
              </p>
            </div>
          ) : (
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pie Chart Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    📊 Completion Status
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
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Legend
                          wrapperStyle={{
                            color: 'white'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {getCompletionData().map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getColorForStatus(item.name) }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-lg font-bold text-white">{item.value}</div>
                          <div className="text-sm text-white/70 truncate">{item.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tasks List Section */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    📋 All Tasks ({tasks.length})
                  </h3>
                  <div className="grid gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {tasks.map((task, index) => (
                      <div
                        key={task.id}
                        className="bg-white/10 rounded-xl p-4 border border-white/20 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] hover:bg-white/15"
                        style={{
                          animationDelay: `${index * 0.05}s`
                        }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold text-white line-clamp-2 flex-1 mr-2 text-base">
                            {task.title}
                          </h4>
                          <div className="flex gap-2 flex-shrink-0">
                            {task.status && (
                              <span className={`px-2 py-0.5 bg-gradient-to-r ${getStatusColor(task.status)} text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg`}>
                                {task.status}
                              </span>
                            )}
                            {task.priority && (
                              <span className={`px-2 py-0.5 bg-gradient-to-r ${getPriorityColor(task.priority)} text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg`}>
                                {task.priority}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-white/70 text-sm mb-3 line-clamp-2">
                          {task.description || 'No description provided'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-white/60">
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