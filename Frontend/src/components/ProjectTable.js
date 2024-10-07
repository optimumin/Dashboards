import React, { useState, useEffect } from 'react'; 
import CreateProject from './CreateProject'; 
import '../Table.css';

const ProjectTable = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null); // New state to handle error

  // Fetch the projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch('http://localhost:5000/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const data = await response.json();
            setProjects(data);
        } catch (error) {
            setError('Failed to fetch projects. Please try again later.');
            console.error(error);
        }
    };

    fetchProjects();
  }, []);

  const handleShow = () => setShowCreateProject(true);
  const handleClose = () => setShowCreateProject(false);

  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
  };

  const headerStyle = {
    fontFamily: 'Georgia, serif',
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '2rem',
  };

  const tableContentStyle = {
    fontFamily: 'Times New Roman, serif',
    fontSize: '16px',
  };

  return (
    <div className="container">
      <div className="row align-items-center mb-3">
        <div className="col">
          <h2 style={headerStyle}>Projects</h2>
        </div>
        <div className="col text-end">
          <button className="btn btn-dark" onClick={handleShow}>Create New Project</button>
        </div>
      </div>

      {/* Display error if it exists */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className={`col-md-8 ${showCreateProject ? 'pe-3' : ''}`}>
          <div className="table-responsive">
            <table className="table table-striped table-bordered" style={tableContentStyle}>
              <thead className="thead-dark">
                <tr>
                  <th scope="col">Project Name</th>
                  <th scope="col">Project Description</th>
                  <th scope="col">Assessment Type</th>
                </tr>
              </thead>
              <tbody>
                {/* Check if projects array is populated */}
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <tr key={index}>
                      <td>
                        {/* Use <a> tag to link to the review page */}
                        <a href={`/reviewPage/project/:userId`}>
                          {project.name}
                        </a>
                      </td>
                      <td>{project.description || 'No description available'}</td>
                      <td>
                        {Array.isArray(project.assessment_name) 
                          ? project.assessment_name.join(', ') 
                          : 'No assessment types available'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="text-center">No projects available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateProject && (
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <CreateProject onProjectCreated={handleProjectCreated} />
                <button type="button" className="btn btn-secondary mt-3 w-100" onClick={handleClose}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
