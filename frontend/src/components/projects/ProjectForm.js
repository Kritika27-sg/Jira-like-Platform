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
            Creating project...
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
              onClick={handleBackClick}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 hover:shadow-lg group text-white"
              title="Back to Projects"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="ml-4">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                ➕ Create New Project
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Set up a new project to organize your work
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 pt-20 sm:pt-24 p-6 flex flex-col items-center justify-start"> {/* Use flex-col and items-center */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 max-w-4xl w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alert Messages */}
            {errorMsg && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-900/30 border border-red-700/50 backdrop-blur-sm text-red-200">
                <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-red-300">{errorMsg}</p>
                </div>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-900/30 border border-green-700/50 backdrop-blur-sm text-green-200">
                <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold">Success</p>
                  <p className="text-green-300">{successMsg}</p>
                </div>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Project Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200"
                  placeholder="Enter project name"
                  required
                  maxLength={255}
                />
                <p className="text-xs text-gray-400 mt-2">
                  Choose a clear, descriptive name for your project
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-200 resize-none"
                  placeholder="Enter project description (optional)"
                  maxLength={1000}
                  rows="4"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-400">
                    Provide additional context about the project's goals and scope
                  </p>
                  <p className="text-xs text-gray-400">
                    {description.length}/1000
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
              <button
                type="button"
                onClick={handleBackClick}
                disabled={loading}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white/70 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg group"
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

        {/* Tips Section (below the form) */}
        <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg p-6 max-w-4xl w-full"> {/* Added w-full and max-w-4xl */}
          <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span className="text-xl">💡</span>
            Tips for Creating a Great Project
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Use descriptive names that clearly identify the project's purpose</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Include key objectives and scope in the description</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Efficiently update details even after creation</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-purple-400 font-bold">•</span>
              <span>Set up milestones and deadlines to track progress</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProjectForm;