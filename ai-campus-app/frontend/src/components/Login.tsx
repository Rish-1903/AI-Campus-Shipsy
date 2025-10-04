import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to tasks
  React.useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to tasks');
      navigate('/tasks', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        console.log('🔄 Attempting login...');
        await login(formData.username, formData.password);
        // The redirect will happen automatically via the useEffect in AppContent
      } else {
        console.log('🔄 Attempting registration...');
        await register(formData.username, formData.password, formData.email);
        // After successful registration, switch to login
        setError('Registration successful! Please login.');
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', email: '' }));
      }
    } catch (err: any) {
      console.error('❌ Auth error:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({
      username: '',
      password: '',
      email: ''
    });
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isLogin ? 'Login' : 'Register'}</h2>
        
        {error && (
          <div className={`message ${error.includes('successful') ? 'success-message' : 'error-message'}`}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required={!isLogin}
                placeholder="Enter your email"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              minLength={3}
            />
          </div>
          
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <p className="switch-mode">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={switchMode}
            className="link-button"
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
