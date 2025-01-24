import React, { useState, useEffect, useRef } from 'react';  
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';  // Import SweetAlert2
import Slider from "react-slick";
import './Dashboard.css';
import Sidebar from './Sidebar';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);  // State to store projects from the backend
  const [chosenAssessments, setChosenAssessments] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (!username) {
      navigate('/login'); 
      return; 
    }

    if (!userId) {
      setError('User ID is missing. Please log in again.');
      return; 
    }
    fetchprojects(userId);  // Call the fetchprojects function to get the user's projects
    fetchAssessmentsForProject(userId);
  }, [navigate, userId]);

  // Function to fetch the projects from the backend
  const fetchprojects = async (userId) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/projects/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch projects.');
      }

      const data = await response.json();
      setProjects(data);  // Set the fetched projects
    } catch (error) {
      setError('Failed to fetch projects. Please try again later.');
      console.error(error);
    }
  };

  // Fetch assessments based on user project
  const fetchAssessmentsForProject = async (userId) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/projects/${userId}/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessments for the project');
      }

      const data = await response.json();
      setChosenAssessments(data); 
    } catch (error) {
      setError('Failed to fetch assessments. Please try again later.');
      console.error(error);
    }
  };

  const assessmentScores = [
    { id: 1, label: 'Physical Security', score: 85 },
    { id: 2, label: 'Environmental Controls', score: 60 },
    { id: 3, label: 'Power Infrastructure', score: 45 },
    { id: 4, label: 'Networking Infrastructure', score: 100 },
    { id: 5, label: 'Server and Hardware', score: 90 },
    { id: 6, label: 'Data Backup and Recovery', score: 35 },
    { id: 7, label: 'Monitoring and Management', score: 75 },
  ];

  const getProgressColor = (score) => {
    if (score >= 75) return 'bg-success';
    if (score >= 50) return 'bg-warning';
    return 'bg-danger';
  };

 

  //logout
  const handleLogout = () => {
    // Trigger SweetAlert2 confirmation dialog
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of your session!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Logout',
      cancelButtonText: 'Cancel',
      background: '#f5f5f5',
      customClass: {
        popup: 'logout-popup', // Optional: you can create custom CSS for styling
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Perform the logout operation
        sessionStorage.clear();
        navigate('/login');
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been logged out successfully.',
          icon: 'success',
          confirmButtonColor: '#3085d6',
        });
      }
    });
  };

  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Sidebar />
      
      <div className="container-fluid">
        {error && <div className="alert alert-danger">{error}</div>}
        <header className="header">
          <h6 className="dashboard-title">Dashboard</h6>
          <div className="top-icons">
            <button className="icon-button">
              <span className="material-icons">inbox</span>
            </button>
            <button className="icon-button" onClick={handleLogout}>
              <span className="material-icons">account_circle</span>
            </button>
          </div>
        </header>
        <div className="projects-carousel-container">
        <button className="scroll-button left" onClick={handleScrollLeft}>&#10094;</button>
        <div className="projects-carousel" ref={scrollContainerRef}>
            {projects.map((project) => (
              <div key={project.project_id} className="project-card">
                <h3>{project.project_name}</h3>
                <p>Progress: {project.progress}%</p>
              <div className="progress-bars">
                <div className="progres" style={{ width: `${project.progress}%` }}>
                  {project.progress}%
                </div>
              </div>
              <p>Assessments: {project.assessmentsCompleted}/{project.totalAssessments}</p>
            </div>
            ))}

        </div>
        <button className="scroll-button right" onClick={handleScrollRight}>&#10095; </button>

        </div>
       


        {/* Chosen Assessments Section */}
        <div className="chosen-assessments-container">
          <div className="col-md-10 offset-md-2">
            <div className="card">
              <div className="card-body">
                <h5 className="card-titles">Chosen Assessments</h5>
                <div className="chosen-assessments-border">
                  <ul className="list-group">
                    {chosenAssessments.length > 0 ? (
                      chosenAssessments.map(({ assessment_id, assessment_name }) => (
                        <li key={assessment_id} className="list-group-item d-flex justify-content-between align-items-left">
                          {assessment_name}
                          <Link to={`/assessments/${assessment_name}`} className="btn btn-outline-dark btn-sm">View</Link>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-center">No assessments available for this project</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assessment Scores Section */}
        <div className="Assessment-score">
          <div className="col-md-10 offset-md-2">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Assessment Scores</h5>
                {assessmentScores.map(({ id, label, score }) => (
                  <div key={id} className="score d-flex align-items-left mb-3">
                    <div className="progress w-90">
                      <div className={`progress-bar ${getProgressColor(score)}`} 
                           role="progressbar" 
                           style={{ width: `${score}%` }} 
                           aria-valuenow={score} 
                           aria-valuemin="0" 
                           aria-valuemax="100">
                        <span>{label} - {score}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
