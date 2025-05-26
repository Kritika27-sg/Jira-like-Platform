import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:8000/users', {
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <div>Loading users...</div>;
  if (!users.length) return <div>No users found.</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Users</h2>
      <ul>
        {users.map(u => (
          <li key={u.id} style={{ marginBottom: 10 }}>
            {u.full_name || u.email} — Role: {u.role}
          </li>
        ))}
      </ul>
      <Link to="/users/new"><button style={{ marginTop: 20 }}>Create New User</button></Link>
    </div>
  );
};

export default UserList;
