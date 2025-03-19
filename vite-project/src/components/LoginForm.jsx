import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import './LoginForm.css';

const LoginForm = ({ isModal = false, onModalClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { login, register, user, setUser, setToken } = useContext(AuthContext);
  
  // Check for token in URL (for Google OAuth redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const accessToken = params.get('accessToken');
    
    if (accessToken) {
      // Store the token
      localStorage.setItem('accessToken', accessToken);
      setToken(accessToken);
      
      // Fetch user data
      fetchUserData(accessToken);
      
      // Clean up URL
      navigate('/', { replace: true });
    }
  }, [location, navigate, setToken]);
  
  // Fetch user data with token
  const fetchUserData = async (accessToken) => {
    try {
      const response = await fetch('http://localhost:4000/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      const data = await response.json();
      
      if (data.status) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

// In LoginForm.js, modify the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  
  try {
    let result;
    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await register(formData);
    }
    
    if (result.success) {
      if (!isLogin) {
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
        setError("Registration successful! You can now login.");
      } else {
        if (isModal && onModalClose) {
          onModalClose(); // Close the modal first
        }
        navigate('/'); // Then navigate to home page
      }
    } else {
      setError(result.message);
    }
  } catch (err) {
    setError('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = 'http://localhost:4000/auth/google';
  };
  
  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-form-container">
        <div className="login-header">
    <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
    {isModal ? (
      <button className="close-btn" onClick={onModalClose}>×</button>
    ) : (
      <Link to="/" className="close-btn">×</Link>
    )}
  </div>
          
          <div className="youtube-branding">
            <img src="/youtube.png" alt="YouTube" />
            <span>YouTube</span>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {/* Google Sign-in Button */}
          <div className="google-auth-container">
            <button 
              onClick={handleGoogleLogin}
              className="google-sign-in-btn"
              type="button"
            >
              <img src="/google-icon.png" alt="Google" className="google-icon" />
              <span>{isLogin ? 'Sign in with Google' : 'Sign up with Google'}</span>
            </button>
            
            <div className="divider">
              <span>or</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="form-fields">
              {!isLogin && (
                <>
                  <input
                    type="text"
                    name="userName"
                    placeholder="Username"
                    value={formData.userName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                  <input
                    type="text"
                    name="name"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </>
              )}
              
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>
          
          <div className="form-footer">
            <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
            <button
              className="toggle-btn"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;