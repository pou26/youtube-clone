import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const ChannelVideosManagement = () => {
  const { channelId } = useParams();
  const [videos, setVideos] = useState([]);
  const [channel, setChannel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideos, setSelectedVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!channelId || !user || !user._id) {
          throw new Error("Missing required information");
        }
        
        // Fetch channel info
        const channelResponse = await axios.get(`/channel/${channelId}/${user._id}`);
        setChannel(channelResponse.data);
        
        // Check if user is channel owner
        if (channelResponse.data.owner !== user._id) {
          throw new Error("You don't have permission to manage videos for this channel");
        }
        
        // Fetch channel videos
        const videosResponse = await axios.get(`/videos/channel/${channelId}`);
        if (videosResponse.data && Array.isArray(videosResponse.data)) {
          setVideos(videosResponse.data);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message || "Failed to load channel data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [channelId, user]);
  
  const handleSelectAll = () => {
    if (selectedVideos.length === videos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(videos.map(video => video._id));
    }
  };
  
  const handleSelectVideo = (videoId) => {
    if (selectedVideos.includes(videoId)) {
      setSelectedVideos(selectedVideos.filter(id => id !== videoId));
    } else {
      setSelectedVideos([...selectedVideos, videoId]);
    }
  };
  const handleDeleteSelected = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!selectedVideos.length) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedVideos.length} video(s)?`)) {
      try {
        // Delete each selected video
        for (const videoId of selectedVideos) {
          await axios.delete(`/video/${videoId}`);
        }
        
        // Remove deleted videos from state
        setVideos(videos.filter(video => !selectedVideos.includes(video._id)));
        setSelectedVideos([]);
      } catch (err) {
        console.error("Error deleting videos:", err);
        setError(err.response?.data?.message || "Failed to delete videos. Please try again.");
      }
    }
  };
  
  
  const handleEditVideo = (videoId) => {
    navigate(`/edit-video/${channelId}/${videoId}`);
  };
  
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const filteredVideos = videos
    .filter(video => video.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      } else if (sortBy === 'oldest') {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      } else if (sortBy === 'popular') {
        return b.views - a.views;
      } else if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'za') {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md my-4">
        <h3 className="font-bold">Error</h3>
        <p>{error}</p>
        <Link to="/" className="mt-2 inline-block text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Channel Videos</h1>
        <p className="text-gray-600">Manage videos for {channel?.channelName || 'your channel'}</p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center">
          <button 
            onClick={handleSelectAll}
            className="px-3 py-1 bg-gray-100 text-black rounded-md text-sm mr-2 hover:bg-gray-200"
          >
            {selectedVideos.length === videos.length ? 'Deselect All' : 'Select All'}
          </button>
          
          {selectedVideos.length > 0 && (
            <button 
              onClick={handleDeleteSelected}
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
            >
              Delete Selected ({selectedVideos.length})
            </button>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 border rounded-md w-full md:w-64"
            />
            <button 
              onClick={() => setSearchQuery('')}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-red text-black ${!searchQuery && 'hidden'}`}
            >
              ✕
            </button>
          </div>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white text-black"
          >
            <option value="newest">Date (newest)</option>
            <option value="oldest">Date (oldest)</option>
            <option value="popular">Most views</option>
            <option value="az">Title (A-Z)</option>
            <option value="za">Title (Z-A)</option>
          </select>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        {filteredVideos.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-md">
            <p className="text-gray-500 mb-4">No videos found</p>
            <Link
              to={`/upload/${channelId}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload a Video
            </Link>
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200 rounded-md">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-12 p-3">
                  <input 
                    type="checkbox" 
                    checked={selectedVideos.length === videos.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                </th>
                <th className="p-3 text-left">Video</th>
                <th className="p-3 text-left">Visibility</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Views</th>
                <th className="p-3 text-right">Comments</th>
                <th className="p-3 text-right">Likes</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVideos.map(video => (
                <tr key={video._id} className="hover:bg-gray-50">
                  <td className="p-3 text-center">
                    <input 
                      type="checkbox"
                      checked={selectedVideos.includes(video._id)}
                      onChange={() => handleSelectVideo(video._id)}
                      className="h-4 w-4"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        {video.thumbnailUrl ? (
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <span className="text-gray-500 text-xs">No thumbnail</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Link 
                          to={`/watch/${video._id}`} 
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {video.title}
                        </Link>
                        <p className="text-sm text-gray-500 line-clamp-2">{video.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Public
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {getFormattedDate(video.uploadDate)}
                  </td>
                  <td className="p-3 text-right text-sm text-gray-600">
                    {video.views.toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-sm text-gray-600">
                    {(video.comments?.length || 0).toLocaleString()}
                  </td>
                  <td className="p-3 text-right text-sm text-gray-600">
                    {video.likes.toLocaleString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleEditVideo(video._id)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
  
                        onClick={(e) => {
                        e.preventDefault(); // Prevent default form submission
                        e.stopPropagation(); // Stop event bubbling
  
                        if (window.confirm("Are you sure you want to delete this video?")) {
                        axios.delete(`/video/${video._id}`)
                        .then(() => {
                      // Remove from state
                          setVideos(videos.filter(v => v._id !== video._id));
                        })
                        .catch(err => {
                        console.error("Error deleting video:", err);
                        setError(err.response?.data?.message || "Failed to delete video. Please try again.");
                    });
  }
}}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                      <Link
                        to={`/analytics/${video._id}`}
                        className="p-1 text-purple-600 hover:text-purple-800"
                        title="Analytics"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <Link 
          to={`/channel/${channelId}`} 
          className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
        >
          Back to Channel
        </Link>
        
        <Link 
          to={`/upload/${channelId}`} 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Upload New Video
        </Link>
      </div>
    </div>
  );
};

export default ChannelVideosManagement;