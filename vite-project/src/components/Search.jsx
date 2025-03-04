import React from "react";
import "./Navbar.css";

const Search=()=>{

    return(
                
    <>
      <div className="navbar-middle">
      <div className="searchbar">
        <input type="text" placeholder="Search" />
        <button className="search-btn">
          <div className="search-icon">🔍</div>
        </button>
      </div>
      <div className="voice-search">
        <i>🎤</i>
      </div>
    </div>
    </>
        );

}

export default Search;