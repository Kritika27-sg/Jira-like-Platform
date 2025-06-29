import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [roleInfo, setRoleInfo] = useState('');
    const [showInfo, setShowInfo] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // Track mouse position for subtle parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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
            case 'Project Manager': return 'from-blue-500 to-blue-600';
            case 'Developer': return 'from-green-500 to-green-600';
            case 'Client': return 'from-purple-500 to-purple-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getNavigationItems = () => {
        const baseItems = [
            { icon: '👤', label: 'Profile', path: '/profile', description: 'View and edit your profile' }
        ];

        let roleSpecificItems = [];
        switch (user?.role) {
            case 'Project Manager':
                roleSpecificItems = [
                    { icon: '📋', label: 'Projects', path: '/projects', description: 'Manage your projects' },
                    { icon: '✅', label: 'Tasks', path: '/tasks', description: 'View and assign tasks' }
                ];
                break;
            case 'Developer':
                roleSpecificItems = [
                    { icon: '📋', label: 'Projects', path: '/projects', description: 'All available projects' },
                    { icon: '💻', label: 'My Tasks', path: '/my-tasks', description: 'Tasks assigned to you' }
                ];
                break;
            case 'Client':
                roleSpecificItems = [
                    { icon: '📈', label: 'Progress', path: '/activity-log', description: 'Track project status' },
                    { icon: '💬', label: 'Comments', path: '/comments', description: 'View and add feedback' }
                ];
                break;
            default:
                roleSpecificItems = [];
        }

        return [...baseItems, ...roleSpecificItems];
    };

    const navigationItems = getNavigationItems();

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getGreeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 font-sans">
            {/* Animated Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div 
                    className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"
                    style={{
                        transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`
                    }}
                />
                <div 
                    className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
                    style={{
                        transform: `translate(${-mousePosition.x * 0.01}px, ${-mousePosition.y * 0.01}px)`
                    }}
                />
            </div>

            {/* Header */}
            <header className="relative backdrop-blur-md bg-white/80 border-b border-white/20 shadow-sm">
                <div className="px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <div className="w-6 h-6 bg-white/90 rounded mask-gradient"></div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                Jira
                            </h1>
                            <p className="text-xs text-gray-500">{formatTime(currentTime)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-800">{user?.full_name}</p>
                        </div>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                            {user?.full_name?.charAt(0)}
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Enhanced Sidebar */}
                <aside className="w-72 backdrop-blur-md bg-white/70 border-r border-white/20 min-h-screen shadow-xl">
                    <div className="p-6 space-y-6">
                        {/* Role Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${getRoleColor(user?.role)} text-white text-xs font-semibold uppercase tracking-wider shadow-lg`}>
                                    {user?.role}
                                </div>
                                <button 
                                    onClick={handleRoleInfo}
                                    className="p-2 rounded-lg hover:bg-white/50 transition-all duration-200 text-gray-600 hover:text-gray-800"
                                >
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${showInfo ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showInfo ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                    <p className="text-sm text-gray-700 leading-relaxed">{roleInfo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-2">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Navigation</h3>
                            {navigationItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-gray-50 transition-all duration-200 group border border-gray-200 hover:border-gray-300 hover:shadow-md"
                                    title={item.description}
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{item.label}</span>
                                </button>
                            ))}
                        </nav>

                        {/* Sign Out */}
                        <div className="pt-4 border-t border-gray-200/50">
                            <button 
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white hover:bg-red-50 transition-all duration-200 group text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 hover:shadow-md"
                            >
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-600 bg-clip-text text-transparent mb-2">
                            {getGreeting()}, {user?.full_name?.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-lg text-gray-600">Ready to tackle your {user?.role.toLowerCase()} tasks today?</p>
                    </div>

                    {/* Hero Section */}
                    <div className="mb-8 backdrop-blur-sm bg-white/60 rounded-3xl border border-white/30 shadow-xl overflow-hidden">
                        <div className="p-8 lg:p-12">
                            <div className="grid lg:grid-cols-2 gap-8 items-center">
                                <div className="space-y-6">
                                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 leading-tight">
                                        Supercharge Your 
                                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Productivity</span>
                                    </h2>
                                    <p className="text-lg text-gray-600 leading-relaxed">
                                        Transform your workflow with intelligent project management tools designed to help teams collaborate seamlessly and deliver exceptional results.
                                    </p>
                                </div>
                                
                                <div className="relative">
                                    <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/50">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                                <div className="h-2 bg-gray-200 rounded flex-1"></div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                <div className="h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-lg"></div>
                                                <div className="h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-lg"></div>
                                                <div className="h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg shadow-lg"></div>
                                            </div>
                                            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-3/4 animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-2xl"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: "📊",
                                title: "Project Management",
                                description: "Organize and track your projects with intuitive boards, timelines, and progress indicators.",
                                color: "from-blue-500 to-cyan-500"
                            },
                            {
                                icon: "✅",
                                title: "Task Tracking",
                                description: "Create, assign, and monitor tasks with detailed status updates and deadline management.",
                                color: "from-green-500 to-emerald-500"
                            },
                            {
                                icon: "👥",
                                title: "Team Collaboration",
                                description: "Connect with your team through comments, mentions, and real-time updates.",
                                color: "from-purple-500 to-pink-500"
                            },
                            {
                                icon: "📈",
                                title: "Analytics & Reports",
                                description: "Gain insights with comprehensive analytics and customizable reporting tools.",
                                color: "from-orange-500 to-red-500"
                            },
                            {
                                icon: "🔔",
                                title: "Smart Notifications",
                                description: "Stay updated with intelligent notifications and priority alerts.",
                                color: "from-indigo-500 to-purple-500"
                            },
                            {
                                icon: "🚀",
                                title: "Performance Boost",
                                description: "Optimize your workflow with AI-powered suggestions and automation.",
                                color: "from-teal-500 to-blue-500"
                            }
                        ].map((feature, index) => (
                            <div 
                                key={index}
                                className="group backdrop-blur-sm bg-white/60 rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                <div className="mb-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-gray-900 transition-colors duration-200">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-200">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;