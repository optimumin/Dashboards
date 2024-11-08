import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css'; // Ensure this CSS file exists for custom styling

const Navbar = () => {
  const navigate = useNavigate(); // Use navigate hook from react-router-dom

  const handleLogout = () => {
    // Clear session storage or any other authentication tokens
    sessionStorage.removeItem('username'); // Assuming 'username' is the key for storing user data
    // Navigate to login page
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">IT Audit</Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/projects">Projects</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/reviewPage/project/:userId">Review Page</Link>
            </li>
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
