import React, { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from './AuthContext'; // Adjust the import path as needed

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUserWithToken } = useContext(AuthContext);
 
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get token and user data from URL params
        const token = searchParams.get('token');
        const userStr = searchParams.get('user');
       
        if (!token || !userStr) {
          console.error('Missing authentication data');
          navigate('/login?error=Authentication failed');
          return;
        }
       
        // Parse the user data
        const user = JSON.parse(decodeURIComponent(userStr));
       
        // Update auth context
        setUserWithToken(user, token);
       
        // Redirect to home or intended page
        navigate('/');
      } catch (error) {
        console.error('Error processing authentication:', error);
        navigate('/login?error=Authentication failed');
      }
    };
   
    handleAuthCallback();
  }, [searchParams, navigate, setUserWithToken]);
 
  return (
    <div className="auth-callback-container">
      <div className="loading-spinner"></div>
      <p>Completing authentication...</p>
    </div>
  );
};

export default AuthCallback;