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
              Loading your tasks...
            </p>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="flex items-center py-3 sm:py-4 gap-4">
            <Link
              to="/dashboard"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200 hover:shadow-md group"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 text-white/70 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                My Tasks
              </h1>
              <p className="text-sm text-white/60 mt-1">
                Manage and track your assigned tasks
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-8 px-4 sm:px-6 lg:px-8 overflow-y-auto relative z-10">
        {error && (
          <div className="mb-8 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-300 font-medium">{error}</p>
                <button
                  onClick={fetchMyTasks}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 max-w-5xl mx-auto"> {/* Added max-w-5xl mx-auto for centralization */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-1">
              {stats.total}
            </div>
            <div className="text-xs font-medium text-white/70">Total Tasks</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-gray-300 bg-clip-text text-transparent mb-1">
              {stats.todo}
            </div>
            <div className="text-xs font-medium text-white/70">📋 To Do</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent mb-1">
              {stats.inProgress}
            </div>
            <div className="text-xs font-medium text-white/70">⚡ In Progress</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-4 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
              {stats.done}
            </div>
            <div className="text-xs font-medium text-white/70">✅ Completed</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg p-1.5 mb-6 max-w-5xl mx-auto"> {/* Added max-w-5xl mx-auto for centralization */}
          <div className="flex flex-wrap gap-1.5 justify-center"> {/* Added justify-center for centering */}
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              All Tasks ({stats.total})
            </button>
            <button
              onClick={() => setFilter('todo')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                filter === 'todo'
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              📋 To Do ({stats.todo})
            </button>
            <button
              onClick={() => setFilter('inprogress')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                filter === 'inprogress'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              ⚡ In Progress ({stats.inProgress})
            </button>
            <button
              onClick={() => setFilter('done')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                filter === 'done'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              ✅ Done ({stats.done})
            </button>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 max-w-xl mx-auto"> {/* Added max-w-xl mx-auto for centralization */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
              <div className="text-5xl mb-4">
                {filter === 'all' ? '📋' :
                  filter === 'todo' ? '📋' :
                    filter === 'inprogress' ? '⚡' : '✅'}
              </div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
                {filter === 'all' ? 'No tasks assigned yet' :
                  filter === 'todo' ? 'No tasks to do' :
                    filter === 'inprogress' ? 'No tasks in progress' :
                    'No completed tasks'}
              </h3>
              <p className="text-base text-white/60">
                {filter === 'all'
                  ? 'Tasks assigned to you by project managers will appear here.'
                  : `You don't have any ${filter === 'todo' ? 'pending' : filter === 'inprogress' ? 'active' : 'completed'} tasks right now.`
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"> {/* Reduced grid columns slightly, added max-w-7xl mx-auto for centralization */}
            {filteredTasks.map((task, index) => (
              <div
                key={task.id}
                className="group bg-white/5 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex flex-col"
                style={{
                  animationDelay: `${index * 0.05}s`
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-white group-hover:to-white transition-all duration-200 line-clamp-2">
                    {task.title}
                  </h3>
                  <div className="ml-3 flex-shrink-0">
                    <span className={`px-2.5 py-0.5 bg-gradient-to-r ${getStatusColor(task.status)} text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg`}>
                      {getStatusIcon(task.status)} {task.status}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/80 transition-colors duration-200 mb-3 line-clamp-3 flex-grow">
                    {task.description}
                  </p>
                )}

                <div className="space-y-2 mb-3 mt-auto">
                  {/* Project Info */}
                  {task.project_id && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                      <span className="text-xs text-white/60">
                        📁 {getProjectName(task.project_id)}
                      </span>
                    </div>
                  )}

                  {/* Priority and ID */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {task.priority && (
                        <>
                          <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                          <span className="text-xs text-white/60">
                            {getPriorityIcon(task.priority)} {task.priority}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center text-white font-semibold text-xs shadow-lg group-hover:scale-110 transition-transform duration-200">
                      #{task.id}
                    </div>
                  </div>

                  {/* Created Date */}
                  {task.created_at && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span className="text-xs text-white/60">
                        📅 {new Date(task.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Update Section */}
                <div className="pt-3 border-t border-white/10">
                  <label className="block text-xs font-medium text-white/80 mb-1.5">
                    Update Status:
                  </label>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="w-full px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-xs font-medium text-white backdrop-blur-xl"
                  >
                    <option value="To Do" className="bg-gray-800 text-white">📋 To Do</option>
                    <option value="In Progress" className="bg-gray-800 text-white">⚡ In Progress</option>
                    <option value="Done" className="bg-gray-800 text-white">✅ Done</option>
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