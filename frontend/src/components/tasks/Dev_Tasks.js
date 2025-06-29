import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dev_Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all'); // all, to do, in progress, done
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'to do':
        return 'from-gray-400 to-gray-500';
      case 'in progress':
        return 'from-blue-400 to-blue-500';
      case 'done':
        return 'from-green-400 to-emerald-500';
      default:
        return 'from-gray-400 to-gray-500';
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
              Loading your tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <Link 
            to="/dashboard" 
            className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              My Tasks
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage and track your assigned tasks
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-8 backdrop-blur-sm bg-red-50/80 border border-red-200/50 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-800 font-medium">{error}</p>
                <button 
                  onClick={fetchMyTasks}
                  className="mt-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {stats.total}
            </div>
            <div className="text-sm font-medium text-gray-600">Total Tasks</div>
          </div>
          <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent mb-2">
              {stats.todo}
            </div>
            <div className="text-sm font-medium text-gray-600">📋 To Do</div>
          </div>
          <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent mb-2">
              {stats.inProgress}
            </div>
            <div className="text-sm font-medium text-gray-600">⚡ In Progress</div>
          </div>
          <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent mb-2">
              {stats.done}
            </div>
            <div className="text-sm font-medium text-gray-600">✅ Completed</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                filter === 'all' 
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              All Tasks ({stats.total})
            </button>
            <button 
              onClick={() => setFilter('todo')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                filter === 'todo' 
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              📋 To Do ({stats.todo})
            </button>
            <button 
              onClick={() => setFilter('inprogress')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                filter === 'inprogress' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              ⚡ In Progress ({stats.inProgress})
            </button>
            <button 
              onClick={() => setFilter('done')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                filter === 'done' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:bg-white/50'
              }`}
            >
              ✅ Done ({stats.done})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">
                {filter === 'all' ? '📋' : 
                 filter === 'todo' ? '📋' :
                 filter === 'inprogress' ? '⚡' : '✅'}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {filter === 'all' ? 'No tasks assigned yet' :
                 filter === 'todo' ? 'No tasks to do' :
                 filter === 'inprogress' ? 'No tasks in progress' :
                 'No completed tasks'}
              </h3>
              <p className="text-lg text-gray-600">
                {filter === 'all' 
                  ? 'Tasks assigned to you by project managers will appear here.'
                  : `You don't have any ${filter === 'todo' ? 'pending' : filter === 'inprogress' ? 'active' : 'completed'} tasks right now.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map((task, index) => (
              <div 
                key={task.id}
                className="group backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200 line-clamp-2">
                    {task.title}
                  </h3>
                  <div className="ml-4 flex-shrink-0">
                    <span className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(task.status)} text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg`}>
                      {getStatusIcon(task.status)} {task.status}
                    </span>
                  </div>
                </div>
                
                {task.description && (
                  <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-200 mb-4 line-clamp-3">
                    {task.description}
                  </p>
                )}

                <div className="space-y-3 mb-4">
                  {/* Project Info */}
                  {task.project_id && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        📁 {getProjectName(task.project_id)}
                      </span>
                    </div>
                  )}

                  {/* Priority and ID */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {task.priority && (
                        <>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <span className="text-sm text-gray-600">
                            {getPriorityIcon(task.priority)} {task.priority}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-lg group-hover:scale-110 transition-transform duration-200">
                      #{task.id}
                    </div>
                  </div>

                  {/* Created Date */}
                  {task.created_at && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        📅 {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Update Section */}
                <div className="pt-4 border-t border-gray-200/50">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Update Status:
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="w-full px-4 py-2 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm font-medium"
                  >
                    <option value="To Do">📋 To Do</option>
                    <option value="In Progress">⚡ In Progress</option>
                    <option value="Done">✅ Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dev_Tasks;