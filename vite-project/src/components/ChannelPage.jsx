import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import ChannelVideosManagement from './ChannelVideosManagement';
import VideoUploadModal from './VideoUploadModal';

axios.defaults.baseURL = 'import.meta.env.VITE_BACKEND_URL';

const getImageUrl = (url) => {
  if (!url) return null;
  try {
    new URL(url);
    return url;
  } catch (e) {
    const baseUrl = window.location.origin;   //(protocol + domain + port,http://localhost:4000)
    return `${baseUrl}/${url.startsWith('/') ? url.substring(1) : url}`;
  }
};


const VideoCard = ({ video }) => {
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    console.error(`Failed to load thumbnail for video: ${video.title}`);
    setImageError(true);
  };
  
  // Helper function to check if URL is valid
  const isValidUrl = (url) => {
    if (!url) return false;
    try {
      new URL(url); // Will throw error if invalid
      return true;
    } catch (e) {
      return false;
    }
  };
  
  const thumbnailUrl = getImageUrl(video.thumbnailUrl);
  
  return (
    <div className="flex flex-col">
      <div className="relative pb-[56.25%] bg-gray-800 rounded-lg overflow-hidden mb-2">
        {thumbnailUrl && !imageError ? (
          <img 
            src={thumbnailUrl} 
            alt={video.title} 
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <span className="text-gray-400">No thumbnail</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>
      <p className="text-xs text-gray-400 mt-1">{video.views.toLocaleString()} views • {formatTimeAgo(video.createdAt)}</p>
    </div>
  );
};

const formatDuration = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const formatTimeAgo = (dateString) => {
  if (!dateString) return 'unknown time ago';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (isNaN(diff)) return 'unknown time ago';
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) return `${years} ${years === 1 ? 'year' : 'years'} ago`;
    if (months > 0) return `${months} ${months === 1 ? 'month' : 'months'} ago`;
    if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    return `${seconds} ${seconds === 1 ? 'second' : 'seconds'} ago`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'unknown time ago';
  }
};

const ChannelPage = () => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('videos');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { user } = useContext(AuthContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!channelId) {
          throw new Error("Channel ID is missing");
        }
        
        if (!user || !user._id) {
          throw new Error("User information is required");
        }
        
        // Fetch channel info
        const userId=user._id;
        const channelResponse = await axios.get(`/channel/${channelId}/${user._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });
        console.log("user id is:- ", userId)
        console.log(channelResponse);
        if (channelResponse.data) {
          setChannel(channelResponse.data);
          // Check if user is subscribed - userSubscribed in API resp. - true: subscribed, false: not subscribed
          setIsSubscribed(!!channelResponse.data.userSubscribed);
        } else {
          throw new Error("Invalid channel data received");
        }
        
        // Fetch channel videos
        try {
          const videosResponse = await axios.get(`/videos/channel/${channelId}`);
          if (videosResponse.data && Array.isArray(videosResponse.data)) {
            setVideos(videosResponse.data);
          } else {
            setVideos([]);
          }
        } catch (videoErr) {
          console.error("Error fetching videos:", videoErr);
          setVideos([]);
   
        }
      } catch (error) {
        console.error("Error fetching channel data:", error);
        setError(error.message || "Failed to load channel data");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (channelId && user && user._id) {
      fetchChannelData();
    } else if (!user || !user._id) {
      setError("You need to be logged in to view this channel");
      setIsLoading(false);
    } else {
      setError("No channel ID provided");
      setIsLoading(false);
    }
  }, [channelId, user]);
  
  const handleSubscribe = async () => {
    if (!user) {
      // Handle user not logged in
      setError("You need to be logged in to subscribe");
      return;
    }
    
    try {
      const type = isSubscribed ? 'unsubscribe' : 'subscribe';    //if isSubscribed is true it'll send /subscriptions/unsubscribe vice versa
      
      await axios.post(`/subscriptions/${type}`, {
        userId: user._id,
        channelId: channelId
      });
      
      setIsSubscribed(!isSubscribed);   //Toggles the isSubscribed state
      if (channel) {
        // Update subscriber count
        setChannel({
          ...channel,     //to keep existing properties.
          subscribers: channel.subscribers + (isSubscribed ? -1 : 1),   //user clicks to unsubscribe.(isSubscribed === true), decrease subscribers by -1.vice versa
          userSubscribed: !isSubscribed   //If isSubscribed is true → !isSubscribed becomes false (user unsubscribing).
        });
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      setError("Failed to update subscription. Please try again.");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10 px-4">
        <h2 className="text-xl font-bold">Error Loading Channel</h2>
        <p className="mt-2">{error}</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-full">
          Go to Home
        </Link>
      </div>
    );
  }
  
  if (!channel) {
    return (
      <div className="text-center py-10 px-4">
        <h2 className="text-xl font-bold">Channel not found</h2>
        <p className="mt-2">The channel you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-full">
          Go to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-black text-white min-h-screen pb-10">
      {/* Channel banner */}
      <div className="relative h-32 sm:h-40 md:h-56 lg:h-72 w-full bg-gray-800 overflow-hidden">
        {channel.channelBannerUrl ? (
          <img 
            src={getImageUrl(channel.channelBannerUrl)} 
            alt={`${channel.channelName} banner`} 
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error("Banner failed to load");
              e.target.style.display = 'none';
            }}
          />
        ) : (
          // Default banner with gradient
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
      </div>
      
      {/* Channel info section */}
      <div className="px-4 py-4 sm:py-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
          {/* Channel thumbnail/logo */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
            {channel.channelThumbnailUrl ? (
              <img 
                src={getImageUrl(channel.channelThumbnailUrl)} 
                alt={channel.channelName} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error("Channel thumbnail failed to load");
                  e.target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold">
                {channel.channelName && channel.channelName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Channel details */}
          <div className="flex-grow mt-2 md:mt-0">
            <h1 className="text-xl sm:text-2xl font-bold">{channel.channelName || 'Unnamed Channel'}</h1>
            <div className="flex flex-wrap items-center text-gray-400 mt-1 text-xs sm:text-sm">
              <span>@{(channel.channelName || 'channel').toLowerCase().replace(/\s+/g, '')}</span>
              <span className="mx-1">•</span>
              <span>{(channel.subscribers || 0).toLocaleString()} subscribers</span>
              <span className="mx-1">•</span>
              <span>{videos.length} videos</span>
              {channel.ownerName && (
                <>
                  <span className="mx-1">•</span>
                  <span>Owner: {channel.ownerName}</span>
                </>
              )}
            </div>
            <p className="mt-2 text-xs sm:text-sm text-gray-300 line-clamp-2">{channel.description || 'No description'}</p>
          </div>
          
          {/* Channel action buttons - moved to below channel details while on mobile view */}
          <div className="flex flex-wrap gap-2 mt-3 w-full md:w-auto md:mt-0">
            {user && channel.owner === user._id && (
              <>
                <Link
                  to={`/channels/${user._id}/${channelId}/edit`}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-800"
                >
                  Customize
                </Link>
                <Link
                  to={`/channel/${channelId}/videos`}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-700 text-white rounded-full text-sm font-medium hover:bg-gray-800"
                >
                  Manage Videos
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation tabs - scrollable on mobile */}
      <div className="border-b border-gray-800">
        <div className="flex max-w-6xl mx-auto px-2 overflow-x-auto scrollbar-hide">
          <button
            className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 ${
              activeTab === 'videos' ? 'border-white' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('videos')}
          >
            Videos
          </button>
          <button
            className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 ${
              activeTab === 'shorts' ? 'border-white' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('shorts')}
          >
            Shorts
          </button>
          <button
            className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 ${
              activeTab === 'live' ? 'border-white' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('live')}
          >
            Live
          </button>
          <button
            className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 ${
              activeTab === 'playlists' ? 'border-white' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists
          </button>
          <button
            className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 ${
              activeTab === 'community' ? 'border-white' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('community')}
          >
            Community
          </button>
          <button
            className={`py-2 px-3 sm:py-3 sm:px-6 text-sm sm:text-base font-medium whitespace-nowrap border-b-2 ${
              activeTab === 'about' ? 'border-white' : 'border-transparent'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </div>
      </div>
      
      {/* Video filter */}
      {activeTab === 'videos' && (
        <div className="max-w-6xl mx-auto px-4 mt-3 sm:mt-4 mb-4 sm:mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button className="px-3 py-1 text-xs sm:text-sm bg-white text-black rounded-full font-medium">
              Latest
            </button>
            <button className="px-3 py-1 text-xs sm:text-sm bg-gray-800 text-white rounded-full font-medium">
              Popular
            </button>
            <button className="px-3 py-1 text-xs sm:text-sm bg-gray-800 text-white rounded-full font-medium">
              Oldest
            </button>
          </div>
        </div>
      )}
      
      {/* Videos grid */}
      {activeTab === 'videos' && (
        <div className="max-w-6xl mx-auto px-4">
          {videos.length > 0 ? (
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {videos.map(video => (
                <Link to={`/video/${video._id}`} key={video._id}>
                  <VideoCard video={video} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-10">
              <p className="text-gray-400 text-sm sm:text-base">This channel hasn't uploaded any videos yet.</p>
              
              {/* Show upload button if current user is channel owner */}
              {user && channel.owner === user._id && (
                <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                Upload a Video
                </button>
              )}
              <VideoUploadModal 
              isOpen={isModalOpen} 
              onClose={() => setIsModalOpen(false)} 
              channelId={channelId} 
              />
            </div>
          )}
        </div>
      )}
      
      {/* Placeholder content for other tabs */}
      {activeTab !== 'videos' && (
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-10 text-center">
          <p className="text-gray-400 text-sm sm:text-base">This feature is coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;