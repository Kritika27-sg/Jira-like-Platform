import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const ProjectList = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch('http://localhost:8000/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      setProjects(data);
    } catch (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  if (loading) return <div>Loading projects...</div>;
  if (!projects.length) return <div>No projects found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Projects</h2>
      <ul>
        {projects.map((p) => (
          <li key={p.id} style={{ marginBottom: 10 }}>
            <strong>{p.name}</strong>: {p.description || '-'}
          </li>
        ))}
      </ul>
      {(user.role === 'Admin' || user.role === 'Project Manager') && (
        <Link to="/projects/new">
          <button style={{ marginTop: 20 }}>Create New Project</button>
        </Link>
      )}
    </div>
  );
};

export default ProjectList;
