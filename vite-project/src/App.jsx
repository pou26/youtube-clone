import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/SideBar";
import { Outlet } from "react-router-dom";
import "./App.css";
import "./index.css";

const App = () => {
  const [isSidebar2Open, setIsSidebar2Open] = useState(false);

  const toggleSidebar = () => setIsSidebar2Open((prev) => !prev);

  return (
    <div className="app-container">
      <Navbar toggleSidebar={toggleSidebar} />
      <SideBar 
        isSidebar2Open={isSidebar2Open} 
        toggleSidebar={toggleSidebar} 
      />
      <div 
        className={`content-wrapper transition-all duration-300 ease-in-out ${
          isSidebar2Open ? 'ml-[312px]' : 'ml-[72px]'
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default App;