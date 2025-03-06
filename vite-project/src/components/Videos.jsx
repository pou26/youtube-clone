import React, { useEffect, useState, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";
import axios from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const Videos = ({
  activeFilter = "All",
  layoutType = "grid",
  context = "homepage" // context prop for applying different styles,homepage and videodetails page
}) => {
  // Get sidebar state from outlet context
  const { isSidebar2Open, isVideoDetailsPage } = useOutletContext() || { isSidebar2Open: false, isVideoDetailsPage: false };
  
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const timeoutRef = useRef(null);  //avoid re-renders, if not used multiple timeouts will be running in parallel.

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axiosInstance.get("/videos");
        const data = response.data;
        console.log(data);

        const formattedVideos = data.map(item => ({
          videoId: item._id, // Database ID
          ytVideoId: extractYoutubeId(item.videoUrl), // Extract YouTube ID
          title: item.title,
          thumbnailUrl: item.thumbnailUrl,
          channelTitle: item.channelId,
          views: item.views,
          publishedAt: formatPublishedDate(item.uploadDate),
          category: getRandomCategory()
        }));

        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(video => video.category === activeFilter);
      setFilteredVideos(filtered);
    }
  }, [activeFilter, videos]);

  const getRandomCategory = () => {
    const categories = [
      'Music', 'Podcasts', 'Web series', 'Brides',
      'Ghost stories', 'Film criticisms', 'Satire', 'Makeovers',
      'Mixes', 'Ideas', 'Webisodes', 'History', 'Kitchens',
      'Comedy', 'Gadgets', 'Asian Music', 'Presentations', 'Recently uploaded', 'Watched', 'New to you'
    ];
    return categories[Math.floor(Math.random() * categories.length)];
  };

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

  const handleMouseEnter = (videoId) => {
    // Only enable hover preview for homepage context
    if (context === 'homepage') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current); //clearTimeout for avoiding unnecessary stacking up video queue

      // video plays after a delay of 800Ms,for better ui experience and avoid flickering
      timeoutRef.current = setTimeout(() => {   //timeoutRef.current is used to store and manage the timeout ID returned by the setTimeout() function
        setHoveredVideo(videoId);
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredVideo(null);
  };    //after leaving the mouse the timeout stack will be null

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">Error loading videos: {error}</div>;

  const videoWrapClass = layoutType === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4'
    : 'flex flex-col space-y-4';
  
  // Only apply sidebar shift on homepage, not on video details page
  const sidebarAdjustment = (context === 'homepage' && isSidebar2Open) ? 'mr-[0px]' : 'ml-[5px]';

  return (
    <div className={`p-4 transition-all duration-300 ease-in-out ${
      context === 'homepage' ? sidebarAdjustment : ''
    }`}>
      <div className="wrapper">
        <h1 className="text-xl font-semibold mb-6">
          {activeFilter === "All" ? "Recommended" : activeFilter}
        </h1>
        <div 
          className={`${videoWrapClass} 
            ${context === 'related' ? 'overflow-y-scroll scrollbar-hide max-h-[500px]' : ''}`}
        >
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <div
                key={video.videoId}
                className={`video relative 
                  ${layoutType === 'list' ? 'flex items-start space-x-4' : ''} 
                  ${context === 'related' ? 'flex items-start space-x-2 mb-6 ' : ''}`}
                onMouseEnter={() => handleMouseEnter(video.videoId)}
                onMouseLeave={handleMouseLeave}
              >
                <div 
                  className={`thumbnail-container relative 
                    ${layoutType === 'list' ? 'w-1/3' : 'w-full'} 
                    ${context === 'related' ? 'w-[170px]' : ''}`}
                  style={{ 
                    position: 'relative', 
                    paddingTop: context === 'related' ? '26%' : '56.25%' 
                  }}
                >
                  {context === 'homepage' && hoveredVideo === video.videoId ? (
                    <div 
                      className="absolute inset-0 video-preview"
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%' 
                      }}
                    >
                      <iframe
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        src={`https://www.youtube.com/embed/${video.ytVideoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${video.ytVideoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <Link to={`/video/${video.videoId}`} className="absolute inset-0">
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                    </Link>
                  )}
                </div>
                <div className={`video-info 
                  ${layoutType === 'list' ? 'w-2/3' : ''} 
                  ${context === 'related' ? 'flex-1 overflow-hidden h-25' : ''}`}
                >
                  <h2 className={`font-medium line-clamp-2 
                    ${context === 'related' ? 'text-[15px] leading-tight' : 'text-sm mt-2'}`}>
                    {video.title}
                  </h2>
                  <p className={`text-gray-400 
                    ${context === 'related' ? 'text-[12px] leading-tight mt-0.5' : 'text-s mt-1'}`}>
                    {video.channelTitle}
                  </p>
                  <p className={`text-gray-400 
                    ${context === 'related' ? 'text-[10px] leading-tight mt-0.5' : 'text-s mt-1'}`}>
                    {video.views} views • {video.publishedAt}
                  </p>
                  {context !== 'related' && (
                    <p className="text-xs text-gray-400 mt-1">{video.category}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="no-videos">No videos found for this category</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;