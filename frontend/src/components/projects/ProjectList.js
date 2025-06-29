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
  const [selectedProject, setSelectedProject] = useState(null);
  const [updateForm, setUpdateForm] = useState({ name: '', description: '' });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
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
              Loading projects...
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
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            📋 Projects
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {!projects.length ? (
          <div className="text-center py-16">
            <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-12 max-w-2xl mx-auto">
              <div className="text-6xl mb-6">📋</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No projects found</h3>
              <p className="text-lg text-gray-600 mb-8">
                Get started by creating your first project and unlock your team's potential
              </p>
              {(user.role === 'Admin' || user.role === 'Project Manager') && (
                <Link to="/projects/new">
                  <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    ➕ Create New Project
                  </button>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Action Buttons */}
            {(user.role === 'Admin' || user.role === 'Project Manager') && (
              <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Project Actions</h3>
                <div className="flex flex-wrap gap-4">
                  <Link to="/projects/new">
                    <button className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group">
                      <span className="text-lg group-hover:scale-110 transition-transform duration-200">➕</span>
                      Create New Project
                    </button>
                  </Link>
                  <button 
                    onClick={openUpdateModal}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">✏️</span>
                    Update Project
                  </button>
                  <button 
                    onClick={openDeleteModal}
                    className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 group"
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
                  className="group backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
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
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500">Online</span>
                    </div>
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm shadow-lg group-hover:scale-110 transition-transform duration-200">
                      📋
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/90 rounded-3xl border border-white/30 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-white/20">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Delete Project</h3>
              <p className="text-gray-600">
                Select a project to delete. This action cannot be undone.
              </p>
            </div>
            
            <div className="p-8 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedProject?.id === project.id
                        ? 'border-red-500 bg-red-50/80 shadow-lg scale-105'
                        : 'border-gray-200 bg-white/50 hover:bg-white/80 hover:border-gray-300'
                    }`}
                    onClick={() => selectProjectForDelete(project)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-800">{project.name}</h4>
                      {selectedProject?.id === project.id && (
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {project.description || 'No description'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 border-t border-white/20 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProject(null);
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(selectedProject.id)}
                disabled={!selectedProject}
                className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 ${
                  selectedProject
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:shadow-lg hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="backdrop-blur-md bg-white/90 rounded-3xl border border-white/30 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-8 border-b border-white/20">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Update Project</h3>
              <p className="text-gray-600">
                {!selectedProject ? 'Select a project to update' : 'Update project details'}
              </p>
            </div>

            <div className="p-8 max-h-96 overflow-y-auto">
              {!selectedProject ? (
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border-2 border-gray-200 bg-white/50 hover:bg-white/80 hover:border-blue-300 cursor-pointer transition-all duration-200 hover:scale-105"
                      onClick={() => selectProjectForUpdate(project)}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-gray-800">{project.name}</h4>
                        <div className="text-blue-500">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <form onSubmit={handleUpdateProject} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={updateForm.name}
                      onChange={(e) => setUpdateForm({...updateForm, name: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                      placeholder="Enter project name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={updateForm.description}
                      onChange={(e) => setUpdateForm({...updateForm, description: e.target.value})}
                      className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="4"
                      placeholder="Enter project description"
                    />
                  </div>
                </form>
              )}
            </div>

            <div className="p-8 border-t border-white/20 flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedProject(null);
                  setUpdateForm({ name: '', description: '' });
                }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
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