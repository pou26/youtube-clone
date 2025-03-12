import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          
          // Set default Authorization header for all requests
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Optional: Validate token with a backend call
          try {
            // This helps ensure the token is still valid
            await axios.get('/auth/validate-token');
          } catch (error) {
            console.warn('Token validation failed, logging out');
            logout();
          }
        }
      } catch (error) {
        console.error('Error restoring authentication state:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await axios.post('/login', { email, password });
      
      if (response.data.status) {
        const { accessToken, user } = response.data;
        
        // Save to localStorage
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Set in state
        setUser(user);
        
        // Set default Authorization header
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

  // Register function
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

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  // Add a function to update user data (for when channel is created/updated)
  const updateUserData = (userData) => {
    if (!userData) return;
    
    // Update localStorage
    const updatedUser = {...user, ...userData};
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Update state
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      register, 
      logout, 
      updateUserData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};