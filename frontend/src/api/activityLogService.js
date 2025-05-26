const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getActivityLogsForTask = async (taskId, token) => {
  const res = await fetch(`${API_BASE_URL}/activity-log/task/${taskId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch activity logs');
  return res.json();
};
