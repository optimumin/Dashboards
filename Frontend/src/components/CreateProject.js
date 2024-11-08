import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import './CreateProject.css';

const CreateProject = ({ onProjectCreated, setShowCreateProject }) => {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [selectedAssessmentTypes, setSelectedAssessmentTypes] = useState([]);
    const [assessmentTypes, setAssessmentTypes] = useState([]);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    // Fetch assessment types from the backend
    useEffect(() => {
        const fetchAssessmentTypes = async () => {
            try {
                const token = sessionStorage.getItem('authToken');
                const response = await fetch('http://localhost:5000/ProjectType', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setAssessmentTypes(data);
                } else {
                    throw new Error('Failed to fetch assessment types');
                }
            } catch (error) {
                setError('An error occurred while fetching assessment types.');
                console.error(error);
            } 
        };

        fetchAssessmentTypes();
    }, []);

    const handleCheckboxChange = (e) => {
        const value = e.target.value;
        setSelectedAssessmentTypes(prevSelected =>
            prevSelected.includes(value)
                ? prevSelected.filter(type => type !== value)
                : [...prevSelected, value]
        );
    };

    const clearForm = () => {
        setProjectName('');
        setProjectDescription('');
        setSelectedAssessmentTypes([]);
        setError('');
    };

    const handleProjectSubmit = async (e) => {
        e.preventDefault();

        // Validation check
        if (!projectName || !projectDescription || selectedAssessmentTypes.length === 0) {
            setError('Please fill out all project details.');
            return;
        }

        try {
            const token = sessionStorage.getItem('authToken'); 
            const userid = sessionStorage.getItem('userId');   

            if (!userid) {
                setError('User ID is missing. Please log in again.');
                return;
            }

            const requestBody = {
                projectName,
                projectDescription,
                assessment_names: selectedAssessmentTypes,
                userid
            };

            const response = await fetch('http://localhost:5000/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                const newProject = await response.json();
                onProjectCreated(newProject);
                sessionStorage.setItem('projectId', newProject.project.id); // Store project ID
                
                // Clear form fields after successful submission
                clearForm(); 
                navigate('/dashboard'); // Redirect to dashboard after creating project
            } else {
                const errorData = await response.json();
                setError(errorData.msg || 'An error occurred while saving the project.');
            }
        } catch (error) {
            setError('An error occurred while saving the project. Please try again later.');
            console.error(error);
        }
    };

    return (
        <div className="create-project-container">
            <div className="create-project-card">
                <h6 className="create-project-title">Create New Project</h6>
                <form onSubmit={handleProjectSubmit}>
                    <div className="form-group">
                        <label htmlFor="projectName" style={{ fontWeight: 'bold' }}>Project Name</label>
                        <input
                            type="text"
                            id="projectName"
                            className="form-control"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="projectDescription" style={{ fontWeight: 'bold' }}>Project Description</label>
                        <textarea
                            id="projectDescription"
                            className="form-control"
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label style={{ fontWeight: 'bold' }}>Assessment Types</label>
                        <div className="assessment-types">
                            {assessmentTypes.map(type => (
                                <div key={type.assessment_id} className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`assessment-${type.assessment_id}`}
                                        value={type.assessment_name}
                                        checked={selectedAssessmentTypes.includes(type.assessment_name)}
                                        onChange={handleCheckboxChange}
                                    />
                                    <label className="form-check-label" htmlFor={`assessment-${type.assessment_id}`}>
                                        {type.assessment_name} 
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    {error && <div className="alert alert-danger" role="alert">{error}</div>}
                    <button type="submit" className="btns ">Save Project</button>
                </form>
                <button
                    type="button"
                    className="btn btn-primary mt-3 w-100"
                    onClick={() => setShowCreateProject(false)} // Close button to hide form
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CreateProject;
