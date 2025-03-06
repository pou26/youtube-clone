import React from "react";
import "./Sidebar.css"

const SideBar = ({ isSidebar2Open, isVideoDetailsPage }) => {
  return (
    <div>
      {/* First Sidebar (Always Visible)*/}
      <div className="sidebar">
        <ul>
            <li><span className="icon">🏠</span> <span className="text">Home</span></li>
            <li><span className="icon">🎬</span> <span className="text">Shorts</span></li>
            <li><span className="icon">📺</span> <span className="text">Subs</span></li>
            <li><span className="icon">📚</span> <span className="text">You</span></li>
            <li><span className="icon">⬇️</span> <span className="text">Downloads</span></li>
        </ul>
      </div>
      
      {/* Second Sidebar (Toggles)*/}
      <div className={`sidebar2 ${isSidebar2Open ? "active" : ""} ${
        isVideoDetailsPage ? "overlay-sidebar" : ""
      }`}>
        <div className="section">
          <ul>
            <li>🏠 Home</li>
            <li>🎬 Shorts</li>
            <li>📺 Subscriptions</li>
          </ul>
        </div>
        
        <div className="section">
          <h2>You</h2>
          <ul>
            <li>⏱️ History</li>
            <li>🎵 Your Videos</li>
            <li>⌚ Watch Later</li>
            <li>👍 Liked Videos</li>
            <li>⬇️ Downloads</li>
          </ul>
        </div>
        
        <div className="section">
          <h2>Subscriptions</h2>
          <ul>
            <li>👤 Channel 1</li>
            <li>👤 Channel 2</li>
            <li>👤 Channel 3</li>
            <li>👤 Channel 4</li>
          </ul>
        </div>
        
        <div className="section">
          <h2>Explore</h2>
          <ul>
            <li>🔥 Trending</li>
            <li>🛍️ Shopping</li>
            <li>🎵 Music</li>
            <li>🎞️ Movies</li>
            <li>📡 Live</li>
            <li>🎮 Gaming</li>
            <li>📰 News</li>
            <li>⚽ Sports</li>
            <li>💡 Learning</li>
            <li>💄 Fashion & Beauty</li>
            <li>🎙️ Podcasts</li>
          </ul>
        </div>
        
        <div className="section">
          <h2>More from YouTube</h2>
          <ul>
            <li>📱 YouTube Premium</li>
            <li>📺 YouTube Studio</li>
            <li>🎵 YouTube Music</li>
            <li>👶 YouTube Kids</li>
          </ul>
        </div>
        
        <div className="section">
          <ul>
            <li>⚙️ Settings</li>
            <li>🚩 Report history</li>
            <li>❓ Help</li>
            <li>💬 Send feedback</li>
          </ul>
        </div>
        
        <div className="section" style={{ padding: "16px", fontSize: "12px", color: "#aaa" }}>
          <div style={{ marginBottom: "16px" }}>
            About Press Copyright Contact us Creators Advertise Developers
          </div>
          <div style={{ marginBottom: "16px" }}>
            Terms Privacy Policy & Safety How YouTube works Test new features
          </div>
          <div>©️ 2025 Google LLC</div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;