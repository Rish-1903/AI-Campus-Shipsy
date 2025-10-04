import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { testConnection } from './services/api';
import Login from './components/Login';
import TaskList from './components/TaskList';
import './App.css';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  console.log('🛡️ ProtectedRoute check:', {
    isAuthenticated,
    currentPath: location.pathname
  });

  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ Access granted to protected route');
  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('📍 AppContent location changed:', location.pathname);
    
    // Test backend connection on app start
    testConnection();
  }, [location]);

  useEffect(() => {
    console.log('🔄 Auth state changed:', { isAuthenticated, user: user?.username });
    
    // If user just logged in and is on login page, redirect to tasks
    if (isAuthenticated && location.pathname === '/login') {
      console.log('🔄 Redirecting to tasks after login');
      navigate('/tasks', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      {isAuthenticated && (
        <header className="app-header">
          <h1>AI Campus Task Manager</h1>
          <div className="user-info">
            <span>Welcome, {user?.username}!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </header>
      )}
      
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/tasks" replace />
            ) : (
              <Login />
            )
          } 
        />
        <Route 
          path="/tasks" 
          element={
            <ProtectedRoute>
              <TaskList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/tasks" : "/login"} replace />
          } 
        />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
