import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ isSidebar2Open, toggleSidebar }) => {
  return (
    <nav className="navbar">
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
          YOUTUBE
        </Link>
      </div>
      {/* Search Bar */}
      <div className="searchbar">
        <input type="text" placeholder="Search" />
      </div>
      {/* Notification Icon */}
      <div className="notification">🔔</div>
      {/* Login Option */}
      <div className="login">Login</div>
    </nav>
  );
};

export default Navbar;