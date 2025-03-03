import React, { useState } from "react";
import Navbar from "./components/Navbar";
import SideBar from "./components/Sidebar";

const App = () => {
  const [isSidebar2Open, setIsSidebar2Open] = useState(false);

  const toggleSidebar = () => {
    setIsSidebar2Open((prev) => !prev);
  };

  return (
    <div>
      <Navbar isSidebar2Open={isSidebar2Open} toggleSidebar={toggleSidebar} />
      <SideBar isSidebar2Open={isSidebar2Open} />
    </div>
  );
};

export default App;