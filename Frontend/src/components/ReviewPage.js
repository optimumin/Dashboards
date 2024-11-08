import React, { useEffect, useState } from 'react'; 
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure you have Bootstrap included
import './Reviewpage.css'; // Custom styles for the page
import Sidebar from './Sidebar';

const ReviewPage = () => {
  const userId = sessionStorage.getItem('userId');
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState(null);

  const fetchAssessments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/assessments/project/${userId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError("Error fetching assessments. Please try again later.");
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAssessments();
    }
  }, [userId]);

  if (!userId) {
    return <div className="alert alert-warning">No project ID found in session storage.</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (assessments.length === 0) {
    return <div className="alert alert-info">No assessments found for this project.</div>;
  }

  return (
    <div className="container-fluid">
      <Sidebar />
      <header className="headers">
        <h6 className="project-Review">Assessments for User ID: {userId}</h6>
        <div className="top-icons">
          <button className="icon-button">
            <span className="material-icons">inbox</span>
          </button>
          <button className="icon-button">
            <span className="material-icons">account_circle</span>
          </button>
        </div>
      </header>
      
      
      <div className="table-responsive"> 
        {/* Table to display project assessments */}
        <table className="table table-bordered table-striped full-width-table">
          <thead className="table-head">
            <tr>
              <th scope="col">User ID</th>
              <th scope="col">Assessment Name</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {assessments.map((assessment) => (
              <tr key={assessment.assessment_id}>
                <td>{userId}</td>
                <td>{assessment.assessment_name}</td>
                <td>
                  <Link to={`/review-assessment/${assessment.assessment_name}`} className="btn btn-primarys">
                    Review
                  </Link>
                  <Link to={`/edit-assessment/${assessment.assessment_name}`} className="btn btn-primarys">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReviewPage;
