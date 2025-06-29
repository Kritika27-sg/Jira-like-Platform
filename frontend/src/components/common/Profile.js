import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [originalData, setOriginalData] = useState({});

    // Track mouse position for subtle parallax effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    useEffect(() => {
        if (user) {
            const userData = {
                full_name: user.full_name || '',
                email: user.email || '',
                password: '',
                confirmPassword: ''
            };
            setFormData(userData);
            setOriginalData(userData);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        const errors = [];

        if (!formData.full_name.trim()) {
            errors.push('Full name is required');
        }

        if (!formData.email.trim()) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Only validate password if it's being changed
        if (formData.password) {
            if (formData.password.length < 8) {
                errors.push('Password must be at least 8 characters long');
            }
            if (!/(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(formData.password)) {
                errors.push('Password must contain at least one lowercase letter, one number, and one special character');
            }
            if (formData.password !== formData.confirmPassword) {
                errors.push('Passwords do not match');
            }
        }

        return errors;
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage('');
        
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setMessage(validationErrors.join('. '));
            setMessageType('error');
            setLoading(false);
            setTimeout(() => setMessage(''), 5000);
            return;
        }
        
        try {
            // Prepare data to send (exclude confirmPassword and empty password)
            const updateData = {
                full_name: formData.full_name,
                email: formData.email
            };

            // Only include password if it's being changed
            if (formData.password) {
                updateData.password = formData.password;
            }

            // Simulate API call - replace with your actual API endpoint
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update user context (you'll need to implement this in your AuthContext)
            if (updateUser) {
                updateUser({
                    ...user,
                    full_name: formData.full_name,
                    email: formData.email
                });
            }
            
            // Reset password fields after successful update
            const updatedData = {
                ...formData,
                password: '',
                confirmPassword: ''
            };
            setFormData(updatedData);
            setOriginalData(updatedData);
            setIsEditing(false);
            setMessage('Profile updated successfully!');
            setMessageType('success');
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            setMessage('Error updating profile. Please try again.');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            ...originalData,
            password: '',
            confirmPassword: ''
        });
        setIsEditing(false);
        setMessage('');
        setShowPassword(false);
        setShowConfirmPassword(false);
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Project Manager': return 'from-blue-500 to-blue-600';
            case 'Developer': return 'from-green-500 to-green-600';
            case 'Client': return 'from-purple-500 to-purple-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const togglePasswordVisibility = (field) => {
        if (field === 'password') {
            setShowPassword(!showPassword);
        } else {
            setShowConfirmPassword(!showConfirmPassword);
        }
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
                <div className="px-6 py-4 flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="p-2 rounded-xl bg-white/60 hover:bg-white/80 border border-white/30 transition-all duration-200 hover:shadow-md group"
                        title="Go back"
                    >
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-gray-800 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                        Profile Settings
                    </h1>
                </div>
            </header>

            {/* Message */}
            {message && (
                <div className={`mx-6 mt-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                    messageType === 'success' 
                        ? 'bg-green-50/80 border-green-200 text-green-800' 
                        : 'bg-red-50/80 border-red-200 text-red-800'
                }`}>
                    <div className="flex items-center gap-2">
                        {messageType === 'success' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                </div>
            )}

            <div className="p-6 max-w-3xl mx-auto space-y-6">
                {/* Profile Card */}
                <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg overflow-hidden">
                    {/* Avatar Section */}
                    <div className="p-6 bg-gradient-to-br from-white/50 to-gray-50/50 border-b border-white/30">
                        <div className="flex flex-col lg:flex-row items-center gap-6">
                            <div className="relative">
                                <div className={`w-20 h-20 bg-gradient-to-br ${getRoleColor(user?.role)} rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-xl border-4 border-white/50`}>
                                    {getInitials(user?.full_name || 'U')}
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-3 border-white animate-pulse"></div>
                            </div>
                            <div className="text-center lg:text-left space-y-2">
                                <h2 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                    {user?.full_name}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Divider Line */}
                    <div className="border-t border-gray-200/50"></div>

                    {/* Profile Information */}
                    <div className="p-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Personal Information</h3>
                            {!isEditing ? (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-3">
                                    <button 
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-4 py-2 bg-white/60 text-gray-700 rounded-lg border border-gray-200 hover:bg-white/80 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
                                        placeholder="Enter your full name"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50/60 rounded-lg border border-gray-200/50 text-gray-800">
                                        {formData.full_name || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">Email</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
                                        placeholder="Enter your email"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50/60 rounded-lg border border-gray-200/50 text-gray-800">
                                        {formData.email || 'Not provided'}
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-gray-700">
                                    Change Password 
                                    {isEditing && <span className="text-xs font-normal text-gray-500 italic ml-2">(Leave blank to keep current password)</span>}
                                </label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                name="password"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 pr-10 bg-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('password')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                                title={showPassword ? "Hide password" : "Show password"}
                                            >
                                                {showPassword ? (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-600">
                                            Password must be at least 8 characters with lowercase, number, and special character
                                        </p>
                                    </div>
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50/60 rounded-lg border border-gray-200/50 text-gray-800">
                                        ••••••••
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            {isEditing && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-gray-700">Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 pr-10 bg-white/60 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-200 disabled:opacity-50"
                                            placeholder="Confirm new password"
                                            disabled={!formData.password}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200 disabled:opacity-50"
                                            title={showConfirmPassword ? "Hide password" : "Show password"}
                                            disabled={!formData.password}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="backdrop-blur-sm bg-white/60 rounded-2xl border border-white/30 shadow-lg p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Account Information</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                            <span className="text-sm font-semibold text-gray-600">User ID:</span>
                            <span className="text-sm font-medium text-gray-800 bg-gray-100/60 px-2 py-1 rounded">
                                {user?.id || 'N/A'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b border-gray-200/50">
                            <span className="text-sm font-semibold text-gray-600">Role:</span>
                            <div className={`px-2 py-1 rounded bg-gradient-to-r ${getRoleColor(user?.role)} text-white text-sm font-semibold`}>
                                {user?.role}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;