const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getCommentsForTask = async (taskId, token) => {
  const res = await fetch(`${API_BASE_URL}/comments/task/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch comments');
  return res.json();
};

export const createComment = async (comment, token) => {
  const res = await fetch(`${API_BASE_URL}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(comment),
  });
  if (!res.ok) throw new Error('Failed to create comment');
  return res.json();
};
