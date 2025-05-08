import React, { useEffect, useState, useRef } from "react";
import { Link, useOutletContext } from "react-router-dom";    //useOutletContext hook retrieves the Outlet context
import axios from "axios";
import CategoryFilter from "./CategoryFilter";
const VITE_BACKEND_URL= import.meta.env.VITE_BACKEND_URL;

// axios instance with error handling
const axiosInstance = axios.create({
  baseURL:  VITE_BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// request interceptor for debugging
axiosInstance.interceptors.request.use(config => {    // middleware function,to modify request before handled by axios,config object contains request details
  console.log('Making request to:', config.url);
  return config;
});

// response interceptor for better error logging
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.log("HERE::: " + JSON.stringify(error?.response));
    return Promise.reject(error);
  }
);

const Videos = ({
  layoutType = "grid",  //this is for UI,in homepage it'll come as a grid in videodetails page comes as a list
  context = "homepage"
}) => {
  // Get sidebar state from outlet context
  const { isSidebar2Open, isVideoDetailsPage } = useOutletContext() || { isSidebar2Open: false, isVideoDetailsPage: false }; 
  const { searchQuery } = useOutletContext();
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const timeoutRef = useRef(null);    //At the time of component mount, there is no active setTimeout, initialized it with null
                                      //using useRef to avoid re-renders

  useEffect(() => {
    const fetchVideos = async () => {
      try {
       
        
        const response = await axiosInstance.get("/videos");
        const data = response.data;
        console.log('Videos data received:', data);

        // Check if data is in array
        if (!Array.isArray(data)) {
          console.error('Received non-array data:', data);
          setError('Invalid data format received from server');
          setLoading(false);
          return;
        }

        const formattedVideos = data.map(item => ({
          videoId: item._id, 
          ytVideoId: extractYoutubeId(item.videoUrl), // Extract YouTube ID
          title: item.title || 'No Title',
          thumbnailUrl: item.thumbnailUrl || 'https://via.placeholder.com/320x180',
          channelTitle: item.channelName || 'Unknown Channel',
          views: item.views || 0,
          publishedAt: formatPublishedDate(item.uploadDate || new Date()),
          category: item.category || 'Uncategorized'
        }));

        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos); //When a user searches for videos, setFilteredVideos updates while videos remains unchanged.
      } catch (err) {
        console.error("Error fetching videos:", err);
        
        const errorDetails = err.response?.data?.message || err.message || 'Unknown error';
        const statusCode = err.response?.status ? `(Status: ${err.response.status})` : '';
        setError(`Failed to load videos ${statusCode}: ${errorDetails}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    
    // Cleanup function
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
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
  }, [activeFilter, videos]);   //activeFilter changes (while select a different category).videos changes (new videos are fetched).

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredVideos(videos);
    } else {
      const filtered = videos.filter(video => 
        video.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVideos(filtered);
    }
  }, [searchQuery, videos]);

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
      if (timeoutRef.current) clearTimeout(timeoutRef.current);   // timer ID stored inside a useRef object,manage the timeout function to play hovered video after a delay.
      timeoutRef.current = setTimeout(() => {
        setHoveredVideo(videoId);
      }, 800);
    }
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredVideo(null);
  };

  if (loading) return <div className="loading p-8 text-center">Loading videos...</div>;
  if (error) return (
    <div className="error p-8 mx-auto max-w-2xl border border-red-300 bg-red-50 rounded-lg">
      <h3 className="text-lg font-medium text-red-800 mb-2">Error loading videos</h3>
      <p className="text-red-700">{error}</p>
      <div className="mt-4 p-4 bg-white rounded border border-gray-200">
        <h4 className="font-medium mb-2">Troubleshooting:</h4>
        <ul className="list-disc pl-5 space-y-2 text-sm">
          <li>Verify that the <code className="bg-gray-100 px-1">/videos</code> endpoint is correctly implemented</li>
        </ul>
      </div>
    </div>
  );

  const videoWrapClass = layoutType === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4'
    : 'flex flex-col space-y-4';
  
  // Only apply sidebar shift on homepage, not on video details page
  const sidebarAdjustment = (context === 'homepage' && isSidebar2Open) ? 'mr-[0px]' : 'ml-[5px]';

  return (
    <div className={`p-4 transition-all duration-300 ease-in-out ${
      context === 'homepage' ? sidebarAdjustment : ''
    }`}>
      {/* Only show category filter on homepage */}
      {context === 'homepage' && (
        <CategoryFilter activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
      )}
      
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
                </div>
              </div>
            ))
          ) : (
            <div className="no-videos p-6 border border-gray-200 rounded-lg bg-gray-50 text-center">
              No videos found for this category
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Videos;