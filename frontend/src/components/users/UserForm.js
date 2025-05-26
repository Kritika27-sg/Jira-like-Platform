import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserForm = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Client');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify({
          email,
          full_name: fullName,
          role,
        }),
      });

      if (!res.ok) throw new Error('Failed to create user');
      await res.json();
      alert('User created successfully');
      navigate('/users');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h2>Create User</h2>
      <div>
        <label>Email</label><br />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>
      <div>
        <label>Full Name</label><br />
        <input
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
      </div>
      <div>
        <label>Role</label><br />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          disabled={loading}
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        >
          <option>Admin</option>
          <option>Project Manager</option>
          <option>Developer</option>
          <option>Client</option>
        </select>
      </div>
      <button type="submit" disabled={loading}>Create</button>
    </form>
  );
};

export default UserForm;
