import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const ProjectList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: '', description: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Project icons mapping
  const projectIcons = [
    '🚀', '💻', '📱', '🎨', '⚡', '🔧', '📊', '🌟', 
    '🎯', '💡', '🔥', '⭐', '🎪', '🎭', '🎨', '🏆',
    '💎', '🌈', '🎊', '🎉', '🦄', '🌙', '☀️', '🌸'
  ];

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Function to get consistent icon for each project
  const getProjectIcon = (projectId, projectName) => {
    const index = (projectId + projectName.length) % projectIcons.length;
    return projectIcons[index];
  };

  // Function to get project status color
  const getStatusColor = (project) => {
    // You can customize this logic based on your project status
    const colors = [
      'from-green-400 to-emerald-500',
      'from-blue-400 to-cyan-500',
      'from-purple-400 to-pink-500',
      'from-orange-400 to-red-500',
      'from-indigo-400 to-purple-500'
    ];
    return colors[project.id % colors.length];
  };

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch projects');
      }
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:8000/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete project');

      setProjects(projects.filter(p => p.id !== projectId));
      setShowDeleteModal(false);
      setSelectedProject(null);
      alert('Project deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/projects/${selectedProject.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify(updateForm),
      });
      if (!res.ok) throw new Error('Failed to update project');

      const updatedProject = await res.json();
      setProjects(projects.map(p =>
        p.id === selectedProject.id ? updatedProject : p
      ));

      setShowUpdateModal(false);
      setSelectedProject(null);
      setUpdateForm({ name: '', description: '' });
      alert('Project updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const openUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const openDetailModal = (project) => {
    setSelectedProject(project);
    setShowDetailModal(true);
  };

  const selectProjectForDelete = (project) => {
    setSelectedProject(project);
  };

  const selectProjectForUpdate = (project) => {
    setSelectedProject(project);
    setUpdateForm({
      name: project.name,
      description: project.description || ''
    });
  };

  useEffect(() => {
    fetchProjects();
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
            Loading projects...
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
              📋 Projects
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 pt-20 sm:pt-24 p-6 flex justify-center items-start">
        {!projects.length ? (
          <div className="text-center py-16 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12 max-w-2xl w-full">
            <div className="text-6xl mb-6 transform -rotate-12 animate-float text-white/80">📋</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">No projects found</h3>
            <p className="text-lg text-gray-300 mb-8">
              Get started by creating your first project and unlock your team's potential
            </p>
            {(user.role === 'Admin' || user.role === 'Project Manager') && (
              <Link to="/projects/new">
                <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 transform hover:-translate-y-1">
                  ➕ Create New Project
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8 w-full max-w-7xl">
            {/* Action Buttons */}
            {(user.role === 'Admin' || user.role === 'Project Manager') && (
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">Project Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Link to="/projects/new">
                    <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">➕</span>
                      Create New Project
                    </button>
                  </Link>
                  <button
                    onClick={openUpdateModal}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">✏️</span>
                    Update Project
                  </button>
                  <button
                    onClick={openDeleteModal}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group transform hover:-translate-y-1"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">🗑️</span>
                    Delete Project
                  </button>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer relative overflow-hidden"
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                  onClick={() => openDetailModal(project)}
                >
                  {/* Background Gradient */}
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${getStatusColor(project)} opacity-20 rounded-full blur-2xl group-hover:opacity-30 transition-opacity duration-300`}></div>
                  
                  {/* Project Icon */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor(project)} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {getProjectIcon(project.id, project.name)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200 line-clamp-1">
                          {project.name}
                        </h3>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg">
                        Active
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-200 mb-6 line-clamp-3 min-h-[4.5rem]">
                    {project.description || 'No description provided'}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-400">Online</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="text-xs text-gray-400">View Details</span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      {showDetailModal && selectedProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${getStatusColor(selectedProject)} rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg`}>
                    {getProjectIcon(selectedProject.id, selectedProject.name)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      {selectedProject.name}
                    </h3>
                    <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-semibold rounded-full uppercase tracking-wider shadow-lg mt-2 inline-block">
                      Active Project
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedProject(null);
                  }}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                {/* Project Description */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    📝 Project Description
                  </h4>
                  <p className="text-gray-300 leading-relaxed text-lg">
                    {selectedProject.description || 'No description provided for this project.'}
                  </p>
                </div>

                {/* Project Stats */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                      📊
                    </div>
                    <h5 className="text-lg font-semibold text-white mb-2">Project Status</h5>
                    <p className="text-green-400 font-medium">Active & Running</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                      👥
                    </div>
                    <h5 className="text-lg font-semibold text-white mb-2">Team Size</h5>
                    <p className="text-blue-400 font-medium">Multiple Members</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white mb-4 mx-auto">
                      ⏱️
                    </div>
                    <h5 className="text-lg font-semibold text-white mb-2">Timeline</h5>
                    <p className="text-orange-400 font-medium">In Progress</p>
                  </div>
                </div>


                {/* Quick Actions */}
                <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
                  <h4 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    ⚡ Quick Actions
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    <button 
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 hover:scale-105"
                      onClick={() => {
                        setShowDetailModal(false);
                        // Navigate to tasks page with project filter
                        navigate(`/tasks?project=${selectedProject.id}`);
                      }}
                    >
                      <span>📋</span>
                      View Tasks
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Delete Project</h3>
              <p className="text-gray-300">
                Select a project to delete. This action cannot be undone.
              </p>
            </div>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedProject?.id === project.id
                        ? 'border-red-500 bg-red-900/30 shadow-lg scale-[1.02]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                    onClick={() => selectProjectForDelete(project)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(project)} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}>
                          {getProjectIcon(project.id, project.name)}
                        </div>
                        <h4 className="font-semibold text-white/90">{project.name}</h4>
                      </div>
                      {selectedProject?.id === project.id && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-md">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 pl-13">
                      {project.description || 'No description'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 sm:p-8 border-t border-white/10 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                disabled={!selectedProject}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  selectedProject
                    ? 'bg-gradient-to-r from-red-600 to-red-800 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 sm:p-8 border-b border-white/10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">Update Project</h3>
              <p className="text-gray-300">
                {!selectedProject ? 'Select a project to update' : 'Update project details'}
              </p>
            </div>

            <div className="p-6 sm:p-8 flex-1 overflow-y-auto custom-scrollbar">
              {!selectedProject ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border-2 border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/50 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                      onClick={() => selectProjectForUpdate(project)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${getStatusColor(project)} rounded-lg flex items-center justify-center text-white text-lg shadow-lg`}>
                            {getProjectIcon(project.id, project.name)}
                          </div>
                          <h4 className="font-semibold text-white/90">{project.name}</h4>
                        </div>
                        <div className="text-blue-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 pl-13">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                      required
                      placeholder="Enter project name"
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
                      placeholder="Enter project description"
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="p-6 sm:p-8 border-t border-white/10 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedProject(null);
                  setUpdateForm({ name: '', description: '' });
                }}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-xl transition-all duration-200 border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
              {selectedProject && (
                <button
                  onClick={handleUpdateProject}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Update Project
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;