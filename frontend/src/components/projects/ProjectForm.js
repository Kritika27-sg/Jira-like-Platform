import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim()) {
      setErrorMsg('Project name is required');
      return;
    }

    // Check for token before making request
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('jira-token') ||
                  localStorage.getItem('authToken');
    
    console.log('Token found:', token ? 'Yes' : 'No');
    console.log('Available localStorage keys:', Object.keys(localStorage));
    
    if (!token) {
      setErrorMsg('Authentication required. Please log in again.');
      // Optionally redirect to login after a delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      return;
    }

    setLoading(true);
    try {
      // Updated API endpoint - remove /api/ if router is mounted directly
      const res = await fetch('http://localhost:8000/projects/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          name: name.trim(), 
          description: description.trim() || null 
        }),
      });

      console.log('Response status:', res.status);
      
      if (!res.ok) {
        let errorMessage = 'Failed to create project';
        
        // Handle specific HTTP status codes
        if (res.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
          // Optionally redirect to login
          // navigate('/login');
        } else if (res.status === 403) {
          errorMessage = 'You do not have permission to create projects.';
        } else if (res.status === 422) {
          errorMessage = 'Invalid project data provided.';
        }
        
        try {
          const errorData = await res.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use the default error message
        }
        
        throw new Error(errorMessage);
      }

      const projectData = await res.json();
      console.log('Created project:', projectData);
      
      setSuccessMsg('Project created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      
      setTimeout(() => {
        // Navigate to projects list page
        navigate('/projects');
      }, 1500);
      
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMsg(error.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/projects'); // Navigate back to projects list
  };

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
              Creating project...
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
            onClick={handleBackClick}
            className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
            title="Back to Projects"
          >
            <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              ➕ Create New Project
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Set up a new project to organize your work
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert Messages */}
            {errorMsg && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/80 border border-red-200/50 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-800">Error</p>
                  <p className="text-red-700">{errorMsg}</p>
                </div>
              </div>
            )}
            
            {successMsg && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50/80 border border-green-200/50 backdrop-blur-sm">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Success</p>
                  <p className="text-green-700">{successMsg}</p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
                  placeholder="Enter project name"
                  required
                  maxLength={255}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Choose a clear, descriptive name for your project
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none placeholder-gray-400"
                  placeholder="Enter project description (optional)"
                  maxLength={1000}
                  rows="4"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Provide additional context about the project's goals and scope
                  </p>
                  <p className="text-xs text-gray-400">
                    {description.length}/1000
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50">
              <button
                type="button"
                onClick={handleBackClick}
                disabled={loading}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading || !name.trim()} 
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg group"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">➕</span>
                    Create Project
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 backdrop-blur-sm bg-white/40 rounded-2xl border border-white/20 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Tips for Creating a Great Project
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Use descriptive names that clearly identify the project's purpose</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Include key objectives and scope in the description</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Efficiently update details even after creation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 font-bold">•</span>
              <span>Set up milestones and deadlines to track progress</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectForm;