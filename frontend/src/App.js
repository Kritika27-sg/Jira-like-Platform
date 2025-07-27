import React, { Profiler } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/auth/LandingPage';
import Login from './components/auth/Login';
import Logout from './components/auth/Logout';
import Dashboard from './components/common/Dashboard';
import PrivateRoute from './components/common/PrivateRoute';
import Profile from './components/common/Profile';
import ProjectList from './components/projects/ProjectList';
import ProjectForm from './components/projects/ProjectForm';
import TaskList from './components/tasks/TaskList';
import TaskForm from './components/tasks/TaskForm';
import Dev_Tasks from './components/tasks/Dev_Tasks';
import UserList from './components/users/UserList';
import UserForm from './components/users/UserForm';
import CommentList from './components/comments/CommentList';
import ActivityLogList from './components/activityLog/ActivityLogList';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />

          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile/>
              </PrivateRoute>
            }
          />

          <Route
            path="/projects"
            element={
              <PrivateRoute>
                <ProjectList />
              </PrivateRoute>
            }
          />
          <Route
            path="/projects/new"
            element={
              <PrivateRoute>
                <ProjectForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <PrivateRoute>
                <TaskList />
              </PrivateRoute>
            }
          />
          <Route
            path="/tasks/new"
            element={
              <PrivateRoute>
                <TaskForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-tasks"
            element={
              <PrivateRoute>
                <Dev_Tasks />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <UserList />
              </PrivateRoute>
            }
          />
          <Route
            path="/users/new"
            element={
              <PrivateRoute>
                <UserForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/comments"
            element={
              <PrivateRoute>
                <CommentList />
              </PrivateRoute>
            }
          />
          <Route
            path="/activity-log"
            element={
              <PrivateRoute>
                <ActivityLogList />
              </PrivateRoute>
            }
          />
          
          {/* Catch all - redirect to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;