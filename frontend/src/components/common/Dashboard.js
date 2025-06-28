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
                info = "Clients can view project progress and comment on tasks.";
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
                    { icon: '✅', label: 'Tasks', path: '/tasks', description: 'View and assign tasks' },
                    { icon: '💬', label: 'Comments', path: '/comments', description: 'View and add feedback' }
                ];
            case 'Developer':
                return [
                    { icon: '📋', label: 'Projects', path: '/projects', description: 'All available projects' },
                    { icon: '💻', label: 'My Tasks', path: '/my-tasks', description: 'Tasks assigned to you' },
                    { icon: '💬', label: 'Comments', path: '/comments', description: 'View and add feedback' }
                ];
            case 'Client':
                return [
                    { icon: '📈', label: 'Progress', path: '/activity-log', description: 'Track project status' },
                    { icon: '💬', label: 'Comments', path: '/comments', description: 'View and add feedback' }
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
                    <svg width="40" height="40" viewBox="0 0 32 32" style={styles.logo}>
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style={{stopColor:"rgba(83, 22, 180, 0.93)",stopOpacity:1}} />
                                <stop offset="100%" style={{stopColor:"rgba(65, 39, 161, 0.6)",stopOpacity:1}} />
                            </linearGradient>
                        </defs>
                        <rect width="32" height="32" rx="6" fill="url(#grad1)"/>
                        <path d="M8 8h6v6H8V8zm0 10h6v6H8v-6zm10-10h6v6h-6V8z" fill="white"/>
                        <path d="M18 18h6v6h-6v-6z" fill="white" fillOpacity="0.8"/>
                    </svg>
                    <span style={styles.logoText}>Jira</span>
                </div>

                <div style={styles.userInfo}>
                    <button onClick={handleLogout} style={styles.logoutButton}>
                        Sign Out
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

                    {/* Enhanced Content Area with Visual Elements */}
                    <div style={styles.contentArea}>
                        {/* Hero Image Section */}
                        <div style={styles.heroSection}>
                            <div style={styles.heroContent}>
                                <div style={styles.heroText}>
                                    <h2 style={styles.heroTitle}>Boost Your Productivity</h2>
                                    <p style={styles.heroDescription}>
                                        Streamline your project management workflow with powerful tools 
                                        designed to help teams collaborate effectively and deliver results.
                                    </p>
                                </div>
                                <div style={styles.heroImage}>
                                    <svg width="320" height="200" viewBox="0 0 320 200" fill="none">
                                        {/* Background */}
                                        <rect width="320" height="200" rx="12" fill="url(#heroGradient)"/>
                                        
                                        {/* Floating Elements */}
                                        <circle cx="60" cy="40" r="20" fill="rgba(255,255,255,0.1)"/>
                                        <circle cx="260" cy="160" r="15" fill="rgba(255,255,255,0.1)"/>
                                        <circle cx="280" cy="50" r="12" fill="rgba(255,255,255,0.1)"/>
                                        
                                        {/* Main Dashboard Mockup */}
                                        <rect x="40" y="60" width="240" height="120" rx="8" fill="rgba(255,255,255,0.9)"/>
                                        <rect x="50" y="70" width="60" height="8" rx="4" fill="#0052CC"/>
                                        <rect x="50" y="85" width="40" height="6" rx="3" fill="#DFE1E6"/>
                                        <rect x="50" y="95" width="80" height="6" rx="3" fill="#DFE1E6"/>
                                        
                                        <rect x="150" y="70" width="120" height="40" rx="4" fill="#E6F3FF"/>
                                        <rect x="160" y="80" width="20" height="20" rx="10" fill="#0052CC"/>
                                        <rect x="190" y="82" width="60" height="4" rx="2" fill="#0052CC"/>
                                        <rect x="190" y="90" width="40" height="4" rx="2" fill="#6B778C"/>
                                        
                                        <rect x="50" y="120" width="220" height="30" rx="4" fill="#F4F5F7"/>
                                        <rect x="60" y="130" width="100" height="4" rx="2" fill="#00875A"/>
                                        <rect x="60" y="138" width="60" height="4" rx="2" fill="#6B778C"/>
                                        
                                        <defs>
                                            <linearGradient id="heroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#2684FF"/>
                                                <stop offset="100%" stopColor="#0052CC"/>
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Feature Cards */}
                        <div style={styles.featuresGrid}>
                            <div style={styles.featureCard}>
                                <div style={styles.featureIcon}>
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <rect width="48" height="48" rx="12" fill="#E6F3FF"/>
                                        <path d="M16 20h16v12a2 2 0 01-2 2H18a2 2 0 01-2-2V20zM20 16h8v4H20v-4z" fill="#0052CC"/>
                                        <circle cx="20" cy="26" r="1.5" fill="white"/>
                                        <circle cx="24" cy="26" r="1.5" fill="white"/>
                                        <circle cx="28" cy="26" r="1.5" fill="white"/>
                                    </svg>
                                </div>
                                <h3 style={styles.featureTitle}>Project Management</h3>
                                <p style={styles.featureDescription}>
                                    Organize and track your projects with intuitive boards, 
                                    timelines, and progress indicators.
                                </p>
                            </div>

                            <div style={styles.featureCard}>
                                <div style={styles.featureIcon}>
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <rect width="48" height="48" rx="12" fill="#E8F5E8"/>
                                        <path d="M18 24l4 4 8-8" stroke="#00875A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                        <rect x="14" y="16" width="20" height="16" rx="2" stroke="#00875A" strokeWidth="2" fill="none"/>
                                    </svg>
                                </div>
                                <h3 style={styles.featureTitle}>Task Tracking</h3>
                                <p style={styles.featureDescription}>
                                    Create, assign, and monitor tasks with detailed 
                                    status updates and deadline management.
                                </p>
                            </div>

                            <div style={styles.featureCard}>
                                <div style={styles.featureIcon}>
                                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                        <rect width="48" height="48" rx="12" fill="#F4F0FF"/>
                                        <circle cx="20" cy="20" r="4" stroke="#8777D9" strokeWidth="2" fill="none"/>
                                        <circle cx="28" cy="20" r="4" stroke="#8777D9" strokeWidth="2" fill="none"/>
                                        <circle cx="24" cy="28" r="4" stroke="#8777D9" strokeWidth="2" fill="none"/>
                                        <path d="M22.5 22.5l3 3M25.5 22.5l-3 3" stroke="#8777D9" strokeWidth="2"/>
                                    </svg>
                                </div>
                                <h3 style={styles.featureTitle}>Team Collaboration</h3>
                                <p style={styles.featureDescription}>
                                    Connect with your team through comments, 
                                    mentions, and real-time updates.
                                </p>
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
        backgroundColor: 'rgba(65, 39, 161, 0.9)',
        border: '1px solid #DFE1E6',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#FFFFFF',
        transition: 'background-color 0.2s ease',
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
        gap: '32px',
    },
    // New styles for enhanced content
    heroSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid #DFE1E6',
        overflow: 'hidden',
    },
    heroContent: {
        display: 'flex',
        alignItems: 'center',
        padding: '40px',
        gap: '40px',
    },
    heroText: {
        flex: 1,
    },
    heroTitle: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#172B4D',
        margin: '0 0 16px 0',
        lineHeight: '1.2',
    },
    heroDescription: {
        fontSize: '16px',
        color: '#6B778C',
        margin: '0 0 24px 0',
        lineHeight: '1.5',
    },
    heroButton: {
        padding: '12px 24px',
        backgroundColor: '#0052CC',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
    },
    heroImage: {
        flexShrink: 0,
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
    },
    featureCard: {
        backgroundColor: '#FFFFFF',
        padding: '32px 24px',
        borderRadius: '8px',
        border: '1px solid #DFE1E6',
        textAlign: 'center',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
    },
    featureIcon: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
    },
    featureTitle: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#172B4D',
        margin: '0 0 12px 0',
    },
    featureDescription: {
        fontSize: '14px',
        color: '#6B778C',
        margin: '0',
        lineHeight: '1.5',
    },
};

export default Dashboard;