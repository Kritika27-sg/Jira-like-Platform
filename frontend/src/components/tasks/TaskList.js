import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      const res = await fetch('http://localhost:8000/tasks', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;
  if (!tasks.length) return <div>No tasks found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Tasks</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id} style={{ marginBottom: 10 }}>
            <strong>{task.title}</strong> - Status: {task.status}
          </li>
        ))}
      </ul>
      <Link to="/tasks/new">
        <button style={{ marginTop: 20 }}>Create New Task</button>
      </Link>
    </div>
  );
};

export default TaskList;
