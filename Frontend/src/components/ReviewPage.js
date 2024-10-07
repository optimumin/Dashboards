import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure you have Bootstrap included

const ReviewPage = () => {
  // Retrieve projectId and userId from session storage
  const projectId = sessionStorage.getItem('projectId'); // Ensure this is set earlier in your app
  const userId = sessionStorage.getItem('userId'); // Assuming userId is also stored
  const [assessments, setAssessments] = useState([]);
  const [error, setError] = useState(null); // State for error handling

  // Fetch assessments based on project ID
  const fetchAssessments = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/assessments/project/${userId}`); // Ensure backend URL is correct
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      setAssessments(data);
    } catch (error) {
      console.error("Error fetching assessments:", error);
      setError("Error fetching assessments. Please try again later."); // Set error state
    }
  };

  // Run fetchAssessments when component mounts and when projectId changes
  useEffect(() => {
    if (userId) {
      fetchAssessments();
    }
  }, [userId]);

 
  // Handle case when projectId is missing from session storage
  if (!userId) {
    return <div className="alert alert-warning">No project ID found in session storage.</div>;
  }

  // Display error if there is an issue with fetching the data
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  // Display message if no assessments are found
  if (assessments.length === 0) {
    return <div className="alert alert-info">No assessments found for this project.</div>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Assessments for Project ID: {userId}</h2>
      
      {/* Table to display project assessments */}
      <table className="table table-bordered table-striped">
        <thead className="thead-dark">
          <tr>
            <th scope="col">User ID</th>
            <th scope="col">Assessment Name</th>
            <th scope="col">Review</th>
            <th scope="col">Actions</th>

          </tr>
        </thead>
        <tbody>
          {/* Loop through assessments and display each in a row */}
          {assessments.map((assessment) => (
            <tr key={assessment.assessment_id}>
              <td>{userId}</td> {/* Display projectId */}
              <td>{assessment.assessment_name}</td> {/* Display assessment name */}
              <td>
                {/* Link to review page for specific assessment */}
                <Link 
                  to={`/review-assessment/${assessment.assessment_name}`} 
                  className="btn btn-primary">
                  Review {assessment.assessment_name}
                </Link>
              </td>
              <td>
                {/* Add Edit Button */}
                <Link to={`/edit-assessment/${assessment.assessment_name}`} className="btn btn-secondary">
                  Edit
                </Link>
                </td>
                
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ReviewPage;
