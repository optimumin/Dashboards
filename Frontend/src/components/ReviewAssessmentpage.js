import React, { useEffect, useState } from 'react'; 
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const ReviewAssessmentPage = () => {
  const { assessment_name } = useParams();
  const [submittedResponses, setSubmittedResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch submitted responses when the component mounts
  useEffect(() => {
    // Clear previous responses when assessment changes
    setSubmittedResponses([]);

    const fetchSubmittedResponses = async () => {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/get_submitted_assessment_data/${assessment_name}/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch submitted responses');
        }
        const data = await response.json();
        console.log("Fetched data:", data);  // Log the fetched data for debugging
        setSubmittedResponses(data);
      } catch (err) {
        console.error('Error fetching data:', err);  // Log any errors
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    console.log("Fetching responses for:", assessment_name);  // Log the current assessment name
    fetchSubmittedResponses();
  }, [assessment_name]);  // Refetch responses when assessment_name changes

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger text-center" role="alert">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h3 className="text-center mb-4">Submitted Responses for {assessment_name}</h3>
      {submittedResponses.length > 0 ? (
        submittedResponses.map((section) => (
          <div key={section.Section_Name} className="card mb-4"> {/* Unique key for section */}
            <div className="card-header bg-secondary text-white">
              <h4 className="mb-0">{section.Section_Name}</h4>
            </div>
            <div className="card-body">
              {section.Questions.map((question) => (
                <div key={question.question_id} className="mb-4 p-3 border rounded"> {/* Unique key for question */}
                  <div className="fw-bold">Question {question.question_id} : {question.question_text}</div>
                  <div>
                    <strong>Selected Option:</strong> {question.selected_option_text || 'No option selected'}
                  </div>
                  <div>
                    <strong>Comment:</strong> {question.response_comment || 'No comment'}
                  </div>
                  {question.response_file_url && (
                    <div>
                      <strong>File:</strong> {question.response_file_url} 
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="alert alert-info text-center">
          No submitted responses found for this assessment.
        </div>
      )}
    </div>
  );
};

export default ReviewAssessmentPage;
