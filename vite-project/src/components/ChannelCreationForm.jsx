import React, { useState } from 'react';
import axios from 'axios';

const ChannelCreationForm = ({ userId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    channelName: '',
    description: 'My channel description', // Default description
    handle: '', 
  });
  const [channelThumbnail, setChannelThumbnail] = useState(null);
  const [channelBanner, setChannelBanner] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Storing actual file for submission
    setChannelThumbnail(file);
    
    // Create preview
    const reader = new FileReader();  //built-in JavaScript API allows reading file content asynchronously.
    reader.onload = () => {             //after file is read, the onload event triggers.
      setPreviewImage(reader.result);   //reader.result contains a Base64 Data URL of image, which is a format suitable for displaying in an <img> tag.
    };
    reader.readAsDataURL(file);   //tells the FileReader to convert the selected image file into a Data URL.after conversion is done, the onload function executes.
  };

  const handleBannerUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setChannelBanner(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // multipart form data
      const formDataToSubmit = new FormData();
      formDataToSubmit.append('channelName', formData.channelName);
      formDataToSubmit.append('description', formData.description);
      
      // Add handle if provided
      if (formData.handle) {
        formDataToSubmit.append('handle', formData.handle);
      }
      
      // actual files,(form-data) not the data URLs
      if (channelThumbnail) {
        formDataToSubmit.append('channelThumbnail', channelThumbnail);
      }
      
      if (channelBanner) {
        formDataToSubmit.append('channelBanner', channelBanner);
      }
      
// base URL for axios
axios.defaults.baseURL = 'http://localhost:4000';


const response = await axios.post(
  `/channels/${userId}`, 
  formDataToSubmit,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
);
      
      if (response.data.status) {
        // Return channel data to update user context
        
        if (onSuccess) onSuccess(response.data.data);
      } else {
        setError(response.data.message || 'Failed to create channel');
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      setError(error.response?.data?.message || 'Failed to create channel. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center bg-opacity-30 backdrop-blur-sm z-40">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 text-white">
        
        <div className="flex flex-col items-center mb-8">
          <div 
            className="w-24 h-24 rounded-full bg-blue-300 flex items-center justify-center mb-2 overflow-hidden"
            style={{ position: 'relative' }}
          >
            {previewImage ? (
              <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />   // updates UI by displaying the preview image using the previewImage state.
              
            ) : (
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-10 h-6 bg-blue-300 rounded-full mt-2"></div>
              </div>
            )}
          </div>
          
          <button 
            onClick={() => document.getElementById('thumbnailUpload').click()}
            className="text-blue-400 text-sm font-medium"
          >
            Select profile picture
          </button>
          <input 
            id="thumbnailUpload" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload} 
          />
        </div>
        
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 p-2 bg-red-600 bg-opacity-20 border border-red-600 rounded text-red-400">
              {error}
            </div>
          )}
        
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Name</label>
            <input 
              type="text" 
              name="channelName"
              value={formData.channelName}
              onChange={handleInputChange}
              className="w-full bg-gray-800 rounded p-3 text-white" 
              placeholder="Enter channel name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Handle</label>
            <input 
              type="text" 
              name="handle"
              value={formData.handle}
              onChange={handleInputChange}
              className="w-full bg-gray-800 rounded p-3 text-white" 
              placeholder="@YourHandle"
            />
          </div>
          
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-1 block">Banner Image</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleBannerUpload} 
              className="w-full bg-gray-800 rounded p-2 text-white" 
            />
          </div>
          
          <div className="text-sm text-gray-400 mb-6">
            By clicking Create channel, you agree to YouTube's{' '}
            <a href="#" className="text-blue-400">Terms of Service</a>. 
            Changes made to your name and profile picture are visible only on YouTube and not other Google services.{' '}
            <a href="#" className="text-blue-400">Learn more</a>
          </div>
          
          <div className="flex justify-end gap-4">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 py-2 rounded-sm text-white font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 rounded-sm bg-blue-600 text-white font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChannelCreationForm;