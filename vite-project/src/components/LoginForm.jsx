import React, { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import './LoginForm.css';

const LoginForm = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userName: '',
    name: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
          onClose();
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


  return (
    <div className="login-form-container">
      <div className="login-header">
        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      <div className="youtube-branding">
        <img src="youtube.png" alt="YouTube" />
        <span>YouTube</span>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
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
  );
};
export default LoginForm;
