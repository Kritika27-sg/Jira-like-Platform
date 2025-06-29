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
    // Fetch projects
    fetch('http://localhost:8000/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
    })
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(() => {});

    // Fetch users/developers for assignment
    fetch('http://localhost:8000/users', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setUsers(data);
      })
      .catch(error => {
        setUsers([]); // Set empty array on error
      });
  }, []);

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
      
      if (!res.ok) throw new Error('Failed to create task');
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
          <Link to="/tasks">
            <button 
              className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
              title="Back to Tasks"
            >
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              ➕ Create New Task
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Add a new task to your project and assign it to a team member
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 border-b border-white/20 p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Task Details</h2>
            <p className="text-gray-600">
              Fill in the information below to create your task
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Project Selection */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-lg">📁</span>
                Project *
              </label>
              <select
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60"
              >
                <option value="">Select a project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Task Title */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-lg">📝</span>
                Task Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60"
                placeholder="Enter a descriptive task title"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-lg">📄</span>
                Description
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none disabled:opacity-60"
                rows="4"
                placeholder="Provide additional details about the task (optional)"
              />
            </div>

            {/* Assignee */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-lg">👤</span>
                Assign to Developer
              </label>
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60"
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
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <span className="text-lg">🏷️</span>
                Status *
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-60"
              >
                <option value="To Do">{getStatusIcon('To Do')} To Do</option>
                <option value="In Progress">{getStatusIcon('In Progress')} In Progress</option>
                <option value="Done">{getStatusIcon('Done')} Done</option>
              </select>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 justify-end pt-6 border-t border-white/20">
              <Link to="/tasks">
                <button 
                  type="button" 
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 hover:scale-105"
                >
                  Cancel
                </button>
              </Link>
              <button 
                type="submit" 
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  loading 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="text-lg">➕</span>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/90 rounded-3xl border border-white/30 shadow-2xl max-w-md w-full text-center p-8 animate-pulse">
            <div className="text-6xl mb-6">✅</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Task Created Successfully!</h3>
            <p className="text-gray-600 mb-2">
              Your task has been created and added to the project.
              {assigneeId && " The assigned developer will be notified."}
            </p>
            <p className="text-sm text-gray-500 mb-6 italic">
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