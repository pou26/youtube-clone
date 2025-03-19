import React from "react";
import { useRouteError } from "react-router-dom";
import { Link } from "react-router-dom";
import "./Error.css"; 

function NotFound() {
  const error = useRouteError();
  console.log(error);

  return (
    <div className="error-container">
      <h1 className="error-title">404 ERROR PAGE</h1>
      <div className="error-content">
      <span className="big-four">4</span>
        <span className="big-zero">0</span>
        <img src="/broken-robot.png" alt="Broken Robot" className="error-image" />
        <span className="big-four">4</span>
      </div>
      <p className="error-message">Uh-oh! Nothing here...</p>
      
      {/* Error details */}
      {error && (
        <div className="error-details">
          <h3>
            {error.status} {error.statusText}
          </h3>
          <h4>{error.data}</h4>
        </div>
      )}

      <Link to="/" className="error-button">GO BACK HOME</Link>
    </div>
  );
}

export default NotFound;
