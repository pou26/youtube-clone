import { useParams, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Videos from "./Videos";

// Helper function to format the published date
const formatPublishedDate = (publishedAt) => {
  const published = new Date(publishedAt);
  const now = new Date();
  const diffSeconds = Math.floor((now - published) / 1000);
  if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)} days ago`;
  if (diffSeconds < 2592000) return `${Math.floor(diffSeconds / 604800)} weeks ago`;
  if (diffSeconds < 31536000) return `${Math.floor(diffSeconds / 2592000)} months ago`;
  return `${Math.floor(diffSeconds / 31536000)} years ago`;
};

// Function to extract YouTube video ID from URL
const extractYoutubeId = (url) => {
  if (!url) return "";
  
  // Handle both embed URLs and watch URLs
  if (url.includes('/embed/')) {
    return url.split('/embed/')[1].split('?')[0];
  } else if (url.includes('watch?v=')) {
    return url.split('watch?v=')[1].split('&')[0];
  }
  
  // If no pattern matches, return the original value
  return url;
};

// Function to format numbers for display
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

async function fetchVideoDetails(videoId) {
  try {
    console.log("Fetching video with ID:", videoId); 
    
    const response = await axiosInstance.get(`/video/${videoId}`);
    
    console.log("API Response:", response.data); 
    
    // Check if it has a valid video object
    const video = response.data; 
    
    if (!video) {
      throw new Error("Video not found");
    }
    
    return {
      videoId: video._id,
      ytVideoId: extractYoutubeId(video.videoUrl), // Extract the actual YouTube ID
      title: video.title,
      description: video.description,
      channelTitle: video.channelName,
      views: video.views,
      likes: video.likes || 0,
      dislikes: video.dislikes || 0,
      publishedAt: formatPublishedDate(video.uploadDate),
      thumbnailUrl: video.thumbnailUrl,
    };
  } catch (error) {
    console.error("Error in fetchVideoDetails:", error);
    throw error;
  }
}

const VideoDetails = () => {
  const { videoId } = useParams();
  const [videoDetails, setVideoDetails] = useState(null);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  
  useEffect(() => {
    console.log("VideoId from useParams:", videoId); 
    
    if (!videoId) {
      setError("Video ID is missing from URL");
      return;
    }
    
    const getVideoDetails = async () => {
      try {
        const details = await fetchVideoDetails(videoId);
        setVideoDetails(details);
      } catch (err) {
        console.error("Error fetching video details:", err);
        setError(err.response?.data?.message || err.message);
      }
    };
    
    getVideoDetails();
  }, [videoId]);
  
  // Toggle subscription status
  const handleSubscribe = () => {
    setIsSubscribed(!isSubscribed);
    // Here you would typically make an API call to update subscription status
  };
  
  // Handle like and dislike
  const handleLike = () => {
    if (liked) {
      setLiked(false);
    } else {
      setLiked(true);
      setDisliked(false);
    }
    // Here you would typically make an API call to update like status
  };
  
  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
    } else {
      setDisliked(true);
      setLiked(false);
    }
    // Here you would typically make an API call to update dislike status
  };
  
  if (error) return <div className="error">Error: {error}</div>;
  if (!videoDetails) return <div className="loading">Loading video details...</div>;
  
  return (
    <div className="flex flex-col md:flex-row gap-5 p-8 md:p-2 bg-[#111] text-white">
      {/* Video details section */}
      <div className="md:w-2/3 lg:w-3/4">
        <div className="mb-4">
          <div className="aspect-video mb-4 ">
            <iframe
              src={`https://www.youtube.com/embed/${videoDetails.ytVideoId}`}
              className="w-full h-full rounded-lg"
              title={videoDetails.title}
              allowFullScreen
            ></iframe>
          </div>
          
          {/* Video title */}
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{videoDetails.title}</h1>
          
          {/* Video interaction buttons */}
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center">
              <p className="text-sm text-gray-400 mr-4">
                {formatNumber(videoDetails.views)} views • {videoDetails.publishedAt}
              </p>
            </div>
            
            <div className="flex space-x-2 text-sm">
              {/* Like/Dislike buttons */}
              <button 
                onClick={handleLike}
                className={`flex items-center gap-1 px-3 py-2 rounded-full ${liked ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <span className="text-lg">{liked ? '👍' : '👍'}</span>
                <span>{formatNumber(videoDetails.likes + (liked ? 1 : 0))}</span>
              </button>
              
              <button 
                onClick={handleDislike}
                className={`flex items-center gap-1 px-3 py-2 rounded-full ${disliked ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
              >
                <span className="text-lg">{disliked ? '👎' : '👎'}</span>
                <span>{disliked ? 'Disliked' : ''}</span>
              </button>
              
              {/* Share button */}
              <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-800">
                <span className="text-lg">↗️</span>
                <span>Share</span>
              </button>
              
              {/* Download button */}
              <button className="flex items-center gap-1 px-3 py-2 rounded-full hover:bg-gray-800">
                <span className="text-lg">⬇️</span>
                <span>Download</span>
              </button>
              
              {/* More button */}
              <button className="flex items-center px-3 py-2 rounded-full hover:bg-gray-800">
                <span className="text-xl">⋯</span>
              </button>
            </div>
          </div>
          
          {/* Channel info and subscription */}
          <div className="bg-[#222] p-4 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Channel avatar - using a placeholder */}
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-xl">
                  {videoDetails.channelTitle.charAt(0)}
                </div>
                
                <div>
                  <p className="font-bold">{videoDetails.channelTitle}</p>
                  <p className="text-xs text-gray-400">1.2M subscribers</p>
                </div>
              </div>
              
              <button 
                onClick={handleSubscribe}
                className={`px-4 py-2 rounded-full font-medium ${
                  isSubscribed 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>
            
            {/* Video description */}
            <div className="mt-4">
              <p className="text-sm text-gray-300 whitespace-pre-line">
                {videoDetails.description}
              </p>
            </div>
          </div>
          
          <Link
            to="/"
            className="mt-4 inline-block text-blue-400 hover:text-blue-600 text-sm"
          >
            ← Back to Videos
          </Link>
        </div>
      </div>
      
      {/* Videos list section */}
      <div className="md:w-1/3 lg:w-1/3 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
        <Videos
          activeFilter="All"
          layoutType="list"
          context="related"  // This disables hover preview
        />
      </div>
    </div>
  );
};

export default VideoDetails;