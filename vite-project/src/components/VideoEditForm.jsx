import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const VideoEditForm = () => {
  const { channelId, videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    thumbnailUrl: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Categories matching YouTube's common categories
  const categories = [
    'Music', 
    'Gaming', 
    'Sports', 
    'Entertainment', 
    'Education',
    'Science & Technology',
    'Travel & Events',
    'People & Blogs',
    'Comedy',
    'News & Politics',
    'Howto & Style',
    'Pets & Animals',
    'Autos & Vehicles',
    'Other'
  ];
  
  useEffect(() => {
    const fetchVideoData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!channelId || !videoId || !user || !user._id) {
          throw new Error("Missing required information");
        }
        
        // Verify channel ownership
        const channelResponse = await axios.get(`/channel/${channelId}/${user._id}`);
        if (channelResponse.data.owner !== user._id) {
          throw new Error("You don't have permission to edit videos for this channel");
        }
        
        // Fetch video data
        const videoResponse = await axios.get(`/video/${videoId}`);
        const videoData = videoResponse.data;
        
        // Populate form with video data
        setFormData({
          title: videoData.title || '',
          description: videoData.description || '',
          category: videoData.category || 'Other',
          thumbnailUrl: videoData.thumbnailUrl || ''
        });
        
        if (videoData.thumbnailUrl) {
          setThumbnailPreview(videoData.thumbnailUrl);
        }
      } catch (err) {
        console.error("Error fetching video data:", err);
        setError(err.message || "Failed to load video data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchVideoData();
  }, [channelId, videoId, user]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      
      let updatedThumbnailUrl = formData.thumbnailUrl;
      
      // Upload thumbnail if a new one was selected
      if (thumbnailFile) {
        const formDataForUpload = new FormData();
        formDataForUpload.append('thumbnail', thumbnailFile);
        
        const uploadResponse = await axios.post('/upload/thumbnail', formDataForUpload);
        updatedThumbnailUrl = uploadResponse.data.thumbnailUrl;
      }
      
      // Fetch the current video to get the videoUrl
      const videoResponse = await axios.get(`/video/${videoId}`);
      const currentVideoUrl = videoResponse.data.videoUrl;
      
      // Update video data
      const updateResponse = await axios.put(`/video/${channelId}`, {
        videoId: videoId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        thumbnailUrl: updatedThumbnailUrl,
        videoUrl: currentVideoUrl, // Use the current video URL
      });
      
      if (updateResponse.data.status) {
        navigate(`/channel/${channelId}/videos`);
      } else {
        setError("Failed to update video. Please try again.");
      }
    } catch (err) {
      console.error("Error updating video:", err);
      setError(err.message || "An error occurred while updating the video");
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4 mt-6">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          <h3 className="font-bold">Error</h3>
          <p>{error}</p>
          <button 
            onClick={() => navigate(`/channel/${channelId}`)}
            className="mt-2 text-blue-600 hover:underline"
          >
            Return to Channel
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Video</h1>
        <p className="text-gray-600">Update details for your video</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Video preview */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <div className="relative pb-[56.25%] bg-gray-100 rounded-md overflow-hidden">
                {thumbnailPreview ? (
                  <img 
                    src={thumbnailPreview} 
                    alt="Video thumbnail" 
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">No thumbnail</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Custom Thumbnail
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-xs text-gray-500">
                Recommended: 1280×720 (16:9 ratio)
              </p>
            </div>
          </div>
          
          {/* Right column - Form fields */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title (required)
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                maxLength="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.title.length}/100
              </p>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="5"
                maxLength="5000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p className="mt-1 text-xs text-gray-500">
                {formData.description.length}/5000
              </p>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={() => navigate(`/channel/${channelId}/videos`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1`}
          >
            {isSaving ? (
              <>
                <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoEditForm;