import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import LoginForm from "./LoginForm";
import Search from "./Search";
import ChannelCreationForm from "./ChannelCreationForm";

const Navbar = ({ toggleSidebar }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const { user, logout,updateUserData } = useContext(AuthContext);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  
  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle successful channel creation
  const handleChannelCreated = (channelData) => {
    setShowChannelForm(false);
    
    
    
    // Update user context with channel information
    if (channelData) {
      updateUserData({ 
        channel: channelData 
      });
    }
    console.log('Channel created:', channelData);
  };
  
  // Handle view channel button click - now includes both channelId and userId in the URL
  const handleViewChannel = () => {
    if (user && user.channel) {
      setShowUserMenu(false);
      // Navigate to channel page with both channelId and userId as required by the backend
      navigate(`/channel/${user.channel._id}/${user._id}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black h-14 flex items-center justify-between px-4 z-50 border-b border-gray-200">
        {/* Left section */}
        <div className="flex items-center">
          <button 
            className="w-10 h-10 flex flex-col justify-center items-center rounded-full hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-5 h-0.5 bg-gray-600"></div>
          </button>
          
          <Link to="/" className="flex items-center ml-4">
            <img src="youtube.png" alt="logo" className="h-6" />
            <span className="ml-1 font-semibold text-xl">YouTube</span>
            <sup className="text-xs ml-1">IN</sup>
          </Link>
        </div>
        
        {/* Middle section */}
        <div className="flex-grow mx-10 max-w-2xl">
          <Search />
        </div>
        
        {/* Right section */}
        <div className="flex items-center space-x-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
            <span className="text-xl">📹</span>
          </button>
          
          <div className="relative">
            <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
              <span className="text-xl">🔔</span>
            </button>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              9+
            </div>
          </div>
          
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <div 
                className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-lg font-medium">{user.name.charAt(0)}</span>
                )}
              </div>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-black rounded-lg shadow-lg overflow-hidden z-50">
                  {/* User info section */}
                  <div className="p-4 border-b">
                    <div className="flex items-start space-x-4">
                      {/* Avatar */}
                      <div className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white flex-shrink-0">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-lg font-medium">{user.name.charAt(0)}</span>
                        )}
                      </div>
                      
                      {/* User details */}
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">@{user.userName}</div>
                        <div className="mt-1">
                          {/* Changed button text based on whether user has a channel */}
                          {user.channel ? (
                            <button 
                              onClick={handleViewChannel}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View your channel
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setShowChannelForm(true);
                                setShowUserMenu(false);
                              }}
                              className="text-sm text-blue-600 hover:underline"
                            >
                              Create your channel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu items section */}
                  <div className="py-2">
                    <div className="px-4 py-2 text-sm text-gray-500">{user.email}</div>
                    <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-gray-500 hover:text-black">
                      Settings
                    </Link>
                    <button 
                      onClick={logout} 
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-500 hover:text-black"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className="flex items-center space-x-2 text-blue-600 border border-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-50"
              onClick={() => setShowLoginForm(true)}
            >
              <span className="text-lg">👤</span>
              <span className="font-medium">Sign in</span>
            </button>
          )}
        </div>
      </nav>
      
      {/* Add spacer for fixed navbar */}
      <div className="h-14"></div>
      
      {showLoginForm && (
        <>
          {/* Semi-transparent overlay with blur effect */}
          <div 
            className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-40"
            onClick={() => setShowLoginForm(false)}
          ></div>
          
          {/* Centered login form */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 shadow-2xl">
            <LoginForm onClose={() => setShowLoginForm(false)} />
          </div>
        </>
      )}

      {/* Channel Creation Form */}
      {showChannelForm && user && (
        <ChannelCreationForm
          userId={user._id}
          onSuccess={handleChannelCreated}
          onCancel={() => setShowChannelForm(false)}
        />
      )}
    </>
  );
};

export default Navbar;