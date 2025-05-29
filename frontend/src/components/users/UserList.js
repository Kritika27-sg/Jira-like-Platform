import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const buttonColor = '#667eea';
const deleteColor = '#ef4444';
const updateColor = '#10b981';

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [updateForm, setUpdateForm] = useState({ full_name: '', email: '', role: '' });

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

  const handleDeleteUser = async (userId) => {
    try {
      const res = await fetch(`http://localhost:8000/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('jira-token')}` },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      
      // Remove user from local state
      setUsers(users.filter(u => u.id !== userId));
      setShowDeleteModal(false);
      setSelectedUser(null);
      alert('User deleted successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:8000/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jira-token')}`,
        },
        body: JSON.stringify(updateForm),
      });
      if (!res.ok) throw new Error('Failed to update user');
      
      const updatedUser = await res.json();
      
      // Update user in local state
      setUsers(users.map(u => 
        u.id === selectedUser.id ? updatedUser : u
      ));
      
      setShowUpdateModal(false);
      setSelectedUser(null);
      setUpdateForm({ full_name: '', email: '', role: '' });
      alert('User updated successfully!');
    } catch (error) {
      alert(error.message);
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const openUpdateModal = () => {
    setShowUpdateModal(true);
  };

  const selectUserForDelete = (userToDelete) => {
    setSelectedUser(userToDelete);
  };

  const selectUserForUpdate = (userToUpdate) => {
    setSelectedUser(userToUpdate);
    setUpdateForm({
      full_name: userToUpdate.full_name || '',
      email: userToUpdate.email || '',
      role: userToUpdate.role || 'Developer'
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <p style={styles.message}>Loading users...</p>
      </div>
    );
  }

  if (!users.length) {
    return (
      <div style={styles.container}>
        <div style={styles.headerContainer}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button style={styles.backButton}>← Back to Dashboard</button>
          </Link>
          <h2 style={styles.header}>Users</h2>
        </div>
        <p style={styles.message}>No users found.</p>
        {user.role === 'Admin' && (
          <Link to="/users/new" style={{ textDecoration: 'none' }}>
            <button style={styles.createButton}>Create New User</button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.headerContainer}>
        <Link to="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={styles.backButton}>← Back to Dashboard</button>
        </Link>
        <h2 style={styles.header}>Users</h2>
      </div>
      
      <div style={styles.userGrid}>
        {users.map((u) => (
          <div key={u.id} style={styles.userCard}>
            <div style={styles.userInfo}>
              <h3 style={styles.userName}>{u.full_name || u.email}</h3>
              <p style={styles.userEmail}>{u.full_name ? u.email : ''}</p>
              <div style={styles.roleContainer}>
                <span style={{
                  ...styles.roleBadge,
                  backgroundColor: getRoleColor(u.role)
                }}>
                  {u.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {user.role === 'Admin' && (
        <div style={styles.buttonContainer}>
          <Link to="/users/new" style={{ textDecoration: 'none' }}>
            <button style={styles.createButton}>Create New User</button>
          </Link>
          <button style={styles.updateButton} onClick={openUpdateModal}>
            Update User
          </button>
          <button style={styles.deleteButton} onClick={openDeleteModal}>
            Delete User
          </button>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeader}>Delete User</h3>
            <p style={styles.modalText}>Select a user to delete:</p>
            <div style={styles.userSelection}>
              {users.map((userItem) => (
                <div
                  key={userItem.id}
                  style={{
                    ...styles.userOption,
                    backgroundColor: selectedUser?.id === userItem.id ? '#fee2e2' : '#f9fafb'
                  }}
                  onClick={() => selectUserForDelete(userItem)}
                >
                  <strong>{userItem.full_name || userItem.email}</strong>
                  <p style={styles.userOptionRole}>Role: {userItem.role}</p>
                  {userItem.full_name && <p style={styles.userOptionEmail}>{userItem.email}</p>}
                </div>
              ))}
            </div>
            <div style={styles.modalButtons}>
              <button
                style={styles.cancelButton}
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
              >
                Cancel
              </button>
              <button
                style={styles.confirmDeleteButton}
                onClick={() => handleDeleteUser(selectedUser.id)}
                disabled={!selectedUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalHeader}>Update User</h3>
            {!selectedUser ? (
              <>
                <p style={styles.modalText}>Select a user to update:</p>
                <div style={styles.userSelection}>
                  {users.map((userItem) => (
                    <div
                      key={userItem.id}
                      style={styles.userOption}
                      onClick={() => selectUserForUpdate(userItem)}
                    >
                      <strong>{userItem.full_name || userItem.email}</strong>
                      <p style={styles.userOptionRole}>Role: {userItem.role}</p>
                      {userItem.full_name && <p style={styles.userOptionEmail}>{userItem.email}</p>}
                    </div>
                  ))}
                </div>
                <div style={styles.modalButtons}>
                  <button
                    style={styles.cancelButton}
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedUser(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateUser}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Full Name:</label>
                  <input
                    type="text"
                    value={updateForm.full_name}
                    onChange={(e) => setUpdateForm({...updateForm, full_name: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email:</label>
                  <input
                    type="email"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})}
                    style={styles.input}
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Role:</label>
                  <select
                    value={updateForm.role}
                    onChange={(e) => setUpdateForm({...updateForm, role: e.target.value})}
                    style={styles.select}
                    required
                  >
                    <option value="Developer">Developer</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Admin">Admin</option>
                    <option value="Tester">Tester</option>
                  </select>
                </div>
                <div style={styles.modalButtons}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => {
                      setShowUpdateModal(false);
                      setSelectedUser(null);
                      setUpdateForm({ full_name: '', email: '', role: '' });
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" style={styles.confirmUpdateButton}>
                    Update User
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const getRoleColor = (role) => {
  const colors = {
    'Admin': '#dc2626',
    'Project Manager': '#2563eb',
    'Developer': '#059669',
    'Tester': '#7c3aed',
  };
  return colors[role] || '#6b7280';
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 1000,
    margin: '40px auto',
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: '#333',
  },
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    backgroundColor: '#f8f9fa',
    border: '1px solid #e9ecef',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  },
  header: {
    fontSize: 26,
    margin: 0,
    textAlign: 'center',
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    margin: '30px 0',
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: 30,
  },
  userCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 20,
    border: '1px solid #e9ecef',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
  },
  userInfo: {
    textAlign: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 600,
    margin: '0 0 8px 0',
    color: '#333',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    margin: '0 0 12px 0',
  },
  roleContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  roleBadge: {
    padding: '4px 12px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  createButton: {
    padding: '12px 25px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: buttonColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${buttonColor}99`,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  updateButton: {
    padding: '12px 25px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: updateColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${updateColor}99`,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  deleteButton: {
    padding: '12px 25px',
    fontSize: 16,
    fontWeight: 600,
    color: '#fff',
    backgroundColor: deleteColor,
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    boxShadow: `0 3px 8px ${deleteColor}99`,
    transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    maxWidth: 500,
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  userSelection: {
    marginBottom: 20,
  },
  userOption: {
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    border: '1px solid #e5e7eb',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  userOptionRole: {
    fontSize: 14,
    color: '#666',
    margin: '5px 0 0 0',
  },
  userOptionEmail: {
    fontSize: 12,
    color: '#888',
    margin: '5px 0 0 0',
  },
  modalButtons: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#666',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  confirmDeleteButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: deleteColor,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  confirmUpdateButton: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    backgroundColor: updateColor,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid #d1d5db',
    borderRadius: 6,
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#fff',
    boxSizing: 'border-box',
  },
};

export default UserList;