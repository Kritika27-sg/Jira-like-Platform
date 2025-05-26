import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaProjectDiagram, FaTasks, FaUsers, FaSignOutAlt } from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavButton = ({ icon: Icon, label, onClick, to }) => {
    const handleClick = () => {
      if(onClick) onClick();
      else if(to) navigate(to);
    };

    return (
      <button onClick={handleClick} style={styles.navButton} type="button">
        <Icon style={styles.icon} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div style={styles.pageBackground}>
      <div style={styles.container}>
        <h1 style={styles.welcomeText}>Welcome, {user?.full_name || user?.email}</h1>
        <p style={styles.roleText}>Your role: <strong>{user?.role}</strong></p>

        <nav style={styles.nav}>
          <NavButton icon={FaProjectDiagram} label="Projects" to="/projects" />
          <NavButton icon={FaTasks} label="Tasks" to="/tasks" />
          {user?.role === 'Admin' && <NavButton icon={FaUsers} label="Users" to="/users" />}
          <NavButton icon={FaSignOutAlt} label="Logout" onClick={handleLogout} />
        </nav>
      </div>
    </div>
  );
};

const buttonColor = '#667eea';

const styles = {
  pageBackground: {
    minHeight: '100vh',
    backgroundColor: buttonColor,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: 600,
    width: '100%',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  welcomeText: {
    fontSize: 28,
    color: '#333',
    marginBottom: 10,
  },
  roleText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
  },
  nav: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
  },
  navButton: {
    flex: '1 1 130px',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 20px',
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
  icon: {
    fontSize: 20,
  },
};

export default Dashboard;
