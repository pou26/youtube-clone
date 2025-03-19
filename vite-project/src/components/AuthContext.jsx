import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000';
axios.defaults.baseURL = API_BASE_URL;

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = localStorage.getItem('accessToken');
        const savedUser = localStorage.getItem('user');
       
        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        }
      } catch (error) {
        console.error('Error restoring authentication state:', error);
      } finally {
        setLoading(false);
      }
    };
   
    loadUser();
  }, [token]);


  useEffect(() => {
    const handleOAuthRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      const userDataParam = urlParams.get('userData');
      
      if (tokenFromUrl) {
        // Store the token
        localStorage.setItem('accessToken', tokenFromUrl);
        setToken(tokenFromUrl);
        
        // Parse and store user data if available
        if (userDataParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userDataParam));
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
          } catch (error) {
            console.error('Error parsing user data from URL:', error);
            // Fetch user data if parsing fails
            fetchUserData(tokenFromUrl);
          }
        } else {
          // Fetch user data if not provided in URL
          fetchUserData(tokenFromUrl);
        }
        
        // Clean up URL after extracting parameters
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    
    const fetchUserData = async (authToken) => {
      try {
        const response = await axios.get('/user/me', {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (response.data.status && response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle authentication errors
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
      }
    };
    
    handleOAuthRedirect();
  }, []);



  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
     
      if (response.data.status) {
        const { accessToken, user } = response.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        setToken(accessToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return { success: true };
      }
      return { success: false, message: 'Login failed' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/user', userData);
      return { success: response.data.status, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };
  const loginWithGoogle = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const updateUserData = (userData) => {
    if (!userData) return;
    const updatedUser = { ...user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };
 
  return (
    <AuthContext.Provider value={{ 
      // handleOAuthRedirect,
      user, 
      token, 
      loading, 
      login, 
      logout, 
      register, 
      updateUserData,
      setUser,
      setToken,
      loginWithGoogle,
      isAuthenticated: !!token
      
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};