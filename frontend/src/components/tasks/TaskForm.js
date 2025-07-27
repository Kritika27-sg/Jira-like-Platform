import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [projectId, setProjectId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchDependencies = async () => {
      const token = localStorage.getItem('jira-token');
      if (!token) {
        navigate('/login'); // Redirect if no token
        return;
      }

      // Fetch projects
      try {
        const resProjects = await fetch('http://localhost:8000/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resProjects.ok) throw new Error('Failed to fetch projects');
        const dataProjects = await resProjects.json();
        setProjects(dataProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
        // alert("Error fetching projects: " + error.message); // Commented to avoid multiple alerts
      }

      // Fetch users/developers for assignment
      try {
        const resUsers = await fetch('http://localhost:8000/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resUsers.ok) throw new Error(`HTTP error! status: ${resUsers.status}`);
        const dataUsers = await resUsers.json();
        setUsers(dataUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]); // Set empty array on error
        // alert("Error fetching users: " + error.message); // Commented to avoid multiple alerts
      }
    };

    fetchDependencies();
  }, [navigate]); // Add navigate to dependency array

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert('Choose a project');
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title,
        description,
        status,
        project_id: parseInt(projectId)
      };

      // Add assignee if selected
      if (assigneeId) {
        taskData.assignee_id = parseInt(assigneeId);
      }

      const res = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const errorDetail = await res.json();
        throw new Error(errorDetail.detail || 'Failed to create task');
      }

      await res.json();

      setShowSuccessModal(true);

      // Auto-redirect after 2 seconds
      setTimeout(() => {
        navigate('/tasks');
      }, 2000);

    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigate('/tasks');
  };

  // Filter users to show only developers
  const developers = users.filter(user =>
    user.role && user.role.toLowerCase() === 'developer'
  );

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
          <div className="flex items-center py-3 sm:py-4">
            <Link to="/tasks">
              <button
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 hover:shadow-lg group text-white"
                title="Back to Tasks"
              >
                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ➕ Create New Task
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Add a new task to your project and assign it to a team member
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 pt-20 sm:pt-24 p-6 flex justify-center items-start">
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 max-w-4xl w-full">
          {/* Form Header */}
          <div className="p-4 rounded-xl mb-6"> {/* Removed bg-gradient from here */}
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Task Details</h2>
            <p className="text-gray-300">
              Fill in the information below to create your task
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="text-lg">📁</span>
                Project <span className="text-red-400">*</span>
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-60"
              >
                <option value="">Select a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="text-lg">📝</span>
                Task Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-60"
                placeholder="Enter a descriptive task title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="text-lg">📄</span>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none disabled:opacity-60"
                rows="4"
                placeholder="Provide additional details about the task (optional)"
              />
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="text-lg">👤</span>
                Assign to Developer
              </label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-60"
              >
                <option value="">Select a developer (optional)</option>
                {developers.length > 0 ? (
                  developers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.name || user.username}
                      {user.email && ` (${user.email})`}
                    </option>
                  ))
                ) : (
                  <option disabled>No developers available</option>
                )}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white/80">
                <span className="text-lg">🏷️</span>
                Status <span className="text-red-400">*</span>
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 disabled:opacity-60"
              >
                <option value="To Do">{getStatusIcon('To Do')} To Do</option>
                <option value="In Progress">{getStatusIcon('In Progress')} In Progress</option>
                <option value="Done">{getStatusIcon('Done')} Done</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t border-white/10">
              <Link to="/tasks">
                <button
                  type="button"
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl shadow-lg transition-all duration-300 group ${
                  loading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">➕</span>
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-md w-full text-center p-8 transform scale-95 animate-scale-in">
            <div className="text-6xl mb-6 text-green-400 animate-bounce-subtle">✅</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">Task Created Successfully!</h3>
            <p className="text-gray-300 mb-2">
              Your task has been created and added to the project.
              {assigneeId && " The assigned developer will be notified."}
            </p>
            <p className="text-sm text-gray-400 mb-6 italic">
              Redirecting you back to the task list...
            </p>
            <button
              onClick={handleSuccessModalClose}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Go to Tasks
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskForm;