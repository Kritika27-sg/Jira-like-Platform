import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProjectForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify({ name, description }),
      });
      if (!res.ok) throw new Error('Failed to create project');
      await res.json();
      alert('Project created successfully!');
      navigate('/projects');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Create Project</h2>
      <div>
        <label>Project Name</label><br />
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>
      <div>
        <label>Description</label><br />
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>
      <button type="submit" disabled={loading}>Create</button>
    </form>
  );
};

export default ProjectForm;
