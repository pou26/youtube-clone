import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import axios from 'axios';
import './LoginForm.css';

const LoginPage = ({ isModal = false, onModalClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, register, loginWithGoogle, user, setUser, setToken } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
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
      const response = await axios.get('http://localhost:4000/user/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (response.data && response.data.status) {
        setUser(response.data.user);
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

  // Check for error param in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    
    if (errorParam) {
      if (errorParam === 'google_auth_failed') {
        setError('Google authentication failed. Please try again or use email login.');
      } else {
        setError('Authentication error. Please try again.');
      }
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    if (!isLogin && (!formData.userName || !formData.name)) {
      setError('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
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
            onModalClose(); // Close the modal if in modal mode
          } else {
            navigate('/'); // Navigate to home page
          }
        }
      } else {
        setError(result.message || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Authentication error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Google OAuth login 
  const handleGoogleLogin = (e) => {
    e.preventDefault();
    

    if (typeof loginWithGoogle === 'function') {
      loginWithGoogle();
    } else {
      
      window.location.href = 'http://localhost:4000/auth/google';
    }
  };

  return (
    <div className={isModal ? "login-page modal" : "login-page min-h-screen flex items-center justify-center bg-gray-100"}>
      <div className={isModal ? "login-container" : "bg-white p-8 rounded-lg shadow-md w-full max-w-md"}>
        <div className="login-form-container">
          <div className="login-header">
            <h1 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Sign In' : 'Create Account'}</h1>
            {isModal ? (
              <button className="close-btn" onClick={onModalClose}>×</button>
            ) : (
              <Link to="/" className="close-btn">×</Link>
            )}
          </div>
          
          {/* YouTube branding */}
          <div className="youtube-branding">
            <img src="/youtube.png" alt="YouTube" />
            <span>YouTube</span>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 error-message" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {/* Google Sign-in Button */}
          <div className="google-auth-container mt-4 mb-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-bold py-2 px-4 rounded flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full google-sign-in-btn"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
              </svg>
              <span>{isLogin ? 'Continue with Google' : 'Sign up with Google'}</span>
            </button>
            
            <div className="divider text-center my-4">
              <span>- OR -</span>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="form-fields">
            {!isLogin && (
              <>
                <div className="mb-4">
                  <label htmlFor="userName" className="block text-gray-700 text-sm font-bold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="userName"
                    name="userName"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Username"
                    value={formData.userName}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </>
            )}
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="********"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center form-footer">
            <span className="text-sm text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </span>
            <button
              className="text-blue-500 hover:text-blue-700 toggle-btn ml-2"
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

export default LoginPage;