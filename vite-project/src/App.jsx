import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SideBar from './components/SideBartemp';
// import Videos from "./components/Videos";
import { Outlet, useLocation } from "react-router-dom";
import { useSearch } from './components/SearchContext';
import "./App.css";
import "./index.css";

const App = () => {
  const [isSidebar2Open, setIsSidebar2Open] = useState(false);
  const { searchQuery } = useSearch(); 
  const location = useLocation();
  
  // Check if it is the video details page,current page's URL contains "/video/"
  const isVideoDetailsPage = location.pathname.includes('/video/');
  
  const toggleSidebar = () => setIsSidebar2Open((prev) => !prev);   //prev is current state,!prev flips the value (true → false or false → true).
  
  return (
<div className="app-container">
  {/* Navbar with sidebar toggle functionality */}
  <Navbar toggleSidebar={toggleSidebar} />      {/* receives toggleSidebar as a prop. */}

  
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
{/* prevents the homepage sidebar-open styling. */}


    <Outlet context={{ isSidebar2Open, isVideoDetailsPage,searchQuery }} />    {/* pass data to all child components rendered by Outlet,prop drilling not needed*/}
   
  </div>
</div>
  );
};

export default App;