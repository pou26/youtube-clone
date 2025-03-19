import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';

// Reuse getImageUrl function
const getImageUrl = (url) => {
  if (!url) return null;
  try {
    new URL(url);
    return url;
  } catch (e) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/${url.startsWith('/') ? url.substring(1) : url}`;
  }
};

const ChannelUpdate = () => {
  const { channelId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Channel data states
  const [channelData, setChannelData] = useState({
    channelName: '',
    description: '',
    handle: '',
    channelBannerUrl: '',
    channelThumbnailUrl: ''
  });
  
  // File states
  const [bannerFile, setBannerFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  
  // Fetch channel data on component mount
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
        const channelResponse = await axios.get(`/channel/${channelId}/${user._id}`);
        if (channelResponse.data) {
          const channel = channelResponse.data;
          
          // Check if user is the owner
          if (channel.owner !== user._id) {
            throw new Error("You don't have permission to edit this channel");
          }
          
          // Set channel data
          setChannelData({
            channelName: channel.channelName || '',
            description: channel.description || '',
            handle: channel.handle || (channel.channelName || 'channel').toLowerCase().replace(/\s+/g, ''),
            channelBannerUrl: channel.channelBannerUrl || '',
            channelThumbnailUrl: channel.channelThumbnailUrl || ''
          });
          
          // Set image previews if they exist
          if (channel.channelBannerUrl) {
            setBannerPreview(getImageUrl(channel.channelBannerUrl));
          }
          
          if (channel.channelThumbnailUrl) {
            setThumbnailPreview(getImageUrl(channel.channelThumbnailUrl));
          }
        } else {
          throw new Error("Invalid channel data received");
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
      setError("You need to be logged in to edit this channel");
      setIsLoading(false);
    } else {
      setError("No channel ID provided");
      setIsLoading(false);
    }
  }, [channelId, user]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setChannelData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle banner file change
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle thumbnail file change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      // Create FormData instance for file uploads
      const formData = new FormData();
      formData.append('channelName', channelData.channelName);
      formData.append('description', channelData.description);
      formData.append('handle', channelData.handle);
      
      // Add files if they exist
      if (bannerFile) {
        formData.append('channelBanner', bannerFile);
      }
      
      if (thumbnailFile) {
        formData.append('channelThumbnail', thumbnailFile);
      }
      
      // Update channel
      await axios.put(`/channels/${user._id}/${channelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      
      setSuccess("Channel updated successfully");
      // Navigate back to channel page after a short delay
      setTimeout(() => {
        navigate(`/channel/${channelId}/${user._id}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating channel:", error);
      setError(error.response?.data?.message || "Failed to update channel");
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading && !channelData.channelName) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  if (error && !channelData.channelName) {
    return (
      <div className="text-center py-10 bg-gray-900 text-white min-h-screen">
        <h2 className="text-xl font-bold">Error</h2>
        <p className="mt-2">{error}</p>
        <Link to={`/channel/${channelId}/${user._id}`} className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-full">
          Back to Channel
        </Link>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <div className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Channel customization</h1>
          <div className="flex border-b border-gray-700">
            <button
              className={`py-3 px-6 font-medium border-b-2 ${
                activeTab === 'profile' ? 'border-white' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('profile')}
            >
              Profile
            </button>
            <button
              className={`py-3 px-6 font-medium border-b-2 ${
                activeTab === 'home' ? 'border-white' : 'border-transparent'
              }`}
              onClick={() => setActiveTab('home')}
            >
              Home tab
            </button>
          </div>
        </div>
        
        {success && (
          <div className="mb-6 p-3 bg-green-600 bg-opacity-20 border border-green-500 rounded">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {activeTab === 'profile' && (
            <div>
              {/* Banner image section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-2">Banner image</h2>
                <p className="text-gray-400 text-sm mb-4">
                  This image will appear across the top of your channel
                </p>
                
                <div className="relative h-56 bg-gray-800 rounded-lg overflow-hidden mb-4">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Channel banner" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <img 
                          src="/images/banner-placeholder.png" 
                          alt="Banner placeholder" 
                          className="w-32 h-auto mx-auto"
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center">
                  <p className="text-gray-400 text-sm mr-4">
                    For best results on all devices, use an image that's at least 2048 x 1152 pixels and 6MB or less.
                  </p>
                  <label className="px-4 py-2 bg-gray-700 text-white rounded-full cursor-pointer hover:bg-gray-600">
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleBannerChange}
                    />
                  </label>
                </div>
              </div>
              
              {/* Profile picture section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-2">Picture</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Your profile picture will appear where your channel is presented on YouTube, like next to your videos and comments
                </p>
                
                <div className="mb-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-700">
                    {thumbnailPreview ? (
                      <img 
                        src={thumbnailPreview} 
                        alt="Channel thumbnail" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold">
                        {channelData.channelName && channelData.channelName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center">
                  <p className="text-gray-400 text-sm mr-4">
                    It's recommended to use a picture that's at least 98 x 98 pixels and 4MB or less. Use a PNG or GIF (no animations).
                  </p>
                  <label className="px-4 py-2 bg-gray-700 text-white rounded-full cursor-pointer hover:bg-gray-600">
                    Upload
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleThumbnailChange}
                    />
                  </label>
                </div>
              </div>
              
              {/* Channel details section */}
              <div className="mb-8">
                <h2 className="text-lg font-medium mb-4">Name</h2>
                <div className="mb-4">
                  <input
                    type="text"
                    name="channelName"
                    value={channelData.channelName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Channel name"
                  />
                </div>
                
                <h2 className="text-lg font-medium mb-4">Description</h2>
                <div className="mb-4">
                  <textarea
                    name="description"
                    value={channelData.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                    placeholder="Tell viewers about your channel"
                  ></textarea>
                </div>
                
                <h2 className="text-lg font-medium mb-4">Handle</h2>
                <div className="mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-1">@</span>
                    <input
                      type="text"
                      name="handle"
                      value={channelData.handle}
                      onChange={handleInputChange}
                      className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="channel-handle"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'home' && (
            <div className="py-10 text-center">
              <p className="text-gray-400">Home tab customization coming soon.</p>
            </div>
          )}
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-4 mt-8 border-t border-gray-800 pt-4">
            <Link 
              to={`/channel/${channelId}/${user._id}`} 
              className="px-4 py-2 bg-transparent text-white rounded-full font-medium hover:bg-gray-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-8 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelUpdate;