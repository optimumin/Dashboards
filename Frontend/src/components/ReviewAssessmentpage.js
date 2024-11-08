import React, { useEffect, useState } from 'react'; 
import { useParams,useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';
import './ReviewAssessmentpage.css'

const ReviewAssessmentPage = () => {
  const { assessment_name } = useParams();
  const [submittedResponses, setSubmittedResponses] = useState([]);
  const [reviewerComments, setReviewerComments] = useState({}); // State to store reviewer comments for all questions
  const navigate = useNavigate();  // Initialize useNavigate
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


    // Handle reviewer comment change for each question
    const handleCommentChange = (questionId, comment) => {
      setReviewerComments((prevComments) => ({
        ...prevComments,
        [questionId]: comment, // Store the comment based on the question ID
      }));
    };
  
    // Handle submit button for all reviewer comments
    const handleSubmitAllComments = async () => {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        alert("User not logged in.");
        return;
      }

      // Collect all comments into an array
    const commentsToSubmit = Object.entries(reviewerComments).map(([questionId, reviewer_comment]) => ({
      question_id: questionId,
      reviewer_comment,
      assessment_name,  // Include assessment name
      user_id: userId   // Include user ID
    }));

    if (commentsToSubmit.length === 0) {
      alert("Please enter comments before submitting.");
      return;
    }

    // API call to submit all the reviewer comments
    try {
      const response = await fetch(`http://localhost:5000/api/submit_reviewer_comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentsToSubmit), // Submit all comments together
      });

      if (!response.ok) {
        throw new Error("Failed to submit reviewer comments");
      }

       // Clear reviewer comments after successful submission
       setReviewerComments({});
      alert("All reviewer comments submitted successfully!");
     navigate(`/reviewPage/project/${assessment_name}`);  // Navigate to the review page

    } catch (err) {
      alert(`Error submitting comments: ${err.message}`);
    }
  };

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
       <header className="headerss">
       <h6 className='AssessmentReview'>Assessment Review</h6>
        <div className="top-icons">
          <button className="icon-button">
            <span className="material-icons">inbox</span>
          </button>
          <button className="icon-button">
            <span className="material-icons">account_circle</span>
          </button>
        </div>
      </header>
      
      
    <Sidebar/>
      <h5 className="text-left mb-4">Review: {assessment_name}</h5>
      {submittedResponses.length > 0 ? (
        submittedResponses.map((section) => (
          <div key={section.Section_Name} className="card-review mb-4"> {/* Unique key for section */}
            <div className="card-headerss bg-secondary text-white">
              <h4 className="mb-0">{section.Section_Name}</h4>
            </div>
            <div className="card-bodies">
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
                    {/* Reviewer Comment Textarea */}
                    <div className="mt-3">
                    <label htmlFor={`reviewer-comment-${question.question_id}`}><strong>Reviewer Comments:</strong></label>
                    <textarea
                      id={`reviewer-comment-${question.question_id}`}
                      className="form-control"
                      rows="3"
                      value={reviewerComments[question.question_id] || ''}
                      onChange={(e) => handleCommentChange(question.question_id, e.target.value)}
                      placeholder="Enter your comment here..."
                    />
                  </div>
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

      {/* Submit All Comments Button */}
      <div className="text-center mt-4">
        <button
          className="btn btn-primary"
          onClick={handleSubmitAllComments}
        >Review
        </button>
      </div>
    </div>
  );
};

export default ReviewAssessmentPage;
