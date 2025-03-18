import React, { useState } from "react";
import "./Navbar.css";

const Search = ({ searchQuery, setSearchQuery, className, placeholder}) => { 
  // Add default values for props to avoid undefined errors
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);  // Update searchQuery when user types
  };

  return (
    <div className={`navbar-middle ${className}`}> 
 
      <div className="searchbar">
      <input
        type="text"
        value={searchQuery}  // Use searchQuery to display the value in the input
        onChange={handleSearchChange}  // Update state when input changes
        placeholder={placeholder}  
        className="input-class" 
      />
        <button className="search-btn">
          <div className="search-icon">🔍</div>
        </button>
      </div>
      <div className="voice-search">
        <i>🎤</i>
      </div>
    </div>
  );
};

export default Search;
