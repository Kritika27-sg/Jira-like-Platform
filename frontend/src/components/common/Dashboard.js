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
                info = "Project Managers can create and manage only the projects they own, create tasks within those projects, and assign tasks only to Developers.";
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
        <div className="min-h-screen bg-black flex flex-col overflow-hidden">
            {/* Animated Cursor */}
            <div
                className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
                style={{
                    left: mousePosition.x - 12,
                    top: mousePosition.y - 12,
                }}
            />

            {/* Enhanced Background */}
            <div className="fixed inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
                <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{ animationDelay: '4s' }}></div>

                {/* Floating Elements */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
            </div>

            {/* Header */}
            <header className="fixed w-full z-40 bg-black/80 backdrop-blur-2xl border-b border-white/10">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="relative">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                                    <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z" />
                                    </svg>
                                </div>
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
                            </div>
                            <span className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                                Jira
                            </span>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white/90">{user?.full_name}</p>
                                <p className="text-xs text-white/60">{formatTime(currentTime)}</p>
                            </div>
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                                {user?.full_name?.charAt(0)}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-white/60 hover:text-white transition-colors duration-300 flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base bg-transparent hover:bg-white/10 px-3 py-2 rounded-lg"
                            >
                                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 pt-16 sm:pt-20"> {/* Padding top to account for fixed header */}
                {/* Sidebar */}
                <aside className="w-64 lg:w-72 flex-shrink-0 bg-black/80 backdrop-blur-2xl border-r border-white/10 shadow-2xl overflow-y-auto">
                    <div className="p-4 sm:p-6 space-y-6">
                        {/* Role Section */}
                        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className={`px-3 py-2 rounded-lg bg-gradient-to-r ${getRoleColor(user?.role)} text-white text-xs font-semibold uppercase tracking-wider shadow-lg`}>
                                    {user?.role}
                                </div>
                                <button
                                    onClick={handleRoleInfo}
                                    className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200"
                                >
                                    <svg className={`w-4 h-4 transition-transform duration-200 ${showInfo ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>

                            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showInfo ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="p-4 bg-white/10 rounded-xl border border-white/20">
                                    <p className="text-sm text-gray-300 leading-relaxed">{roleInfo}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="space-y-3">
                            <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 px-3">Navigation</h3>
                            {navigationItems.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => navigate(item.path)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 group border border-white/10 hover:border-white/20 hover:shadow-lg"
                                    title={item.description}
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform duration-200 text-white">{item.icon}</span>
                                    <span className="text-sm font-medium text-white/80 group-hover:text-white">{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
                    {/* Welcome Section */}
                    <div className="mb-8 p-6 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10">
                        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent mb-2">
                            {getGreeting()}, {user?.full_name?.split(' ')[0]}!
                        </h1>
                        <p className="text-base sm:text-lg text-gray-300">Ready to tackle your {user?.role.toLowerCase()} tasks today?</p>
                    </div>

                    {/* Hero Section */}
                    <div className="mb-8 p-6 sm:p-8 lg:p-10 bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                            <div className="space-y-6">
                                <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight">
                                    Supercharge Your
                                    <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                                        Productivity
                                    </span>
                                </h2>
                                <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                                    Transform your workflow with intelligent project management tools designed to help teams collaborate seamlessly and deliver exceptional results.
                                </p>
                            </div>

                            <div className="relative">
                                <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/10">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            <div className="h-2 bg-white/20 rounded flex-1"></div>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-lg"></div>
                                            <div className="h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-lg"></div>
                                            <div className="h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg shadow-lg"></div>
                                        </div>
                                        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full w-3/4 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl"></div>
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-green-400/20 rounded-full blur-2xl"></div>
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
                                className="group bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                            >
                                <div className="mb-4">
                                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3 group-hover:text-white transition-colors duration-200">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-200">
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