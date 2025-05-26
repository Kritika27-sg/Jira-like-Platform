import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TaskForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('To Do');
  const [projectId, setProjectId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:8000/projects', {
      headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
    })
      .then(res => res.json())
      .then(data => setProjects(data))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projectId) {
      alert('Choose a project');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify({ title, description, status, project_id: parseInt(projectId) }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      await res.json();
      alert('Task created successfully');
      navigate('/tasks');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Create Task</h2>
      <div>
        <label>Project</label><br />
        <select
          value={projectId}
          onChange={e => setProjectId(e.target.value)}
          required
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        >
          <option value="">Select Project</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label>Task Title</label><br />
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
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
      <div>
        <label>Status</label><br />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        >
          <option>To Do</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>Create</button>
    </form>
  );
};

export default TaskForm;
