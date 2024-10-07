// Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Create this CSS file for navbar styling

const Navbar = () => {
  const navigate = useNavigate(); // Use navigate hook from react-router-dom

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('username'); // Assuming 'username' is the key you use to store session data
    // Navigate to login or home page
    navigate('/login'); // Redirect to login page
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
       
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
          
            <li>
              <Link className='nav-link' to="/reviewPage/project/:userId">ReviewPage</Link>
            </li>
            {/* Add more navigation links as needed */}
          </ul>
          <button className="btn btn-outline-danger ms-auto" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
