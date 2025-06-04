import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
            setShowInfo(false);
            return;
        }
        let info = '';
        switch (user?.role) {
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

    const getRoleColor = (role) => {
        switch (role) {
            case 'Project Manager': return '#0052CC';
            case 'Developer': return '#00875A';
            case 'Client': return '#8777D9';
            default: return '#6B778C';
        }
    };

    const getNavigationItems = () => {
        switch (user?.role) {
            case 'Project Manager':
                return [
                    { icon: '📋', label: 'Projects', path: '/projects', description: 'Manage your projects' },
                    { icon: '✅', label: 'Tasks', path: '/my-tasks', description: 'View and assign tasks' },
                    { icon: '📊', label: 'Reports', path: '/reports', description: 'Project analytics' },
                    { icon: '⚙️', label: 'Settings', path: '/settings', description: 'Project settings' }
                ];
            case 'Developer':
                return [
                    { icon: '💻', label: 'My Tasks', path: '/my-tasks', description: 'Tasks assigned to you' },
                    { icon: '📋', label: 'Projects', path: '/projects', description: 'View project details' },
                    { icon: '🔍', label: 'Search', path: '/search', description: 'Find tasks and issues' }
                ];
            case 'Client':
                return [
                    { icon: '📈', label: 'Progress', path: '/project-progress', description: 'Track project status' },
                    { icon: '💬', label: 'Comments', path: '/comments', description: 'View and add feedback' },
                    { icon: '📊', label: 'Reports', path: '/reports', description: 'Project reports' }
                ];
            default:
                return [];
        }
    };

    const navigationItems = getNavigationItems();

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logoContainer}>
                    <svg width="32" height="32" viewBox="0 0 32 32" style={styles.logo}>
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor:"#2684FF",stopOpacity:1}} />
                                <stop offset="100%" style={{stopColor:"#0052CC",stopOpacity:1}} />
                            </linearGradient>
                        </defs>
                        <rect width="32" height="32" rx="6" fill="url(#grad1)"/>
                        <path d="M8 8h6v6H8V8zm0 10h6v6H8v-6zm10-10h6v6h-6V8z" fill="white"/>
                        <path d="M18 18h6v6h-6v-6z" fill="white" fillOpacity="0.8"/>
                    </svg>
                    <span style={styles.logoText}>Jira</span>
                </div>

                <div style={styles.userInfo}>
                    <span style={styles.userName}>{user?.full_name}</span>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        🚪 Sign Out
                    </button>
                </div>
            </div>

            <div style={styles.mainWrapper}>
                {/* Vertical Navigation Sidebar */}
                <div style={styles.sidebar}>
                    {/* Role Information in Sidebar */}
                    <div style={styles.roleSection}>
                        <div style={styles.roleHeader}>
                            <span 
                                style={{
                                    ...styles.roleTag,
                                    backgroundColor: getRoleColor(user?.role),
                                }}
                            >
                                {user?.role}
                            </span>
                            <button onClick={handleRoleInfo} style={styles.infoToggle}>
                                {showInfo ? '▼' : '▶'}
                            </button>
                        </div>
                        
                        {showInfo && (
                            <div style={styles.roleInfoExpanded}>
                                <p style={styles.roleInfoText}>{roleInfo}</p>
                            </div>
                        )}
                    </div>

                    {/* Navigation Items */}
                    <nav style={styles.navigation}>
                        <div style={styles.navHeader}>Navigation</div>
                        {navigationItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => navigate(item.path)}
                                style={styles.navItem}
                                title={item.description}
                            >
                                <span style={styles.navIcon}>{item.icon}</span>
                                <span style={styles.navLabel}>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Main Content */}
                <div style={styles.mainContent}>
                    <div style={styles.welcomeSection}>
                        <h1 style={styles.welcomeTitle}>Welcome back, {user?.full_name}!</h1>
                        <p style={styles.welcomeSubtitle}>
                            Your {user?.role} dashboard
                        </p>
                    </div>

                    {/* Dashboard Content Area */}
                    <div style={styles.contentArea}>
                        <div style={styles.summaryCard}>
                            <h3 style={styles.cardTitle}>Dashboard Overview</h3>
                            <p style={styles.cardText}>
                                Use the navigation menu on the left to access your {user?.role.toLowerCase()} features and tools.
                            </p>
                            <div style={styles.statsGrid}>
                                <div style={styles.statItem}>
                                    <div style={styles.statNumber}>12</div>
                                    <div style={styles.statLabel}>Active Projects</div>
                                </div>
                                <div style={styles.statItem}>
                                    <div style={styles.statNumber}>8</div>
                                    <div style={styles.statLabel}>Pending Tasks</div>
                                </div>
                                <div style={styles.statItem}>
                                    <div style={styles.statNumber}>24</div>
                                    <div style={styles.statLabel}>Completed</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#FAFBFC',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        display: 'flex',
        flexDirection: 'column',
    },
    header: {
        padding: '12px 24px',
        borderBottom: '1px solid #DFE1E6',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: '56px',
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    logo: {
        borderRadius: '6px',
    },
    logoText: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#172B4D',
    },
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    userName: {
        fontSize: '14px',
        fontWeight: '500',
        color: '#172B4D',
    },
    logoutButton: {
        padding: '8px 16px',
        backgroundColor: '#F4F5F7',
        border: '1px solid #DFE1E6',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#172B4D',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: '#EBECF0',
        },
    },
    mainWrapper: {
        display: 'flex',
        flex: 1,
    },
    sidebar: {
        width: '280px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #DFE1E6',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    roleSection: {
        padding: '0 24px',
        borderBottom: '1px solid #DFE1E6',
        paddingBottom: '24px',
    },
    roleHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
    },
    roleTag: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#FFFFFF',
        padding: '6px 12px',
        borderRadius: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    infoToggle: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '12px',
        color: '#6B778C',
        padding: '4px',
        borderRadius: '2px',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: '#F4F5F7',
        },
    },
    roleInfoExpanded: {
        backgroundColor: '#F4F5F7',
        padding: '12px',
        borderRadius: '6px',
        marginTop: '8px',
    },
    roleInfoText: {
        fontSize: '12px',
        color: '#6B778C',
        margin: '0',
        lineHeight: '16px',
    },
    navigation: {
        padding: '0 24px',
    },
    navHeader: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#6B778C',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '12px',
    },
    navItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 16px',
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#172B4D',
        textAlign: 'left',
        marginBottom: '4px',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: '#F4F5F7',
        },
    },
    navIcon: {
        fontSize: '16px',
        width: '20px',
        textAlign: 'center',
    },
    navLabel: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        padding: '32px',
        overflow: 'auto',
    },
    welcomeSection: {
        marginBottom: '32px',
    },
    welcomeTitle: {
        fontSize: '28px',
        fontWeight: '600',
        color: '#172B4D',
        margin: '0 0 8px 0',
        lineHeight: '32px',
    },
    welcomeSubtitle: {
        fontSize: '16px',
        color: '#6B778C',
        margin: '0',
        lineHeight: '24px',
    },
    contentArea: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
    },
    summaryCard: {
        backgroundColor: '#FFFFFF',
        border: '1px solid #DFE1E6',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 2px 4px rgba(9, 30, 66, 0.08)',
    },
    cardTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#172B4D',
        margin: '0 0 12px 0',
    },
    cardText: {
        fontSize: '14px',
        color: '#6B778C',
        lineHeight: '20px',
        margin: '0 0 24px 0',
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px',
    },
    statItem: {
        textAlign: 'center',
        padding: '16px',
        backgroundColor: '#F4F5F7',
        borderRadius: '6px',
    },
    statNumber: {
        fontSize: '24px',
        fontWeight: '600',
        color: '#172B4D',
        marginBottom: '4px',
    },
    statLabel: {
        fontSize: '12px',
        color: '#6B778C',
        fontWeight: '500',
    },
};

export default Dashboard;