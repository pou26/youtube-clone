import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserMenu = ({ user, onLogout, onCreateChannel }) => {   //get userdetails,logout details,channel creation function
  const [showChannelList, setShowChannelList] = useState(false);
  const navigate = useNavigate();

  const handleViewChannel = (channelId) => {
    navigate(`/channel/${channelId}`);
    setShowChannelList(false);    //close dropdown
  };

  return (
    <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 rounded-md shadow-lg z-50">
      <div className="p-3 border-b border-gray-800">
        <p className="font-medium text-sm">{user.name}</p>
        <p className="text-gray-400 text-xs">{user.email}</p>
        
        {/* Channel options */}
        <div className="mt-3 space-y-2">
          {/* Always show Create channel button */}
          <button 
            onClick={onCreateChannel}
            className="text-xs md:text-sm text-blue-600 hover:underline block"
          >
            Create new channel
          </button>
          
          {/* Show channel list if user has channels */}
          {user.channels && user.channels.length > 0 && (
            <div className="relative">
              <button 
                onClick={() => setShowChannelList(!showChannelList)}    //toggles between channel list hide/view
                className="text-xs md:text-sm text-blue-600 hover:underline flex items-center"
              >
                View your channels
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showChannelList && (
                <div className="absolute left-0 mt-1 bg-gray-800 rounded-md shadow-lg py-1 w-full z-10">
                  {user.channels.map(channel => (
                    <button
                      key={channel._id}
                      onClick={() => handleViewChannel(channel._id)}
                      className="block w-full text-left px-3 py-2 text-xs hover:bg-gray-700"
                    >
                      {channel.channelName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Other menu items */}
      <div className="p-2">
        {/* Your existing menu items */}
        <button 
          onClick={onLogout}
          className="block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-gray-800"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

export default UserMenu;