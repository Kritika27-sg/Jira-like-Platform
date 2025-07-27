import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCommentsForProject, createComment } from '../../api/commentService';

const ProjectCommentSystem = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for subtle parallax effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Fetch projects on component mount
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
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('Error fetching projects:', err);
    }
    setLoading(false);
  };

  // Load comments for selected project
  const loadComments = useCallback(async (projectId) => {
    setLoadingComments(true);
    setError(null);
    try {
      const data = await getCommentsForProject(projectId, localStorage.getItem('jira-token'));
      setComments(data);
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error loading comments:', err);
    }
    setLoadingComments(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle project selection
  const handleProjectSelect = async (project) => {
    setSelectedProject(project);
    setShowCommentForm(false);
    await loadComments(project.id);
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCreating(true);
    setError(null);

    try {
      await createComment(
        { content: newComment, project_id: selectedProject.id },
        localStorage.getItem('jira-token')
      );
      setNewComment('');
      setShowCommentForm(false);
      await loadComments(selectedProject.id);
    } catch (err) {
      setError('Failed to post comment. Please try again.');
      console.error('Error creating comment:', err);
    }
    setCreating(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canComment = ['Admin', 'Project Manager', 'Developer', 'Client'].includes(user.role);

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
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="w-16 h-16 border-4 border-purple-400 border-t-pink-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loading projects...
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
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              </div>
              <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Project Comments
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <button className="text-white/60 hover:text-white transition-colors duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base bg-transparent hover:bg-white/10 px-3 py-2 rounded-lg" title="Back to Dashboard">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              </Link>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {user?.full_name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-10 overflow-y-auto relative z-10">
        <div className="max-w-7xl mx-auto w-full"> {/* Added w-full here for better centering */}
          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-xl">
              <p className="text-red-300 text-center">{error}</p>
            </div>
          )}

          {/* Step 1: Project Selection */}
          {!selectedProject && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="mb-8 p-6 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
                  💬 Project Comments
                </h1>
                <p className="text-base sm:text-lg text-gray-300">Select a project to view and add comments</p>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-6">📋 Select a Project</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.length === 0 ? (
                    <div className="col-span-full text-center py-16">
                      <div className="text-6xl mb-6">📋</div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">No projects available</h3>
                      <p className="text-lg text-gray-400 mb-8">Contact your project manager for access.</p>
                    </div>
                  ) : (
                    projects.map((project) => (
                      <div
                        key={project.id}
                        className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer hover:bg-white/10"
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:text-white transition-colors duration-200 line-clamp-2">{project.name}</h3>
                          <div className="ml-4 flex-shrink-0">
                            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg">Active</span>
                          </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-200 mb-4 line-clamp-3">{project.description || 'No description provided'}</p>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm text-gray-500">Click to view comments</span>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Selected Project View with Comments */}
          {selectedProject && (
            <div className="space-y-6">
              {/* Project Header */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">{selectedProject.name}</h3>
                    <p className="text-gray-400 text-lg">{selectedProject.description || 'No description provided'}</p>
                  </div>
                  <button
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 flex items-center space-x-2 border border-white/20"
                    onClick={() => {
                      setSelectedProject(null);
                      setComments([]);
                      setShowCommentForm(false);
                      setNewComment('');
                    }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    💬 Comments ({comments.length})
                  </h4>
                  {canComment && !showCommentForm && (
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                      onClick={() => setShowCommentForm(true)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Add Comment</span>
                    </button>
                  )}
                </div>

                {/* Loading Comments */}
                {loadingComments && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 border-4 border-purple-400 border-t-pink-500 rounded-full animate-spin mb-6"></div>
                    <span className="text-xl font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Loading comments...</span>
                  </div>
                )}

                {/* Comments List */}
                {!loadingComments && (
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-16">
                        <div className="text-6xl mb-6">💬</div>
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">No comments yet</h3>
                        <p className="text-lg text-gray-400 mb-8">Be the first to add a comment!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/10 transition-all duration-200">
                          <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                              {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="ml-4">
                              <span className="font-semibold text-white text-lg">{comment.user_name || `User ${comment.user_id}`}</span>
                              {comment.created_at && (
                                <span className="text-gray-400 text-sm ml-3">{formatDate(comment.created_at)}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-gray-300 leading-relaxed text-base pl-16">{comment.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Comment Form */}
                {showCommentForm && canComment && (
                  <div className="mt-8 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
                    <h4 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">✍️ Add Your Comment</h4>
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <textarea
                        placeholder="Share your thoughts about this project..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none backdrop-blur-xl"
                        disabled={creating}
                        autoFocus
                      />
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${newComment.length > 1000 ? 'text-red-400' : 'text-gray-400'}`}>
                          {newComment.length}/1000 characters
                        </span>
                        <div className="space-x-3">
                          <button
                            type="button"
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all duration-200 border border-white/20"
                            onClick={() => {
                              setShowCommentForm(false);
                              setNewComment('');
                            }}
                            disabled={creating}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className={`px-6 py-3 text-white rounded-xl transition-all duration-200 ${
                              creating || !newComment.trim() || newComment.length > 1000
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                            }`}
                            disabled={creating || !newComment.trim() || newComment.length > 1000}
                          >
                            {creating ? (
                              <span className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Posting...</span>
                              </span>
                            ) : (
                              'Post Comment'
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* No Permission Message */}
                {!canComment && (
                  <div className="mt-6 p-4 bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/30 shadow-xl">
                    <p className="text-red-300 text-center">You don't have permission to comment on this project.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProjectCommentSystem;