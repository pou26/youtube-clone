// Navbar.jsx - Enhanced YouTube style
import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";
import Search from "./Search";

const Navbar = ({ isSidebar2Open, toggleSidebar }) => {
  return (
    <nav className="navbar">
      {/* Left section */}
      <div className="navbar-left">
        {/* Hamburger Menu (Triggers Sidebar2) */}
        <div className="hamburger" onClick={toggleSidebar}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
        
        {/* Logo */}
        <div className="logo">
          <Link to="/">
            <img src="youtube.png" alt="logo" />
            <span>YouTube</span>
            <sup>IN</sup>
          </Link>
        </div>
      </div>
      
      {/* Middle section - Search */}

      <Search/>
      
      {/* Right section */}
      <div className="navbar-right">
        <div className="icon-btn">
          📹
        </div>
        <div className="icon-btn">
          🔔
          <div className="notification-badge">
            <div className="badge">9+</div>
          </div>
        </div>
        <div className="login-btn">
          👤
          <span>Sign in</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;