import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'import.meta.env.VITE_BACKEND_URL';
axios.defaults.baseURL = API_BASE_URL;

export const AuthContext = createContext(null);   //creates an authentication context.used to share authentication data globally.

export const AuthProvider = ({ children }) => {     //wraps entire application to provide authentication state to child components.

  const [user, setUser] = useState(null);   //null if not logged in
  const [token, setToken] = useState(localStorage.getItem('accessToken'));  //gets the stored auth token from localStorage.
  const [loading, setLoading] = useState(true);

  //Load User Data on Mount

  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedToken = localStorage.getItem('accessToken'); //retrieves latest value from localStorage,otherwise usestate accesstoken is enough
        const savedUser = localStorage.getItem('user');
       
        if (savedToken && savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          setToken(savedToken);   //if the token in localStorage has changed since initialization we need this,otherwise it'll cause re-render
          axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;    //Adds Auth header to Axios for future requests.
        }
      } catch (error) {
        console.error('Error restoring authentication state:', error);
      } finally {
        setLoading(false);
      }
    };
   
    loadUser();
  }, [token]);  //token dependency can be removed,it'll trigger a re-render due to useState

  useEffect(() => {
    const handleOAuthRedirect = () => {   //extracts auth data (token & user data) from the URL query parameters.
      const urlParams = new URLSearchParams(window.location.search); //converts extracted query parameters from the URL to an object
      const tokenFromUrl = urlParams.get('token');  //we can get the token after converting into an object
      const userDataParam = urlParams.get('userData');
      
      if (tokenFromUrl) {
        // Store the token
        localStorage.setItem('accessToken', tokenFromUrl);
        setToken(tokenFromUrl);   //Update state (token),immediately reflects the login status.
        
        // Parse and store user data if available
        if (userDataParam) {
          try {
            const userData = JSON.parse(decodeURIComponent(userDataParam));   // Converts userDataParam to JSON string,then into a JS object.
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
        window.history.replaceState({}, document.title, window.location.pathname);    //removes the token from the URL after storing.
      }
    };

    //If user data is not provided in the URL,fetch from backend API.
    
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
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;   //global configuration object in Axios.Auth will apply to all requests made using Axios.
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
    const updatedUser = { ...user, ...userData };   //keep old user objects while updates userData object
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
      isAuthenticated: !!token    //isAuthenticated: token ? true : false
      
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