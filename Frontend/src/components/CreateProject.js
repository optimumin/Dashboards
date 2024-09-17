import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './CreateProject.css';
const CreateProject = ({ onProjectCreated }) => {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedAssessmentTypes, setSelectedAssessmentTypes] = useState([]);
  const [error, setError] = useState('');

  const assessmentTypes = [
    { id: 1, name: 'Physical Security' },
    { id: 2, name: 'Environmental Controls' },
    { id: 3, name: 'Power Infrastructure' },
    { id: 4, name: 'Networking Infrastructure' },
    { id: 5, name: 'Server and Hardware' },
    { id: 6, name: 'Data Backup and Recovery' },
    { id: 7, name: 'Monitoring and Management' },
  ];

  const navigate = useNavigate();

  const handleCheckboxChange = (assessmentType) => {
    setSelectedAssessmentTypes(prevSelected =>
      prevSelected.includes(assessmentType)
        ? prevSelected.filter(type => type !== assessmentType)
        : [...prevSelected, assessmentType]
    );
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    if (projectName && projectDescription && selectedAssessmentTypes.length > 0) {
      try {
        const token = localStorage.getItem('authToken');  // Assuming the token is stored in localStorage
        const response = await fetch('http://localhost:5000/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` // Include the JWT token in the request header
          },
          body: JSON.stringify({
            projectName,
            projectDescription,
            selectedAssessmentTypes
          }),
        });

        if (response.ok) {
          const newProject = await response.json();
          onProjectCreated(newProject);
          setProjectName('');
          setProjectDescription('');
          setSelectedAssessmentTypes([]);
          setError('');
          navigate('/dashboard');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'An error occurred while saving the project.');
        }
      } catch (error) {
        setError('An error occurred while saving the project.');
        console.error(error);
      }
    } else {
      setError('Please fill out all project details.');
    }
  };

  return (
    <div className="create-project-container">
      <div className="create-project-card">
        <h2 className="create-project-title">Create Project</h2>
        <form onSubmit={handleProjectSubmit}>
          <div className="form-group">
            <label htmlFor="projectName">Project Name</label>
            <input
              type="text"
              id="projectName"
              className="form-control"
              placeholder="Enter project name"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="projectDescription">Project Description</label>
            <textarea
              id="projectDescription"
              className="form-control"
              placeholder="Enter project description"
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Assessment Types</label>
            <div className="assessment-types">
              {assessmentTypes.map(type => (
                <div key={type.id} className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id={`assessment-${type.id}`}
                    value={type.name}
                    checked={selectedAssessmentTypes.includes(type.name)}
                    onChange={() => handleCheckboxChange(type.name)}
                  />
                  <label className="form-check-label" htmlFor={`assessment-${type.id}`}>{type.name}</label>
                </div>
              ))}
            </div>
          </div>
          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          <button type="submit" className="btn btn-dark">Save Project</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/projectTable" className="btn btn-secondary">Back to Project Table</Link>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
