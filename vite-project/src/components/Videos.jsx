import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import "./videos.css";

const Videos = ({
  isSidebar2Open, 
  activeFilter = "All", 
  layoutType = "grid"
}) => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredVideo, setHoveredVideo] = useState(null);
  const timeoutRef = useRef(null);

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
      'Mixes', 'Ideas', 'Webisodes', 'History', 'Kitchens' ,
      'Comedy', 'Gadgets','Asian Music','Presentations','Recently uploaded','Watched','New to you'
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      setHoveredVideo(videoId);
    }, 800);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredVideo(null);
  };

  if (loading) return <div className="loading">Loading videos...</div>;
  if (error) return <div className="error">Error loading videos: {error}</div>;

  // appropriate class based on layout type
  const videoWrapClass = layoutType === 'grid' 
    ? 'video-wrap' 
    : 'flex flex-col space-y-4';

  const contentClass = isSidebar2Open ? "content-shifted" : "content-normal";

  return (
    <div 
      className={`content-container ${isSidebar2Open ? 'content-shifted' : 'content-normal'}`}
      style={{
        // Inline style
        marginLeft: isSidebar2Open ? '240px' : '0',
        width: isSidebar2Open ? 'calc(100% - 240px)' : '100%',
        transition: 'all 0.3s ease-in-out'
      }}
    >
      <div className="wrapper">
        <h1 className="heading">
          {activeFilter === "All" ? "Recommended" : activeFilter}
        </h1>
        <div className={videoWrapClass}>
          {filteredVideos.length > 0 ? (
            filteredVideos.map((video) => (
              <div 
                key={video.videoId} 
                className={`video ${layoutType === 'list' ? 'flex items-start space-x-4' : ''}`}
                onMouseEnter={() => handleMouseEnter(video.videoId)}
                onMouseLeave={handleMouseLeave}
              >
                <div className={`thumbnail-container ${layoutType === 'list' ? 'w-1/3' : ''}`}>
                  {hoveredVideo === video.videoId ? (
                    <div className="video-preview">
                      <iframe 
                        src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  ) : (
                    <Link to={`/video/${video.videoId}`}>
                      <img src={video.thumbnailUrl} alt={video.title} className="video-cover" />
                    </Link>
                  )}
                </div>
                <div className={`video-info ${layoutType === 'list' ? 'w-2/3' : ''}`}>
                  <h2 className="title">{video.title}</h2>
                  <p className="video-desc">
                    {video.channelTitle}
                  </p>
                  <p className="video-desc">
                    {video.views} views • {video.publishedAt}
                  </p>
                  <p className="video-category">
                    {video.category}
                  </p>
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