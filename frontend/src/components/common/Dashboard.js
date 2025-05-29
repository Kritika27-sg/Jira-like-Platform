import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaProjectDiagram, FaTasks, FaUsers, FaSignOutAlt, FaCommentDots } from 'react-icons/fa';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [roleInfo, setRoleInfo] = useState('');
    const [showInfo, setShowInfo] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleRoleInfo = () => {
        if (showInfo) {
            // Hide if already showing
            setShowInfo(false);
            return;
        }
        let info = '';
        switch (user?.role) {
            case 'Admin':
                info = "Admins can view and manage all users and all projects.";
                break;
            case 'Project Manager':
                info = "Project Managers can create and manage only the projects they own, create tasks within those projects, and assign tasks only to Developers within their project.";
                break;
            case 'Developer':
                info = "Developers can view and update tasks assigned to them.";
                break;
            case 'Client':
                info = "Clients can view project progress and comment on tasks but cannot modify any data.";
                break;
            default:
                info = "Role information not available.";
        }
        setRoleInfo(info);
        setShowInfo(true);
    };

    const NavButton = ({ icon: Icon, label, onClick, to }) => {
        const handleClick = () => {
            if (onClick) onClick();
            else if (to) navigate(to);
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
                <h1 style={styles.welcomeText}>Welcome, {user?.full_name}</h1>
                <p style={styles.roleText}>Your role: <strong>{user?.role}</strong></p>
                <nav style={styles.nav}>
                    {user?.role === 'Admin' && (
                        <>
                            <NavButton icon={FaProjectDiagram} label="Projects" to="/projects" />
                            <NavButton icon={FaUsers} label="Users" to="/users" />
                        </>
                    )}
                    {user?.role === 'Project Manager' && (
                        <>
                            <NavButton icon={FaProjectDiagram} label="My Projects" to="/projects" />
                            <NavButton icon={FaTasks} label="My Tasks" to="/my-tasks" />
                        </>
                    )}
                    {user?.role === 'Developer' && (
                        <NavButton icon={FaTasks} label="My Tasks" to="/my-tasks" />
                    )}
                    {user?.role === 'Client' && (
                        <>
                            <NavButton icon={FaProjectDiagram} label="Project Progress" to="/project-progress" />
                            <NavButton icon={FaCommentDots} label="Comments" to="/comments" />
                        </>
                    )}
                    <NavButton icon={FaSignOutAlt} label="Logout" onClick={handleLogout} />
                </nav>
                <button onClick={handleRoleInfo} style={styles.infoButton}>
                    Show Role Information
                </button>
                {showInfo && (
                    <div style={styles.popup} onClick={() => setShowInfo(false)} role="alert" aria-live="assertive">
                        {roleInfo}
                        <div style={styles.popupCloseHint}>(Click here to close)</div>
                    </div>
                )}
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
        position: 'relative',
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
    infoButton: {
        marginTop: 20,
        padding: '10px 15px',
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
    popup: {
        position: 'absolute',
        top: '110%',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#fff',
        border: `2px solid ${buttonColor}`,
        borderRadius: 12,
        boxShadow: `0 8px 16px rgba(0,0,0,0.2)`,
        padding: 20,
        width: '90%',
        maxWidth: 560,
        fontSize: 16,
        color: '#333',
        cursor: 'pointer',
        userSelect: 'none',
        zIndex: 10,
        textAlign: 'center',
    },
    popupCloseHint: {
        marginTop: 10,
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
    },
    icon: {
        fontSize: 20,
    },
};

export default Dashboard;

