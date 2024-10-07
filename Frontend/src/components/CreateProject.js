import React, { useState, useEffect } from 'react'; 
import { useNavigate, Link } from 'react-router-dom';
import './CreateProject.css';

const CreateProject = ({ onProjectCreated }) => {
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
            console.log('User ID:', userid); // Add this line to see the value

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
                
                // Reset fields after submission
                setProjectName('');
                
                setProjectDescription('');
                setSelectedAssessmentTypes([]);
                setError('');
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
