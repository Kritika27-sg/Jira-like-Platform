import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeRole, setActiveRole] = useState('manager');
  const [isScrolled, setIsScrolled] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hoveredFeature, setHoveredFeature] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/login');
  };

  const roles = {
    manager: {
      title: 'Project Manager',
      description: 'Orchestrate teams, drive results, and deliver exceptional project outcomes with AI-powered insights',
      features: ['AI-powered project analytics', 'Advanced team orchestration', 'Real-time progress monitoring', 'Strategic resource allocation'],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      color: 'from-violet-500 via-purple-500 to-fuchsia-500',
      bgColor: 'from-violet-500/20 to-fuchsia-500/20'
    },
    developer: {
      title: 'Developer',
      description: 'Code with confidence using intelligent task management and seamless collaboration tools',
      features: ['Smart code integration', 'Automated progress tracking', 'Intelligent task prioritization', 'Enhanced code review workflow'],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      color: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgColor: 'from-emerald-500/20 to-cyan-500/20'
    },
    client: {
      title: 'Client',
      description: 'Stay connected with real-time insights and transparent project visibility at every stage',
      features: ['Real-time project insights', 'Interactive progress dashboards', 'Seamless feedback integration', 'Advanced reporting analytics'],
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'from-rose-500 via-pink-500 to-orange-500',
      bgColor: 'from-rose-500/20 to-orange-500/20'
    }
  };

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: 'AI-Powered Automation',
      description: 'Intelligent task assignment and progress prediction using advanced machine learning algorithms.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Advanced Analytics',
      description: 'Deep insights into team performance, project health, and predictive delivery timelines.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: 'Real-time Sync',
      description: 'Instant collaboration with live updates, smart notifications, and seamless communication.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      title: 'Intuitive Design',
      description: 'Beautifully crafted interface that adapts to your workflow and enhances productivity.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      title: 'Enterprise Security',
      description: 'Bank-level encryption, SOC 2 compliance, and advanced access controls for complete peace of mind.',
      color: 'from-red-500 to-rose-600'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Smart Integrations',
      description: 'Connect with 500+ tools including GitHub, Slack, Figma, and your favorite development stack.',
      color: 'from-teal-500 to-cyan-600'
    }
  ];

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Animated Cursor */}
      <div 
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full pointer-events-none z-50 mix-blend-difference opacity-50 transition-transform duration-150 ease-out"
        style={{
          left: mousePosition.x - 12,
          top: mousePosition.y - 12,
          transform: hoveredFeature !== null ? 'scale(2)' : 'scale(1)'
        }}
      />

      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-2xl border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z"/>
                  </svg>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              </div>
              <span className={`text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent ${
                isScrolled ? 'text-white' : 'text-white'
              }`}>
                Jira
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignUp}
                className="relative px-8 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold rounded-2xl overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-2xl"
              >
                <span className="relative z-10">Sign In</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition-opacity duration-300"></div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Enhanced Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse opacity-40" style={{animationDelay: '4s'}}></div>
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-20 w-4 h-4 bg-white/20 rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
          <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400/30 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
          <div className="absolute bottom-32 left-1/4 w-5 h-5 bg-pink-400/20 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full text-white text-sm font-medium mb-8 hover:bg-white/10 transition-all duration-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Trusted by 50,000+ teams worldwide</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-tight">
            <span className="block">Project Management</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-pulse">
              Reimagined
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-16 max-w-4xl mx-auto leading-relaxed">
            Experience the future of project management with AI-powered insights, seamless collaboration, and intuitive design that adapts to your team's unique workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <button
              onClick={handleSignUp}
              className="relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-bold text-xl rounded-2xl overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <span className="relative z-10 flex items-center space-x-2">
                <span>Start Your Journey</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Enhanced Task Status Preview */}
          <div className="flex justify-center space-x-6 mb-8">
            {[
              { status: 'To Do', color: 'from-gray-500 to-gray-600', icon: '📝' },
              { status: 'In Progress', color: 'from-blue-500 to-indigo-600', icon: '⚡' },
              { status: 'Done', color: 'from-green-500 to-emerald-600', icon: '✨' }
            ].map((item, index) => (
              <div key={index} className="group">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-4 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{item.icon}</div>
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${item.color}`}></div>
                    <span className="text-white font-semibold">{item.status}</span>
                    <div className={`bg-gradient-to-r ${item.color} text-white text-sm px-3 py-1 rounded-full font-bold`}>
                      {item.count}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Features Section */}
      <section className="py-32 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              Built for <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Every Role</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Our intelligent platform adapts to your role, providing personalized experiences for Project Managers, Developers, and Clients.
            </p>
          </div>

          {/* Enhanced Role Selector */}
          <div className="flex justify-center mb-16">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-2 shadow-2xl border border-white/10">
              {Object.entries(roles).map(([key, role]) => (
                <button
                  key={key}
                  onClick={() => setActiveRole(key)}
                  className={`px-8 py-4 rounded-2xl font-bold transition-all duration-300 relative overflow-hidden ${
                    activeRole === key
                      ? `bg-gradient-to-r text-white shadow-xl transform scale-105 ${role.color}`
                      : 'text-white bg-black hover:text-white hover:bg-gray-900'
                  }`}
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <div className="transform transition-transform duration-300 hover:scale-110">
                      {role.icon}
                    </div>
                    <span>{role.title}</span>
                  </span>
                  {activeRole === key && (
                    <div className="absolute -inset-1 bg-gradient-to-r opacity-30 rounded-2xl blur"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Enhanced Active Role Display */}
          <div className="relative">
            <div className={`absolute -inset-1 bg-gradient-to-r ${roles[activeRole].color} rounded-3xl blur opacity-20`}></div>
            <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-12">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-r ${roles[activeRole].color} text-white mb-8 shadow-2xl transform hover:rotate-12 transition-all duration-300`}>
                    <div className="scale-125">
                      {roles[activeRole].icon}
                    </div>
                  </div>
                  <h3 className="text-4xl font-black text-white mb-6">
                    {roles[activeRole].title}
                  </h3>
                  <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                    {roles[activeRole].description}
                  </p>
                  <ul className="space-y-6">
                    {roles[activeRole].features.map((feature, index) => (
                      <li key={index} className="flex items-center space-x-4 group">
                        <div className={`w-8 h-8 bg-gradient-to-r ${roles[activeRole].color} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg transform group-hover:scale-110 transition-all duration-300`}>
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-200 font-semibold text-lg group-hover:text-white transition-colors duration-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative">
                  <div className={`absolute -inset-4 bg-gradient-to-r ${roles[activeRole].bgColor} rounded-3xl blur-xl`}></div>
                  <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl rounded-3xl p-12 h-96 flex items-center justify-center border border-white/10">
                    <div className="text-center">
                      <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${roles[activeRole].color} flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-110 transition-all duration-300`}>
                        <div className="scale-150 text-white">
                          {roles[activeRole].icon}
                        </div>
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-3">
                        {roles[activeRole].title} Dashboard
                      </h4>
                      <p className="text-gray-400 text-lg">
                        Personalized interface designed for your workflow
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-32 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Powerful Features</span> for Modern Teams
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to revolutionize your project management experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="group relative"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`absolute -inset-1 bg-gradient-to-r ${feature.color} rounded-3xl blur opacity-0 group-hover:opacity-20 transition-all duration-500`}></div>
                <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 transform hover:scale-105 border border-white/10 h-full">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl transform group-hover:rotate-12 transition-all duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-pink-900 to-orange-900"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/30 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/20 rounded-full filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-black text-white mb-8">
            Ready to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">Transform</span> Your Workflow?
          </h2>
          <p className="text-2xl text-purple-100 mb-12 leading-relaxed">
            Join thousands of teams who have revolutionized their project management with our cutting-edge platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <button
              onClick={handleSignUp}
              className="relative px-12 py-6 bg-white text-purple-700 font-black text-xl rounded-2xl overflow-hidden group transform hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <span className="relative z-10 flex items-center space-x-3">
                <span>Start Free Trial</span>
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center space-x-8 opacity-70">
            <div className="flex items-center space-x-2 text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">SOC 2 Certified</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-white">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold">99.9% Uptime</span>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-black border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h6v6H3V3zm0 8h6v6H3v-6zm8-8h6v6h-6V3zm0 8h6v6h-6v-6z"/>
                    </svg>
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl blur opacity-30"></div>
                </div>
                <span className="text-3xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Jira
                </span>
              </div>
              <p className="text-gray-400 text-lg leading-relaxed mb-6 max-w-md">
                Revolutionizing project management with AI-powered insights and seamless collaboration for modern teams.
              </p>
              <div className="flex space-x-4">
                {['twitter', 'linkedin', 'github'].map((social) => (
                  <button key={social} className="w-12 h-12 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center transition-all duration-300 group border border-white/10">
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 3.175-2.178 3.931-.542.319-1.157.475-1.85.475-.526 0-1.028-.081-1.501-.244.617-.809 1.086-1.768 1.393-2.85.184-.649.242-1.335.242-2.035 0-.758-.081-1.494-.242-2.196-.323-1.401-.973-2.517-1.868-3.281-.449-.383-.94-.677-1.475-.883C9.609 1.016 9.07.914 8.515.914c-.669 0-1.315.129-1.929.384-.613.256-1.193.615-1.729 1.077-.537.463-.974 1.015-1.315 1.655-.341.641-.511 1.352-.511 2.135 0 .697.123 1.355.369 1.973.245.618.597 1.162 1.054 1.632.228.235.483.44.763.617.279.176.593.317.938.421-.175.070-.336.158-.484.265-.147.107-.269.244-.367.412-.098.168-.147.364-.147.588 0 .146.021.281.062.403.041.123.107.234.196.334.089.099.207.174.352.226.146.052.32.078.523.078.842 0 1.462-.156 1.859-.467.397-.312.596-.772.596-1.383 0-.456-.074-.843-.223-1.161-.148-.318-.354-.563-.617-.736.263-.117.474-.274.632-.47.158-.196.237-.435.237-.716 0-.065-.007-.127-.021-.185-.014-.058-.035-.11-.062-.157.456-.081.808-.235 1.055-.462.246-.227.37-.533.37-.92 0-.546-.171-.966-.511-1.258-.341-.293-.784-.439-1.329-.439-.351 0-.669.058-.954.175-.285.117-.534.281-.747.492-.213.211-.381.463-.505.756-.123.293-.185.616-.185.969 0 .117.014.23.041.339.028.109.074.206.138.291-.333.023-.602.126-.808.308-.205.182-.308.444-.308.785 0 .651.246 1.189.738 1.615.491.425 1.155.638 1.991.638.912 0 1.632-.213 2.16-.64.528-.426.792-.99.792-1.692 0-.585-.155-1.054-.466-1.406-.311-.352-.753-.528-1.329-.528-.351 0-.65.070-.896.211-.246.141-.37.343-.37.604 0 .234.062.43.185.588.123.158.295.237.516.237.175 0 .333-.041.474-.123.14-.082.211-.203.211-.362 0-.099-.028-.18-.083-.243-.056-.062-.119-.093-.19-.093-.036 0-.067.007-.093.021-.026.014-.039.042-.039.084 0 .028.011.049.032.062.021.014.032.035.032.062 0 .042-.018.074-.053.097-.035.023-.081.035-.138.035-.105 0-.193-.035-.263-.105-.070-.070-.105-.168-.105-.294 0-.175.053-.315.158-.42.105-.105.259-.158.462-.158.246 0 .442.070.588.211.145.140.218.336.218.588 0 .304-.088.549-.263.735-.175.185-.421.278-.738.278-.456 0-.808-.099-1.055-.296-.246-.197-.37-.479-.37-.844 0-.421.129-.747.387--.978.258-.232.614-.347 1.069-.347.596 0 1.065.158 1.406.474.341.316.511.753.511 1.309z"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'Security', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3">
                {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-gray-400">
                © 2025 Jira Project Management. All rights reserved.
              </p>
              <div className="flex space-x-6">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                  <a key={item} href="#" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;