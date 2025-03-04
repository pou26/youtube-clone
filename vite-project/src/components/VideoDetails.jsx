import { useParams, Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Videos from "./Videos";

async function fetchVideoDetails(id) {
  const API_KEY = "AIzaSyBlADRamt1PCTDO6dV1pm4YupQPoiU3caE";
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch video details");
  }

  const data = await response.json();
  const video = data.items[0]; // The first item will be the video

  return {
    title: video.snippet.title,
    description: video.snippet.description,
    channelTitle: video.snippet.channelTitle,
    views: parseInt(video.statistics.viewCount).toLocaleString(),
    publishedAt: formatPublishedDate(video.snippet.publishedAt),
    thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high.url,
  };
}

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

const VideoDetails = () => {
  const { id } = useParams();
  const [videoDetails, setVideoDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getVideoDetails = async () => {
      try {
        const details = await fetchVideoDetails(id);
        setVideoDetails(details);
      } catch (err) {
        setError(err.message);
      }
    };

    getVideoDetails();
  }, [id]);

  if (error) return <div className="error">Error: {error}</div>;
  if (!videoDetails) return <div className="loading">Loading video details...</div>;

  return (
    <div className="flex flex-col md:flex-row gap-8 p-4 md:p-8 bg-[#111] text-white">
      {/* Video details section */}
      <div className="md:w-2/3 lg:w-3/4">
        <div className="mb-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{videoDetails.title}</h1>
          <div className="aspect-video mb-4">
            <iframe 
              src={`https://www.youtube.com/embed/${id}`}
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
      <div className="md:w-1/3 lg:w-1/4 overflow-y-auto max-h-[90vh]">
        <h2 className="text-lg font-semibold mb-4">Related Videos</h2>
        <Videos 
          activeFilter="All" 
          layoutType="list"  //vertical list
        />
      </div>
    </div>
  );
};

export default VideoDetails;