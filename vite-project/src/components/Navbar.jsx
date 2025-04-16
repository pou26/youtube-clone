import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import LoginForm from "./LoginForm";
import Search from "./Search";
import ChannelCreationForm from "./ChannelCreationForm";
import { useSearch } from './SearchContext';
import LoginModal from './LoginModal';

const Navbar = ({ toggleSidebar }) => {
  const { searchQuery, setSearchQuery } = useSearch();  // Access global search state
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showChannelForm, setShowChannelForm] = useState(false);
  const { user, logout, updateUserData } = useContext(AuthContext);
  const userMenuRef = useRef(null);   //using useref to avoid re-rendering when closing the menu,null ensures that the reference exists before the DOM is rendered
  const navigate = useNavigate();

  const handleSearchChange = (e) => {
    
    setSearchQuery(e.target.value);
  };

  const handleSignIn = () => {
    setShowLoginForm(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {   //checking if the ref is assigned before using it.
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);   //whenever a user clicks outside,function handleClickOutside will execute.
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);    //cleanup function,calls this when the component unmounts
    };
  }, []);

  const handleChannelCreated = (channelData) => {
    setShowChannelForm(false);
    
    if (channelData) {
      updateUserData({ 
        channel: channelData 
      });
    }
    console.log('Channel created:', channelData);
  };
  
  const handleViewChannel = () => {
    if (user && user.channel) {
      setShowUserMenu(false);
      navigate(`/channel/${user.channel._id}/${user._id}`);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-black h-14 flex items-center justify-between px-2 md:px-4 z-50 border-b border-gray-200">
        {/* Left section - small margin on mobile */}
        <div className="flex items-center">
          <button 
            className="w-8 h-8 md:w-10 md:h-10 flex flex-col justify-center items-center rounded-full hover:bg-gray-200"
            onClick={toggleSidebar}
          >
            <div className="w-4 md:w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-4 md:w-5 h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-4 md:w-5 h-0.5 bg-gray-600"></div>
          </button>
          
          <Link to="/" className="flex items-center ml-1 md:ml-4">
            <img src="./youtube.png" alt="logo" className="h-5 md:h-6" />
            <span className="ml-1 font-semibold text-lg md:text-xl">YouTube</span>
            <sup className="text-xs ml-1 hidden sm:inline">IN</sup>
          </Link>
        </div>
        
        {/* Middle section -small margins for mobile */}
        <div className="flex-grow mx-1 sm:mx-4 md:mx-10 max-w-2xl">
        <Search 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}    // Updates search query globally
        placeholder="Search"
        className=""
      />
        </div>
        
        {/* Right section - smaller space between items on mobile */}
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
          <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
            <span className="text-lg md:text-xl">📹</span>
          </button>
          
          <div className="relative">
            <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full hover:bg-gray-200">
              <span className="text-lg md:text-xl">🔔</span>
            </button>
            <div className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center">
              9+
            </div>
          </div>
          
          {user ? (
            <div className="relative" ref={userMenuRef}> {/* After rendering,ref is assigned here. */}
            
              <div 
                className="h-7 w-7 md:h-8 md:w-8 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white cursor-pointer"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                {/* {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm md:text-lg font-medium">{user.name.charAt(0)}</span>
                )} */}
                <span className="text-sm md:text-lg font-medium">{user.name.charAt(0)}</span>
              </div>
              
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 md:w-72 bg-black rounded-lg shadow-lg overflow-hidden z-50">
                  {/* User info section */}
                  <div className="p-3 md:p-4 border-b">
                    <div className="flex items-start space-x-3 md:space-x-4">
                      {/* Avatar */}
                      <div className="h-8 w-8 md:h-10 md:w-10 rounded-full overflow-hidden flex items-center justify-center bg-purple-600 text-white flex-shrink-0">
                        {/* {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-sm md:text-lg font-medium">{user.name.charAt(0)}</span>
                        )} */}
                        <span className="text-sm md:text-lg font-medium">{user.name.charAt(0)}</span>
                      </div>
                      
                      
                      {/* User details */}
                      <div className="flex-1">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs md:text-sm text-gray-600">@{user.userName}</div>
                        <div className="mt-1">
                          {user.channel ? (
                            <button 
                              onClick={handleViewChannel}
                              className="text-xs md:text-sm text-blue-600 hover:underline"
                            >
                              View your channel
                            </button>
                          ) : (
                            <button 
                              onClick={() => {
                                setShowChannelForm(true);
                                setShowUserMenu(false);
                              }}
                              className="text-xs md:text-sm text-blue-600 hover:underline"
                            >
                              Create your channel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu items section */}
                  <div className="py-1 md:py-2">
                    <div className="px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm text-gray-500">{user.email}</div>
                    <Link to="/settings" className="block px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-gray-500 hover:text-black">
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-gray-500 hover:text-black"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              className="flex items-center space-x-1 md:space-x-2 text-blue-600 border border-blue-600 px-2 py-1 md:px-3 md:py-1.5 rounded-full hover:bg-blue-50 text-xs md:text-sm"
              onClick={handleSignIn}
            >
              <span className="text-sm md:text-lg">👤</span>
              <span className="font-medium">Sign in</span>
            </button>
          )}
        </div>
      </nav>
      
      {/* Add spacer for fixed navbar */}
      <div className="h-14"></div>
      
      {showLoginForm && (
        <>
          <div 
            className="fixed inset-0 bg-opacity-30 backdrop-blur-sm z-40"
            onClick={() => setShowLoginForm(false)}
          ></div>
          
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 shadow-2xl w-11/12 md:w-auto">
            <LoginModal onClose={() => setShowLoginForm(false)} />
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