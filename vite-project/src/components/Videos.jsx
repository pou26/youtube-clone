import React, { useEffect, useState } from "react";
import videosData from "../utils/mockData.json";

const Videos = () => {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    setVideos(videosData);
  }, []);

  return (
    <>
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Clone</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div key={video.videoId} className="bg-gray-100 p-3 rounded-lg shadow-md">
            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-40 object-cover rounded-md" />
            <h2 className="mt-2 text-lg font-semibold">{video.title}</h2>
            <p className="text-gray-600">{video.uploader} • {video.views} views • {video.uploadDate}</p>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};

export default Videos;
