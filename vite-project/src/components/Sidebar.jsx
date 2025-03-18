import React from "react";
import "./Sidebar.css";

const SideBar = ({ isSidebar2Open, isVideoDetailsPage }) => {
  return (
    <div>
      {/* First Sidebar (Always Visible) */}
      <div className="sidebar">
        <ul className="mobile-optimized">
            <li><span className="icon">🏠</span> <span className="text">Home</span></li>
            <li><span className="icon">🎬</span> <span className="text">Shorts</span></li>
            <li><span className="icon">📺</span> <span className="text">Subs</span></li>
            <li><span className="icon">📚</span> <span className="text">You</span></li>
            <li><span className="icon">⬇️</span> <span className="text">Downloads</span></li>
        </ul>
      </div>
      
      {/* Second Sidebar (Toggles) */}
      <div className={`sidebar2 ${isSidebar2Open ? "active" : ""} ${
        isVideoDetailsPage ? "overlay-sidebar" : ""
      }`}>
        <div className="section">
          <ul className="mobile-compact">
            <li><span className="icon">🏠</span> <span className="label">Home</span></li>
            <li><span className="icon">🎬</span> <span className="label">Shorts</span></li>
            <li><span className="icon">📺</span> <span className="label">Subscriptions</span></li>
          </ul>
        </div>
        
        <div className="section">
          <h2>You</h2>
          <ul className="mobile-compact">
            <li><span className="icon">⏱️</span> <span className="label">History</span></li>
            <li><span className="icon">🎵</span> <span className="label">Your Videos</span></li>
            <li><span className="icon">⌚</span> <span className="label">Watch Later</span></li>
            <li><span className="icon">👍</span> <span className="label">Liked Videos</span></li>
            <li><span className="icon">⬇️</span> <span className="label">Downloads</span></li>
          </ul>
        </div>
        
        <div className="section">
          <h2>Subscriptions</h2>
          <ul className="mobile-compact">
            <li><span className="icon">👤</span> <span className="label">Channel 1</span></li>
            <li><span className="icon">👤</span> <span className="label">Channel 2</span></li>
            <li><span className="icon">👤</span> <span className="label">Channel 3</span></li>
            <li><span className="icon">👤</span> <span className="label">Channel 4</span></li>
          </ul>
        </div>
        
        <div className="section">
          <h2>Explore</h2>
          <ul className="mobile-compact">
            <li><span className="icon">🔥</span> <span className="label">Trending</span></li>
            <li><span className="icon">🛍️</span> <span className="label">Shopping</span></li>
            <li><span className="icon">🎵</span> <span className="label">Music</span></li>
            <li><span className="icon">🎞️</span> <span className="label">Movies</span></li>
            <li><span className="icon">📡</span> <span className="label">Live</span></li>
            <li><span className="icon">🎮</span> <span className="label">Gaming</span></li>
            <li><span className="icon">📰</span> <span className="label">News</span></li>
            <li><span className="icon">⚽</span> <span className="label">Sports</span></li>
            <li><span className="icon">💡</span> <span className="label">Learning</span></li>
            <li><span className="icon">💄</span> <span className="label">Fashion & Beauty</span></li>
            <li><span className="icon">🎙️</span> <span className="label">Podcasts</span></li>
          </ul>
        </div>
        
        <div className="section">
          <h2>More from YouTube</h2>
          <ul className="mobile-compact">
            <li><span className="icon">📱</span> <span className="label">YouTube Premium</span></li>
            <li><span className="icon">📺</span> <span className="label">YouTube Studio</span></li>
            <li><span className="icon">🎵</span> <span className="label">YouTube Music</span></li>
            <li><span className="icon">👶</span> <span className="label">YouTube Kids</span></li>
          </ul>
        </div>
        
        <div className="section">
          <ul className="mobile-compact">
            <li><span className="icon">⚙️</span> <span className="label">Settings</span></li>
            <li><span className="icon">🚩</span> <span className="label">Report history</span></li>
            <li><span className="icon">❓</span> <span className="label">Help</span></li>
            <li><span className="icon">💬</span> <span className="label">Send feedback</span></li>
          </ul>
        </div>
        
        <div className="section footer-section">
          <div className="footer-text">
            About Press Copyright Contact us Creators Advertise Developers
          </div>
          <div className="footer-text">
            Terms Privacy Policy & Safety How YouTube works Test new features
          </div>
          <div className="copyright">©️ 2025 Google LLC</div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;