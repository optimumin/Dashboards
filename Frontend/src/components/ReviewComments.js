import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';
import './ReviewComments.css'
const ReviewComments = () => {
  const { assessment_name } = useParams();
  const [reviewerComments, setReviewerComments] = useState({});
  const [submittedResponses, setSubmittedResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      setError('User not logged in.');
      setLoading(false);
      return;
    }

    const fetchComments = () => {
      return fetch(`http://localhost:5000/api/get_reviewer_comments?user_id=${userId}&assessment_name=${assessment_name}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch reviewer comments');
          }
          return response.json();
        })
        .then((data) => {
          const commentsByQuestion = {};
          data.forEach((comment) => {
            commentsByQuestion[comment.question_id] = comment.reviewer_comment;
          });
          setReviewerComments(commentsByQuestion);
        })
        .catch(() => {
          setError('Failed to fetch reviewer comments');
        });
    };

    const fetchSubmittedResponses = () => {
      return fetch(
        `http://localhost:5000/api/get_submitted_assessment_data/${assessment_name}/${userId}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch submitted responses');
          }
          return response.json();
        })
        .then((data) => {
          setSubmittedResponses(data);
        })
        .catch(() => {
          setError('Failed to fetch submitted responses');
        });
    };

    const fetchData = async () => {
      setLoading(true);
      await Promise.allSettled([fetchComments(), fetchSubmittedResponses()]);
      setLoading(false);
    };

    fetchData();
  }, [assessment_name]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5">
      <Sidebar />
      <h4>Review:{assessment_name}</h4>
      <div className="card">
        <div className="card-header">Submitted Responses with Reviewer Comments</div>
        <div className="card-body">
          {submittedResponses.length === 0 ? (
            <p>No responses submitted</p>
          ) : (
            submittedResponses.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-4">
                <h6> {section.section_name}</h6>
                {section.Questions.map((question) => (
                  <div key={question.question_id} className="mb-4 p-3 border rounded">
                    <div className="fw-bold">
                      Question {question.question_id}: {question.question_text}
                    </div>
                    <div>
                      <strong>Selected Option:</strong>{' '}
                      {question.selected_option_text || 'No option selected'}
                    </div>
                    <div>
                      <strong>Comment:</strong>{' '}
                      {question.response_comment || 'No comment'}
                    </div>
                    {question.response_file_url && (
                      <div>
                      <strong>File:</strong> {question.response_file_url} 
                    </div>
                    )}
                    <div className="mt-3">
                      <strong>Reviewer Comment:</strong>{' '}
                      {reviewerComments[question.question_id] || 'No reviewer comment available'}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewComments;
