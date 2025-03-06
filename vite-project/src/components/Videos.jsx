import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

const Videos = ({
  isSidebar2Open = false,
  activeFilter = "All",
  layoutType = "grid",
  context = "homepage" // context prop for applying different styles,homepage and videodetails page
}) => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const timeoutRef = useRef(null);  //avoid re-renders, if not used multiple timeouts will be running in parallel.

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const API_KEY = "AIzaSyBlADRamt1PCTDO6dV1pm4YupQPoiU3caE";
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&chart=mostPopular&regionCode=IN&maxResults=20&key=${API_KEY}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }

        const data = await response.json();

        const formattedVideos = data.items.map(item => ({
          videoId: item.id,
          title: item.snippet.title,
          thumbnailUrl: item.snippet.thumbnails.maxres?.url || item.snippet.thumbnails.high.url,
          channelTitle: item.snippet.channelTitle,
          views: parseInt(item.statistics.viewCount).toLocaleString(),
          publishedAt: formatPublishedDate(item.snippet.publishedAt),
          category: getRandomCategory()
        }));

        setVideos(formattedVideos);
        setFilteredVideos(formattedVideos);
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

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

      // video plays after a delay of 800MediaSession,for better ui experience and avoid flickering

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

  return (
    <div className={`p-4 transition-all duration-300 ease-in-out ${
      isSidebar2Open ? 'mr-[0px]' : 'ml-[5px]'
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
        //context-specific styles for related videos
        className={`video relative 
          ${layoutType === 'list' ? 'flex items-start space-x-4' : ''} 
          ${context === 'related' ? 'flex items-start space-x-2 mb-2' : ''}`}
        onMouseEnter={() => handleMouseEnter(video.videoId)}
        onMouseLeave={handleMouseLeave}
      >
  <div 
          // different width for related videos context
          className={`thumbnail-container relative 
            ${layoutType === 'list' ? 'w-1/3' : 'w-full'} 
            ${context === 'related' ? 'w-[160px] shrink-0' : ''}`}
          style={{ 
            position: 'relative', 
            //Adjusted aspect ratio for related videos in videodetails page side video list

            paddingTop: context === 'related' ? '34%' : '56.25%' 
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
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${video.videoId}`}
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
        {/*context-specific styling for video info */}
        {/* context=related is for video details page video list */}
        <div className={`video-info 
  ${layoutType === 'list' ? 'w-2/3' : ''} 
  ${context === 'related' ? 'flex-1 overflow-hidden h-25' : ''}`}
>
  <h2 className={`font-medium line-clamp-2 
    ${context === 'related' ? 'text-[10px] leading-tight' : 'text-sm mt-2'}`}>
    {video.title}
  </h2>
  <p className={`text-gray-400 
    ${context === 'related' ? 'text-[9px] leading-tight mt-0.5' : 'text-xs mt-1'}`}>
    {video.channelTitle}
  </p>
  <p className={`text-gray-400 
    ${context === 'related' ? 'text-[9px] leading-tight mt-0.5' : 'text-xs mt-1'}`}>
    {video.views} views • {video.publishedAt}
  </p>
  {/* Only show category on homepage or list view */}
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