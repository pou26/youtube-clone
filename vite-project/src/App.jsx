import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import Videos from "./components/Videos";
import { Outlet, useLocation } from "react-router-dom";
import { useSearch } from './components/SearchContext';
import "./App.css";
import "./index.css";

const App = () => {
  const [isSidebar2Open, setIsSidebar2Open] = useState(false);
  const { searchQuery } = useSearch(); 
  const location = useLocation();
  
  // Check if we're on the video details page
  const isVideoDetailsPage = location.pathname.includes('/video/');
  
  const toggleSidebar = () => setIsSidebar2Open((prev) => !prev);
  
  return (
<div className="app-container">
  {/* Navbar with sidebar toggle functionality */}
  <Navbar toggleSidebar={toggleSidebar} />
  
  {/* Sidebar components */}
  <SideBar
    isSidebar2Open={isSidebar2Open}
    toggleSidebar={toggleSidebar}
    isVideoDetailsPage={isVideoDetailsPage}
  />
  
  {/* Content wrapper with responsive spacing using custom classes */}
  <div
    className={`content-wrapper transition-all duration-300 ease-in-out ${
      isSidebar2Open && !isVideoDetailsPage 
        ? 'sidebar-open' 
        : 'sidebar-closed mt-[70px]'
    }`}
  >
    <Outlet context={{ isSidebar2Open, isVideoDetailsPage,searchQuery }} />
  </div>
</div>
  );
};

export default App;