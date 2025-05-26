import React, { useEffect, useState, useCallback} from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCommentsForTask, createComment } from '../../api/commentService';

const CommentList = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCommentsForTask(taskId, localStorage.getItem('jira-token'));
      setComments(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  },[taskId]);

  useEffect(() => {
    if (taskId) loadComments();
  }, [taskId, loadComments]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCreating(true);
    try {
      await createComment(
        { content: newComment, task_id: taskId },
        localStorage.getItem('jira-token')
      );
      setNewComment('');
      loadComments();
    } catch (err) {
      alert(err.message);
    }
    setCreating(false);
  };

  if (loading) return <div>Loading comments...</div>;

  return (
    <div>
      <h3>Comments</h3>
      <ul style={{ maxHeight: 200, overflowY: 'auto' }}>
        {comments.map((c) => (
          <li key={c.id}>
            <b>{c.user_id}</b>: {c.content}
          </li>
        ))}
      </ul>

      {(user.role === 'Admin' || user.role === 'Project Manager' || user.role === 'Developer' || user.role === 'Client') && (
        <form onSubmit={handleCommentSubmit}>
          <textarea
            placeholder="Add a comment"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            rows={3}
            style={{ width: '100%', marginTop: 10 }}
            disabled={creating}
          />
          <button type="submit" disabled={creating || !newComment.trim()} style={{ marginTop: 5 }}>
            Post Comment
          </button>
        </form>
      )}
    </div>
  );
};

export default CommentList;
