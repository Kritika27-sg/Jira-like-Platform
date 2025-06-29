import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCommentsForProject, createComment } from '../../api/commentService';

const ProjectCommentSystem = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
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
      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
        <div className="px-6 py-4 flex items-center gap-4">
          <Link to="/dashboard">
            <button className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group" title="Back to Dashboard">
              <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">💬 Project Comments</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Project Selection */}
        {!selectedProject && (
          <div className="space-y-8">
            <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">📋 Select a Project</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-6">📋</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">No projects available</h3>
                    <p className="text-lg text-gray-600 mb-8">Contact your project manager for access.</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="group backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                      onClick={() => handleProjectSelect(project)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200 line-clamp-2">{project.name}</h3>
                        <div className="ml-4 flex-shrink-0">
                          <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs font-semibold rounded-full uppercase tracking-wider shadow-lg">Active</span>
                        </div>
                      </div>
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-200 mb-4 line-clamp-3">{project.description || 'No description provided'}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Selected Project View with Comments */}
        {selectedProject && (
          <div className="backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl p-8">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-semibold text-gray-800">{selectedProject.name}</h3>
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setSelectedProject(null);
                  setComments([]);
                  setShowCommentForm(false);
                  setNewComment('');
                }}
              >
                ← Back to Projects
              </button>
            </div>
            <p className="text-gray-600 mb-4">{selectedProject.description || 'No description provided'}</p>

            {/* Comments Section */}
            <div className="mt-6">
              <h4 className="text-xl font-bold mb-4">Comments ({comments.length})</h4>
              {canComment && !showCommentForm && (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => setShowCommentForm(true)}
                >
                  ➕ Add Comment
                </button>
              )}

              {/* Loading Comments */}
              {loadingComments && (
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                  <span className="text-xl font-medium">Loading comments...</span>
                </div>
              )}

              {/* Comments List */}
              {!loadingComments && (
                <div className="mt-4">
                  {comments.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="text-6xl mb-6">💬</div>
                      <p className="text-lg text-gray-600 mb-8">No comments yet</p>
                      <p className="text-sm text-gray-500">Be the first to add a comment!</p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="border-b border-gray-200 py-4">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold">
                            {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="ml-2">
                            <span className="font-semibold">{comment.user_name || `User  ${comment.user_id}`}</span>
                            {comment.created_at && (
                              <span className="text-gray-500 text-sm ml-2">{formatDate(comment.created_at)}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-700">{comment.content}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Comment Form */}
              {showCommentForm && canComment && (
                <div className="mt-6">
                  <h4 className="text-lg font-bold mb-2">✍️ Add Your Comment</h4>
                  <form onSubmit={handleCommentSubmit}>
                    <textarea
                      placeholder="Share your thoughts about this project..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      disabled={creating}
                      autoFocus
                    />
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm">{newComment.length}/1000</span>
                      <div>
                        <button
                          type="button"
                          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 mr-2"
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
                          className={`px-4 py-2 text-white rounded-lg ${creating || !newComment.trim() || newComment.length > 1000 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                          disabled={creating || !newComment.trim() || newComment.length > 1000}
                        >
                          {creating ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* No Permission Message */}
              {!canComment && (
                <div className="mt-4 text-red-600">
                  <span>You don't have permission to comment on this project.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProjectCommentSystem;
