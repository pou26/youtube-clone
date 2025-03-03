import React from "react";
import "./Navbar.css";

const SideBar = ({ isSidebar2Open }) => {
  return (
    <div>
      {/* First Sidebar (Always Visible) */}
      <div className="sidebar">
        <ul>
          <li>Home</li>
          <li>Shorts</li>
          <li>Subscriptions</li>
          <li>You</li>
          <li>Downloads</li>
        </ul>
      </div>
      {/* Second Sidebar */}
      <div className={`sidebar2 ${isSidebar2Open ? "active" : ""}`}>
        <div className="section">
          <ul>
            <li>Home</li>
            <li>Shorts</li>
            <li>Subscriptions</li>
          </ul>
        </div>
        <div className="section">
          <h2>You</h2>
          <ul>
            <li>History</li>
            <li>Playlist</li>
            <li>Your videos</li>
            <li>Your courses</li>
            <li>Watch later</li>
            <li>Downloads</li>
          </ul>
        </div>
        <div className="section">
          <h2>Explore</h2>
          <ul>
            <li>Trending</li>
            <li>Shopping</li>
            <li>Music</li>
            <li>Movies</li>
            <li>Live</li>
            <li>Gaming</li>
            <li>News</li>
            <li>Sports</li>
            <li>Courses</li>
            <li>Fashion</li>
            <li>Beauty</li>
            <li>Podcasts</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
