import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';  

const VideoUploadModal = ({ isOpen, onClose, channelId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [category, setCategory] = useState('Other');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Preview states
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  // Get auth context
  const { ensureValidToken } = useContext(AuthContext);

  const categories = [
    'Entertainment', 'Music', 'Gaming', 'Sports', 'Education',
    'Science & Technology', 'Travel', 'News', 'Comedy', 'Other'
  ];

  // Clean up object URLs on unmount
  //URL.revokeObjectURL() is a method in JS,releases the memory used by an object URL that was previously created using URL.createObjectURL().
  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);    //free up memory and prevent memory leaks.
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    };
  }, [videoPreview, thumbnailPreview]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (videoPreview) URL.revokeObjectURL(videoPreview); // Clean up previous URL
      setVideoFile(file);
      // Create URL for preview
      const videoURL = URL.createObjectURL(file);
      setVideoPreview(videoURL);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview); // Clean up previous URL
      setThumbnailFile(file);
      // Create URL for preview
      const thumbURL = URL.createObjectURL(file);
      setThumbnailPreview(thumbURL);
    }
  };

  const uploadVideo = async () => {
    // Validate form
    if (!title.trim()) {
      setError('Video title is required');
      return;
    }

    if (!videoFile) {
      setError('Please select a video file');
      return;
    }

    // Check token validity before proceeding
    // const isTokenValid = await ensureValidToken();
    // if (!isTokenValid) {
    //   setError('Your session has expired. Please log in again.');
    //   return;
    // }

    setError('');
    setIsUploading(true);
    
    try {
      //FormData with all content
      const formData = new FormData();
      formData.append('videoFile', videoFile);    //.append used for sending multipart/form-data requests
      formData.append('title', title);
      formData.append('description', description);
      formData.append('category', category);
      
      
      if (thumbnailFile) {
        formData.append('thumbnailFile', thumbnailFile);
      }
      
      setUploadProgress(10);
      
      const uploadResponse = await axios.post(
        `/video/${channelId}`,
        formData, 
        {
          onUploadProgress: (progressEvent) => {    //onUploadProgress function in Axios tracks how much of the file has been uploaded.
                                                    
            const progress = Math.round(
              (progressEvent.loaded * 90) / progressEvent.total //progressEvent.loaded → Amount of data uploaded so far,progressEvent.total → Total file size.
            );
            setUploadProgress(10 + progress); // Start from 10% 
          },
          // Set timeout for large uploads
          timeout: 300000 // 5 minutes
        }
      );
      
      setUploadProgress(100);
      
      if (uploadResponse.data.status) {
        // Clear form and close modal on success
        resetForm();
        if (onSuccess) onSuccess(uploadResponse.data.data);
        onClose();
      } else {
        setError(uploadResponse.data.message || 'Failed to create video');
      }
    } catch (error) {
      console.error('Upload error:', error);
      
      
      if (error.response) {
       
        if (error.response.status === 401) {
          setError('Authentication error. Please log in again.');
        } else if (error.response.status === 413) {
          setError('Video file is too large. Please upload a smaller file.');
        } else {
          setError(error.response.data?.message || `Server error: ${error.response.status}`);
        }
      } else if (error.request) {
        // Request made but no response
        setError('Server did not respond. Please check your connection and try again.');
      } else if (error.code === 'ECONNABORTED') {
        setError('Upload timed out. Your video may be too large or your connection too slow.');
      } else {
        
        setError('Failed to upload video. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoFile(null);
    setThumbnailFile(null);
    setCategory('Other');
    setError('');
    setUploadProgress(0);
    
    // Clean up object URLs
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
      setVideoPreview(null);
    }
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Upload New Video</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              disabled={isUploading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 text-white rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Video Upload Section */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Video File <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploading}
                />
                {videoPreview ? (
                  <div className="mb-2">
                    <video 
                      controls 
                      className="w-full h-48 object-cover rounded-md bg-gray-800"
                      src={videoPreview}
                    />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (videoPreview) URL.revokeObjectURL(videoPreview);
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md"
                      disabled={isUploading}
                    >
                      Remove Video
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="video-upload" 
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-gray-400">Click to upload video</span>
                    <span className="text-xs text-gray-500 mt-1">MP4, WebM, AVI, MOV</span>
                  </label>
                )}
              </div>
            </div>

            {/* Video Details */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                placeholder="Enter video title"
                disabled={isUploading}
                maxLength={100}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white h-24"
                placeholder="Enter video description"
                disabled={isUploading}
                maxLength={5000}
              ></textarea>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-4 py-2 text-white"
                disabled={isUploading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Thumbnail (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-700 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={isUploading}
                />
                {thumbnailPreview ? (
                  <div className="mb-2">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail Preview" 
                      className="w-full h-32 object-cover rounded-md"
                    />
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="mt-2 px-3 py-1 text-sm bg-red-600 text-white rounded-md"
                      disabled={isUploading}
                    >
                      Remove Thumbnail
                    </button>
                  </div>
                ) : (
                  <label 
                    htmlFor="thumbnail-upload" 
                    className="flex flex-col items-center justify-center cursor-pointer py-4"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400">Click to upload thumbnail</span>
                    <span className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (max 5MB)</span>
                  </label>
                )}
              </div>
            </div>

            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={uploadVideo}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500 transition"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Upload Video'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;