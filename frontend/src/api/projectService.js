const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getProjects = async (token) => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch projects');
  return res.json();
};

export const createProject = async (project, token) => {
  const res = await fetch(`${API_BASE_URL}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(project),
  });
  if (!res.ok) throw new Error('Failed to create project');
  return res.json();
};
