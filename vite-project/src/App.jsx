import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import "./App.css";
import "./index.css";

const App = () => {
  const [isSidebar2Open, setIsSidebar2Open] = useState(false);
  const location = useLocation();
  
  // Check if we're on the video details page
  const isVideoDetailsPage = location.pathname.includes('/video/');
  
  const toggleSidebar = () => setIsSidebar2Open((prev) => !prev);
  
  return (
    <div className="app-container">
      <Navbar toggleSidebar={toggleSidebar} />
      <SideBar 
        isSidebar2Open={isSidebar2Open} 
        toggleSidebar={toggleSidebar}
        isVideoDetailsPage={isVideoDetailsPage}
      />
      <div 
        className={`content-wrapper transition-all duration-300 ease-in-out ${
          isSidebar2Open && !isVideoDetailsPage ? 'ml-[180px]' : 'ml-[0px] mt-[70px]'
        }`}
      >
        <Outlet context={{ isSidebar2Open, isVideoDetailsPage }} />
      </div>
    </div>
  );
};

export default App;