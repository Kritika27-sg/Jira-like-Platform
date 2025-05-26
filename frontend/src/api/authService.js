const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const loginWithGoogle = async (code) => {
  const response = await fetch(`${API_BASE_URL}/auth/google/callback?code=${code}`);
  if (!response.ok) {
    throw new Error('Failed to login');
  }
  return response.json(); // Expecting user object and token in response
};

export const logout = () => {
  localStorage.removeItem('jira-user');
  localStorage.removeItem('jira-token');
};
