import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AssessmentPage = () => {
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
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessmentData();
  }, [assessment_name]);

  const handleInputChange = (qIndex, type, value, questionId = null) => {
    setResponses((prevResponses) => ({
      ...prevResponses,
      [qIndex]: {
        ...prevResponses[qIndex],
        [type]: type === 'file' ? value : value,
        question_id: questionId,
      },
    }));
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    assessmentData.Sections?.forEach((section) => {
      section.Questions.forEach((question, qIndex) => {
        if (!responses[qIndex]?.option) {
          errors[qIndex] = { ...errors[qIndex], option: 'Option is required' };
          isValid = false;
        }
        if (!responses[qIndex]?.file) {
          errors[qIndex] = { ...errors[qIndex], file: 'File is required' };
          isValid = false;
        }
        if (!responses[qIndex]?.comment) {
          errors[qIndex] = { ...errors[qIndex], comment: 'Comment is required' };
          isValid = false;
        }
      });
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    Object.keys(responses).forEach((qIndex) => {
      const response = responses[qIndex];
      formData.append(`responses[${qIndex}][question_id]`, response.question_id || '');
      formData.append(`responses[${qIndex}][option_id]`, response.option || '');
      formData.append(`responses[${qIndex}][response_comment]`, response.comment || '');
      if (response.file) {
        formData.append(`responses[${qIndex}][response_file]`, response.file);
      }
    });

    try {
      const response = await fetch('http://localhost:5000/api/responses', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || 'Failed to submit responses');
      }

      alert('Assessment submitted successfully!');
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
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h3 className="text-center mb-4">Assessment: {assessmentData['Assessment Name']}</h3>
              <form onSubmit={handleSubmit}>
                {assessmentData.Sections && assessmentData.Sections.map((section, index) => (
                  <div key={index} className="card mb-4">
                    <div className="card-header bg-secondary text-white">
                      <h4 className="mb-0">{section.Section_name}</h4>
                    </div>
                    <div className="card-body">
                      {section.Questions.map((question, qIndex) => (
                        <div key={qIndex} className="mb-4">
                          <div className="fw-bold">Question {question.question_id} : {question.question_text}</div>
                          <div className="mb-3">
                            <select
                              id={`select-${qIndex}`}
                              className={`form-select ${formErrors[qIndex]?.option ? 'is-invalid' : ''}`}
                              onChange={(e) => handleInputChange(qIndex, 'option', e.target.value, question.question_id)}
                            >
                              <option value="">Select an option</option>
                              {question.options.map((option, oIndex) => (
                                <option key={oIndex} value={option.option_id}>
                                  {option.option_text}
                                </option>
                              ))}
                            </select>
                            {formErrors[qIndex]?.option && <div className="invalid-feedback">{formErrors[qIndex].option}</div>}
                          </div>

                          <div className="mb-3">
                            <input
                              type="file"
                              className={`form-control ${formErrors[qIndex]?.file ? 'is-invalid' : ''}`}
                              onChange={(e) => handleInputChange(qIndex, 'file', e.target.files[0], question.question_id)}
                            />
                            {formErrors[qIndex]?.file && <div className="invalid-feedback">{formErrors[qIndex].file}</div>}
                          </div>

                          <div className="mb-3">
                            <textarea
                              rows="4"
                              className={`form-control ${formErrors[qIndex]?.comment ? 'is-invalid' : ''}`}
                              onChange={(e) => handleInputChange(qIndex, 'comment', e.target.value, question.question_id)}
                              placeholder="Enter comments here"
                            ></textarea>
                            {formErrors[qIndex]?.comment && <div className="invalid-feedback">{formErrors[qIndex].comment}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="text-center">
                  <button type="submit" className="btn btn-dark btn-lg" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
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

export default AssessmentPage;
