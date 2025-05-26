import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <h1>Welcome, {user?.full_name || user?.email}</h1>
      <p>Your role: {user?.role}</p>
      <nav style={{ marginTop: 20 }}>
        <Link to="/projects" style={{ marginRight: 10 }}>Projects</Link>
        <Link to="/tasks" style={{ marginRight: 10 }}>Tasks</Link>
        {(user?.role === 'Admin') && <Link to="/users" style={{ marginRight: 10 }}>Users</Link>}
        <Link to="/logout">Logout</Link>
      </nav>
    </div>
  );
};

export default Dashboard;
