import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCommentsForProject, createComment } from '../../api/commentService';

const ProjectCommentSystem = () => {
  const { user } = useAuth();
  //const navigate = useNavigate();
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
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <span style={styles.loadingText}>Loading projects...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Link to="/dashboard" style={styles.backLink}>
            <button style={styles.backButton}>
              ← Back to Dashboard
            </button>
          </Link>
          <div style={styles.titleSection}>
            <h1 style={styles.pageTitle}>💬 Project Comments</h1>
            <p style={styles.pageSubtitle}>
              Select a project to view and add comments
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Step 1: Project Selection */}
        {!selectedProject && (
          <div style={styles.projectSelection}>
            <div style={styles.formCard}>
              <div style={styles.formHeader}>
                <h2 style={styles.formTitle}>📋 Select a Project</h2>
                <p style={styles.formSubtitle}>
                  Choose a project to view and participate in discussions
                </p>
              </div>
              
              <div style={styles.cardContent}>
                {projects.length === 0 ? (
                  <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📋</div>
                    <p style={styles.emptyText}>No projects available</p>
                    <p style={styles.emptySubtext}>Contact your project manager for access.</p>
                  </div>
                ) : (
                  <div style={styles.projectGrid}>
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        style={styles.projectCard}
                        onClick={() => handleProjectSelect(project)}
                      >
                        <div style={styles.projectHeader}>
                          <h4 style={styles.projectName}>{project.name}</h4>
                          <div style={styles.projectBadge}>Active</div>
                        </div>
                        <p style={styles.projectDescription}>
                          {project.description || 'No description provided'}
                        </p>
                        <div style={styles.projectFooter}>
                          <span style={styles.selectText}>Comment →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Selected Project View with Comments */}
        {selectedProject && (
          <div style={styles.selectedProjectView}>
            {/* Project Header with Back Button */}
            <div style={styles.selectedProjectCard}>
              <div style={styles.selectedProjectHeader}>
                <button
                  style={styles.projectBackButton}
                  onClick={() => {
                    setSelectedProject(null);
                    setComments([]);
                    setShowCommentForm(false);
                    setNewComment('');
                  }}
                >
                  ← Back to Projects
                </button>
                <div style={styles.selectedProjectInfo}>
                  <h3 style={styles.selectedProjectName}>{selectedProject.name}</h3>
                  <p style={styles.selectedProjectDesc}>
                    {selectedProject.description || 'No description provided'}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div style={styles.commentsSection}>
                <div style={styles.commentsSectionHeader}>
                  <h4 style={styles.commentsTitle}>Comments ({comments.length})</h4>
                  {canComment && !showCommentForm && (
                    <button
                      style={styles.addCommentButton}
                      onClick={() => setShowCommentForm(true)}
                    >
                      ➕ Add Comment
                    </button>
                  )}
                </div>

                {/* Loading Comments */}
                {loadingComments && (
                  <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <span style={styles.loadingText}>Loading comments...</span>
                  </div>
                )}

                {/* Comments List */}
                {!loadingComments && (
                  <div style={styles.commentsContainer}>
                    {comments.length === 0 ? (
                      <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>💬</div>
                        <p style={styles.emptyText}>No comments yet</p>
                        <p style={styles.emptySubtext}>Be the first to add a comment!</p>
                      </div>
                    ) : (
                      <div style={styles.commentsList}>
                        {comments.map((comment) => (
                          <div key={comment.id} style={styles.commentItem}>
                            <div style={styles.commentHeader}>
                              <div style={styles.commentAuthor}>
                                <div style={styles.authorAvatar}>
                                  {comment.user_name ? comment.user_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div style={styles.authorInfo}>
                                  <span style={styles.authorName}>
                                    {comment.user_name || `User ${comment.user_id}`}
                                  </span>
                                  {comment.created_at && (
                                    <span style={styles.commentDate}>
                                      {formatDate(comment.created_at)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div style={styles.commentContent}>
                              {comment.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Step 3: Comment Form (shown after clicking Add Comment) */}
                {showCommentForm && canComment && (
                  <div style={styles.commentFormContainer}>
                    <div style={styles.commentFormHeader}>
                      <h4 style={styles.commentFormTitle}>✍️ Add Your Comment</h4>
                      <button
                        style={styles.cancelCommentButton}
                        onClick={() => {
                          setShowCommentForm(false);
                          setNewComment('');
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
                      <div style={styles.formGroup}>
                        <textarea
                          placeholder="Share your thoughts about this project..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={4}
                          style={styles.textarea}
                          disabled={creating}
                          autoFocus
                        />
                      </div>
                      <div style={styles.formActions}>
                        <span style={styles.characterCount}>
                          {newComment.length}/1000
                        </span>
                        <div style={styles.formButtons}>
                          <button
                            type="button"
                            style={styles.cancelButton}
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
                            disabled={creating || !newComment.trim() || newComment.length > 1000}
                            style={{
                              ...styles.submitButton,
                              ...(creating || !newComment.trim() || newComment.length > 1000 ? styles.disabledButton : {})
                            }}
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
                  <div style={styles.noPermissionMessage}>
                    <span style={styles.noPermissionText}>
                      You don't have permission to comment on this project.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#FAFBFC',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #DFE1E6',
    padding: '24px 32px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  backLink: {
    textDecoration: 'none',
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#172B4D',
    marginBottom: '16px',
    transition: 'background-color 0.2s ease',
  },
  titleSection: {
    marginBottom: '8px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
    lineHeight: '32px',
  },
  pageSubtitle: {
    fontSize: '16px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '24px',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '32px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    gap: '12px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid #DFE1E6',
    borderTop: '2px solid #0052CC',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#6B778C',
  },
  projectSelection: {
    width: '100%',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  formHeader: {
    padding: '24px 32px 16px 32px',
    borderBottom: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
  },
  formTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  formSubtitle: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
    lineHeight: '20px',
  },
  cardContent: {
    padding: '32px',
  },
  projectGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  projectCard: {
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
  },
  projectHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  projectName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
  },
  projectBadge: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#00875A',
    backgroundColor: '#E3FCEF',
    padding: '4px 8px',
    borderRadius: '12px',
    textTransform: 'uppercase',
  },
  projectDescription: {
    fontSize: '14px',
    color: '#6B778C',
    lineHeight: '20px',
    margin: '0 0 16px 0',
    minHeight: '40px',
  },
  projectFooter: {
    textAlign: 'right',
  },
  selectText: {
    fontSize: '12px',
    color: '#0052CC',
    fontWeight: '500',
  },
  selectedProjectView: {
    width: '100%',
  },
  selectedProjectCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    overflow: 'hidden',
  },
  selectedProjectHeader: {
    padding: '24px 32px',
    borderBottom: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
  },
  projectBackButton: {
    padding: '8px 12px',
    fontSize: '14px',
    color: '#0052CC',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    marginBottom: '16px',
    transition: 'background-color 0.2s ease',
  },
  selectedProjectInfo: {
    textAlign: 'center',
  },
  selectedProjectName: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0 0 8px 0',
  },
  selectedProjectDesc: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
  },
  commentsSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px 16px 32px',
    borderBottom: '1px solid #DFE1E6',
  },
  commentsTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
  },
  addCommentButton: {
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  commentsContainer: {
    maxHeight: '500px',
    overflowY: 'auto',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#172B4D',
    margin: '0 0 4px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#6B778C',
    margin: '0',
  },
  commentsList: {
    padding: '0',
  },
  commentItem: {
    padding: '16px 32px',
    borderBottom: '1px solid #F4F5F7',
  },
  commentHeader: {
    marginBottom: '8px',
  },
  commentAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  authorAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#0052CC',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '600',
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  authorName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#172B4D',
  },
  commentDate: {
    fontSize: '12px',
    color: '#6B778C',
  },
  commentContent: {
    fontSize: '14px',
    color: '#172B4D',
    lineHeight: '20px',
    marginLeft: '40px',
    whiteSpace: 'pre-wrap',
  },
  commentFormContainer: {
    borderTop: '1px solid #DFE1E6',
    backgroundColor: '#F4F5F7',
  },
  commentFormHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    borderBottom: '1px solid #DFE1E6',
  },
  commentFormTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#172B4D',
    margin: '0',
  },
  cancelCommentButton: {
    padding: '4px 8px',
    fontSize: '16px',
    color: '#6B778C',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'color 0.2s ease',
  },
  commentForm: {
    padding: '32px',
  },
  formGroup: {
    marginBottom: '16px',
  },
  textarea: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    backgroundColor: '#FFFFFF',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: '12px',
    color: '#6B778C',
  },
  formButtons: {
    display: 'flex',
    gap: '12px',
  },
  cancelButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#172B4D',
    backgroundColor: '#F4F5F7',
    border: '1px solid #DFE1E6',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  submitButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FFFFFF',
    backgroundColor: '#0052CC',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  disabledButton: {
    opacity: '0.6',
    cursor: 'not-allowed',
  },
  noPermissionMessage: {
    padding: '32px',
    textAlign: 'center',
    backgroundColor: '#F4F5F7',
    borderTop: '1px solid #DFE1E6',
  },
  noPermissionText: {
    fontSize: '14px',
    color: '#6B778C',
    fontStyle: 'italic',
  },
};

// Add CSS animation for spinner
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .projectCard:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(9, 30, 66, 0.15);
      border-color: #0052CC;
    }
    
    .textarea:focus {
      border-color: #0052CC;
      box-shadow: 0 0 0 2px rgba(0, 82, 204, 0.2);
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProjectCommentSystem;