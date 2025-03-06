
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
      channelTitle: video.channelId,
      views: video.views,
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
  
  if (error) return <div className="error">Error: {error}</div>;
  if (!videoDetails) return <div className="loading">Loading video details...</div>;
  
  return (
    <div className="flex flex-col md:flex-row gap-5 p-8 md:p-2 bg-[#111] text-white">
      {/* Video details section */}
      <div className="md:w-2/3 lg:w-3/4">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{videoDetails.title}</h1>
          <div className="aspect-video mb-4 ">
            <iframe
              src={`https://www.youtube.com/embed/${videoDetails.ytVideoId}`}
              className="w-full h-full rounded-lg"
              title={videoDetails.title}
              allowFullScreen
            ></iframe>
          </div>
          <div className="bg-[#222] p-4 rounded-lg">
            <p className="text-sm md:text-base mb-2">
              <strong>{videoDetails.channelTitle}</strong>
            </p>
            <p className="text-sm text-gray-400 mb-2">
              {videoDetails.views} views • {videoDetails.publishedAt}
            </p>
            <p className="text-sm text-gray-300 line-clamp-3">{videoDetails.description}</p>
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