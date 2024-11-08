import React, { useEffect, useState } from 'react';  
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from './Sidebar';
import './EditAssessmentPage.css'

const EditAssessmentPage = () => {
  const { assessment_name } = useParams();
  const navigate = useNavigate();

  const [assessmentData, setAssessmentData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responses, setResponses] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAssessmentData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/assessments/${assessment_name}`);
        if (!response.ok) {
          throw new Error('Failed to fetch assessment data');
        }
        const data = await response.json();
        setAssessmentData(data);

        // Fetch existing responses for the user and populate the form
        const userId = sessionStorage.getItem('userId');
        if (userId) {
          const responseRes = await fetch(`http://localhost:5000/api/responses/${userId}`);
          const existingResponses = await responseRes.json();

          // Populate responses with existing data
          const formattedResponses = {};
          existingResponses.forEach((resp) => {
            formattedResponses[resp.question_id] = {
              option: resp.option_id,
              file: resp.response_file, // Handle file inputs differently
              comment: resp.response_comment,
            };
          });
          setResponses(formattedResponses);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessment_name]);

  const handleInputChange = (questionId, type, value) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [questionId]: {
        ...prevResponses[questionId],
        [type]: type === 'file' ? value : value,
      },
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    assessmentData.Sections?.forEach((section) => {
      section.Questions.forEach((question) => {
        if (!responses[question.question_id]) {
          errors[question.question_id] = { option: 'Option is required', file: 'File is required', comment: 'Comment is required' };
          isValid = false;
        } else {
          if (!responses[question.question_id].option) {
            errors[question.question_id] = { ...errors[question.question_id], option: 'Option is required' };
            isValid = false;
          }
          if (!responses[question.question_id].file) {
            errors[question.question_id] = { ...errors[question.question_id], file: 'File is required' };
            isValid = false;
          }
          if (!responses[question.question_id].comment) {
            errors[question.question_id] = { ...errors[question.question_id], comment: 'Comment is required' };
            isValid = false;
          }
        }
      });
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = sessionStorage.getItem('userId');

    if (!userId) {
      alert('User ID is required.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    Object.keys(responses).forEach((questionId) => {
      const response = responses[questionId];
      formData.append(`responses[${questionId}][user_id]`, userId);
      formData.append(`responses[${questionId}][question_id]`, questionId);
      formData.append(`responses[${questionId}][option_id]`, response.option || '');
      formData.append(`responses[${questionId}][response_comment]`, response.comment || '');
      if (response.file) {
        formData.append(`responses[${questionId}][response_file]`, response.file);
      }
    });

    try {
      const response = await fetch('http://localhost:5000/api/responses/update', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to update responses');
      }

      alert('Assessment updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) return <div>Loading assessment data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mt-5">
    <Sidebar/>
     <header className="head-edit">
                <h6 className="edit-title">Edit AssessmentForm</h6>
                <div class="top-icons">
                    <button class="icon-button">
                        <span class="material-icons">inbox</span>
                    </button>
                    <button className="icon-button">
              <span className="material-icons">account_circle</span>
            </button>
                </div>
         </header>
         <h5 className="text-left mb-4">Edit Assessment: {assessmentData['Assessment Name']}</h5>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card-edit ">
            <div className="card-body-edit">
              <form onSubmit={handleSubmit}>
                {assessmentData.Sections && assessmentData.Sections.map((section, index) => (
                  <div key={index} className="card mb-4">
                    <div className="card-header bg-secondary text-white">
                      <h4 className="mb-0">{section.Section_name}</h4>
                    </div>
                    <div className="card-body">
                      {section.Questions.map((question) => (
                        <div key={question.question_id} className="mb-4">
                          <div className="fw-bold">Question {question.question_id} : {question.question_text}</div>
                          <div className="mb-3">
                            <select
                              id={`select-${question.question_id}`}
                              className={`form-select ${formErrors[question.question_id]?.option ? 'is-invalid' : ''}`}
                              value={responses[question.question_id]?.option || ''}
                              onChange={(e) => handleInputChange(question.question_id, 'option', e.target.value)}
                            >
                              <option value="">Select an option</option>
                              {question.options && question.options.map((option, oIndex) => (
                                <option key={oIndex} value={option.option_id}>
                                  {option.option_text}
                                </option>
                              ))}
                            </select>
                            {formErrors[question.question_id]?.option && <div className="invalid-feedback">{formErrors[question.question_id].option}</div>}
                          </div>

                          <div className="mb-3">
                            {responses[question.question_id]?.file && (
                              <div className="mb-2">
                                <small className="form-text text-muted">
                                    {responses[question.question_id].file} 
                                </small>
                              </div>
                            )}
                           <input type="file"className={`form-control ${formErrors[question.question_id]?.file ? 'is-invalid' : ''}`}
                            onChange={(e) => handleInputChange(question.question_id, 'file', e.target.files[0])}/>
                            {formErrors[question.question_id]?.file && <div className="invalid-feedback">
                            {formErrors[question.question_id].file}</div>}
                          </div>

                          <div className="mb-3">
                            <textarea
                              rows="4"
                              className={`form-control ${formErrors[question.question_id]?.comment ? 'is-invalid' : ''}`}
                              value={responses[question.question_id]?.comment || ''}
                              onChange={(e) => handleInputChange(question.question_id, 'comment', e.target.value)}
                              placeholder="Enter comments here"
                            ></textarea>
                            {formErrors[question.question_id]?.comment && <div className="invalid-feedback">{formErrors[question.question_id].comment}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <button type="submit" className="btn btn-success btn-lg" disabled={isLoading}>
                    {isLoading ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAssessmentPage;
