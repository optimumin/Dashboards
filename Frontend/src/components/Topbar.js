import React from 'react';
import './Topbar.css'; // Importing the CSS file for styling

const Header = () => {
  return (
    <header className="headers">
      <h6 className="project-title">Projects</h6>
      <div className="top-icons">
        <button className="icon-button">
          <span className="material-icons">inbox</span>
        </button>
        <button className="icon-button">
          <span className="material-icons">account_circle</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
