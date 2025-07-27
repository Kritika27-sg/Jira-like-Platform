import React, { useEffect, useState } from 'react';
//import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const TaskList = () => {
  //const { user } = useAuth(); // Keeping this commented as in original
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    title: '',
    description: '',
    status: '',
    assignee_id: ''
  });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) {
         if (res.status === 401) {
          navigate('/login'); // Redirect to login on unauthorized
          return;
        }
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      // alert(error.message); // Commented to avoid multiple alerts on initial load for unrelated errors
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
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
      const updateData = {
        title: updateForm.title.trim(),
        description: updateForm.description.trim(),
        status: updateForm.status,
        project_id: selectedTask.project_id
      };

      if (updateForm.assignee_id) {
        updateData.assignee_id = parseInt(updateForm.assignee_id);
      }

      const res = await fetch(`http://localhost:8000/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(`Failed to update task: ${res.status} ${res.statusText} - ${errorData}`);
      }

      const updatedTask = await res.json();
      setTasks(tasks.map(t =>
        t.id === selectedTask.id ? updatedTask : t
      ));

      setShowUpdateModal(false);
      setSelectedTask(null);
      setUpdateForm({ title: '', description: '', status: '', assignee_id: '' });
      alert('Task updated successfully!');
    } catch (error) {
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
      status: task.status,
      assignee_id: task.assignee_id || ''
    });
  };

  // Filter users to show only developers
  const developers = users.filter(user =>
    user.role && user.role.toLowerCase() === 'developer'
  );

  // Get assignee name for display
  const getAssigneeName = (assigneeId) => {
    if (!assigneeId) return null;
    const assignee = users.find(user => user.id === assigneeId);
    return assignee ? (assignee.full_name || assignee.name || assignee.username) : 'Unknown User';
  };

  // Get project name for display
  const getProjectName = (projectId) => {
    if (!projectId) return 'No Project';
    const project = projects.find(project => project.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'to do':
        return 'from-gray-600 to-gray-700'; // Darker gray for contrast
      case 'in progress':
        return 'from-blue-600 to-cyan-700';
      case 'done':
        return 'from-green-600 to-emerald-700';
      default:
        return 'from-gray-600 to-gray-700';
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
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchTasks(),
        fetchUsers(),
        fetchProjects()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden">
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

        <div className="relative z-10 text-center bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-12 max-w-md w-full">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Loading tasks...
          </p>
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
          <div className="flex items-center py-3 sm:py-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 hover:shadow-lg group text-white"
              title="Back to Dashboard"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="ml-4 text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ✅ Tasks
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 pt-20 sm:pt-24 p-6 flex justify-center items-start">
        {!tasks.length ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12 max-w-2xl w-full">
            <div className="text-6xl mb-6 transform -rotate-12 animate-float text-white/80">✅</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">No tasks found</h3>
            <p className="text-lg text-gray-300 mb-8">
              Get started by creating your first task and boost your productivity
            </p>
            {/* Conditional rendering for user role (if useAuth was active)
            {(user.role === 'Admin' || user.role === 'Project Manager' || user.role === 'Developer') && (
            */}
              <Link to="/tasks/new">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1">
                  ➕ Create New Task
                </button>
              </Link>
            {/* )} */}
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-7xl">
            {/* Action Buttons */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">Task Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link to="/tasks/new">
                  <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1">
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">➕</span>
                    Create New Task
                  </button>
                </Link>
                <button
                  onClick={openUpdateModal}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">✏️</span>
                  Update Task
                </button>
                <button
                  onClick={openDeleteModal}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform duration-200">🗑️</span>
                  Delete Task
                </button>
              </div>
            </div>

            {/* Tasks Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200 line-clamp-2">
                      {task.title}
                    </h3>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`px-3 py-1 bg-gradient-to-r ${getStatusColor(task.status)} text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg`}>
                        {getStatusIcon(task.status)} {task.status}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-200 mb-4 line-clamp-3">
                    {task.description || 'No description provided'}
                  </p>

                  <div className="space-y-3">
                    {/* Project Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm text-gray-400">
                        📁 {getProjectName(task.project_id)}
                      </span>
                    </div>

                    {/* Assignee Info */}
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-400">
                        👤 {task.assignee_id ? getAssigneeName(task.assignee_id) : 'Unassigned'}
                      </span>
                    </div>

                    {/* Priority and ID */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.priority && (
                          <>
                            <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                            <span className="text-sm text-gray-400">
                              {getPriorityIcon(task.priority)} {task.priority}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs shadow-lg group-hover:scale-110 transition-transform duration-200">
                        #{task.id}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transform scale-95 animate-scale-in">
            <div className="p-8 border-b border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Delete Task</h3>
              <p className="text-gray-300">
                Select a task to delete. This action cannot be undone.
              </p>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedTask?.id === task.id
                        ? 'border-red-600 bg-red-900/30 shadow-lg scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                    onClick={() => selectTaskForDelete(task)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-white">{task.title}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 bg-gradient-to-r ${getStatusColor(task.status)} text-white text-xs font-semibold rounded-full`}>
                          {task.status}
                        </span>
                        {selectedTask?.id === task.id && (
                          <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">
                      {task.description || 'No description'} • Project: {getProjectName(task.project_id)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t border-white/10 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTask(null);
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTask(selectedTask.id)}
                disabled={!selectedTask}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  selectedTask
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transform scale-95 animate-scale-in">
            <div className="p-8 border-b border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Update Task</h3>
              <p className="text-gray-300">
                {!selectedTask ? 'Select a task to update' : 'Update task details'}
              </p>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              {!selectedTask ? (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => selectTaskForUpdate(task)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-white">{task.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 bg-gradient-to-r ${getStatusColor(task.status)} text-white text-xs font-semibold rounded-full`}>
                            {task.status}
                          </span>
                          <div className="text-blue-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">
                        {task.description || 'No description'} • Project: {getProjectName(task.project_id)}
                        {task.assignee_id && ` • Assigned to: ${getAssigneeName(task.assignee_id)}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateTask} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={updateForm.title}
                      onChange={(e) => setUpdateForm({...updateForm, title: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      required
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Description
                    </label>
                    <textarea
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                      rows="4"
                      placeholder="Enter task description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      👤 Assign to Developer
                    </label>
                    <select
                      value={updateForm.assignee_id}
                      onChange={(e) => setUpdateForm({...updateForm, assignee_id: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
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
                    <p className="text-xs text-gray-400 mt-1">
                      Leave empty to unassign the task
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Status
                    </label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>
                </form>
              )}
            </div>

            <div className="p-8 border-t border-white/10 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedTask(null);
                  setUpdateForm({ title: '', description: '', status: '', assignee_id: '' });
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
              {selectedTask && (
                <button
                  onClick={handleUpdateTask}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Update Task
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;