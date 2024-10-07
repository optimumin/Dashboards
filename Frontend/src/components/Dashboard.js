import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../Dashboard.css';

const Dashboard = () => {
  const [chosenAssessments, setChosenAssessments] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
 // const projectId = sessionStorage.getItem('projectId'); // Get the project ID from session storage
 const userId = sessionStorage.getItem('userId'); // Assuming userId is also stored

  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (!username) {
      navigate('/login'); // Redirect to login if not authenticated
    }

    if (!userId) {
      setError('ProjectID is missing. Please log in again.');
      return; // Stop further execution if no projectId
    }

    // Fetch assessments for the project if projectId is available
    fetchAssessmentsForProject(userId);
  }, [navigate, userId]);

  // Function to fetch assessments for a specific project
  const fetchAssessmentsForProject = async (userId) => {
    try {
      const token = sessionStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/projects/${userId}/assessments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assessments for the project');
      }

      const data = await response.json();
      setChosenAssessments(data); // Set the assessments related to the project
    } catch (error) {
      setError('Failed to fetch assessments. Please try again later.');
      console.error(error);
    }
  };

  // Updated assessment scores data
  const assessmentScores = [
    { id: 1, label: 'Physical Security', score: 85 },
    { id: 2, label: 'Environmental Controls', score: 60 },
    { id: 3, label: 'Power Infrastructure', score: 70 },
    { id: 4, label: 'Networking Infrastructure', score: 55 },
    { id: 5, label: 'Server and Hardware', score: 90 },
    { id: 6, label: 'Data Backup and Recovery', score: 65 },
    { id: 7, label: 'Monitoring and Management', score: 75 }
  ];

  // Function to determine the color based on score
  const getProgressColor = (score) => {
    if (score >= 75) {
      return 'bg-success'; // Green for success
    } else if (score >= 50) {
      return 'bg-warning'; // Yellow for warning
    } else {
      return 'bg-danger'; // Red for danger
    }
  };

  return (
    <div>
      <Navbar />
      <h2 className="col-md-8 offset-md-2 mb-4">Dashboard</h2>
      {/* Display error if it exists */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title chosen-assessments-heading">Chosen Assessments</h5>
              <div className="chosen-assessments-border">
              <ul className="list-group">
      {chosenAssessments.length > 0 ? (
        chosenAssessments.map(({ assessment_id, assessment_name }) => (
          <li key={assessment_id} className="list-group-item d-flex justify-content-between align-items-center">
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
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title assessment-scores-heading">Assessment Scores</h5>
              <div className="assessment-scores-border">
                {/* Render improved assessment scores visualization */}
                {assessmentScores.map(score => (
                  <div key={score.id} className="d-flex align-items-center mb-3">
                    <div className="w-25">
                      <span className="bar-label">{score.label}</span>
                    </div>
                    <div className="progress w-75">
                      <div className={`progress-bar ${getProgressColor(score.score)}`} role="progressbar" style={{ width: `${score.score}%` }} aria-valuenow={score.score} aria-valuemin="0" aria-valuemax="100">
                        {score.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* All Assessments Section */}
      <div className="row">
        <div className="col-md-8 offset-md-2">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title chosen-assessments-heading">All Assessments</h5>
              <div className="chosen-assessments-border">
                <ul className="list-group">
                  {assessmentScores.map(score => (
                    <li key={score.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {score.label}
                      <Link to={`/assessments/${score.label}`} className="btn btn-outline-dark btn-sm btn-hover-effect">View</Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
