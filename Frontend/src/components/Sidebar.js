import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css'; // Custom CSS for sidebar styling

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2 className="sidebar-title">IT Audit</h2>
      <ul className="sidebar-links">
      <li>
          <Link to="/ProjectTable" className="sidebar-link" >Projects</Link>
        </li>
        <li>
          <Link to="/dashboard" className="sidebar-link" >Dashboard</Link>
        </li>
        
        <li>
          <Link to="/" className="sidebar-link">Admin</Link>
        </li>
        
      </ul>
    </div>
  );
};

export default Sidebar;
