import React, { useState, useEffect } from 'react';
import CreateProject from './CreateProject';
import './ProjectTable.css'; // Ensure this CSS file has no background color for card or table container
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const ProjectTable = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  // Fetch the projects on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = sessionStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
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

  const handleProjectCreated = (newProject) => {
    setProjects((prevProjects) => [...prevProjects, newProject]);
  };

  const headerStyle = {

    fontFamily: 'Arial, sans-serif',
    fontSize: '24px',
    fontWeight: 'bold',
    marginTop: '1rem',
    marginLeft: '42%',
    
  };

  const tableContentStyle = {
    fontFamily: 'Times New Roman, serif',
    fontSize: '18px',
  };

  // CSS styles for the layout without using Bootstrap
  const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    height: '100vh',
    marginTop:'0px',
  };

  const projectListStyle = {
    flex: showCreateProject ? '2' : '3', // Adjust width based on form visibility
    padding: '0px',
    transition: 'flex 0.3s ease',

  };

  const formStyle = {
    flex: '0.2',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.1)',
    display: showCreateProject ? 'block' : 'none', // Only show when "Create Project" is clicked
  };

  // Remove the white background here
  const cardBodyStyle = {
    padding: '0px',
    backgroundColor: 'transparent',
    border: 'none', // Remove any border if present
  };

  return (
    <div style={containerStyle}>
      <Sidebar />
      <div style={{ flex: 1 }}>
        <Topbar /> {/* Now your Topbar will be horizontal */}

        <div style={projectListStyle}>
          <div className="row align-items-center mb-3">
            <div className="col">
              <h2 style={headerStyle}>Projects</h2>
            </div>
            <div className="col text-end">
              <button className="btn btn-primary" onClick={handleShow}>
                Create New Project
              </button>
            </div>
          </div>
        </div>

        {/* Display error if it exists */}
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Project Table */}
        <div className="card-bodys" style={cardBodyStyle}>
          <div className="table-responsive">
            <table className="table table-striped" style={tableContentStyle}>
              <thead>
                <tr>
                  <th scope="col">Project Name</th>
                  <th scope="col">Project Description</th>
                  <th scope="col">Assessment Type</th>
                </tr>
              </thead>
              <tbody>
                {projects.length > 0 ? (
                  projects.map((project, index) => (
                    <tr key={index}>
                      <td>
                        <a href={`/reviewPage/project/${project.id}`}>
                          {project.name}
                        </a>
                      </td>
                      <td>{project.description || 'No description available'}</td>
                      <td>
                        {Array.isArray(project.assessment_name)
                          ? project.assessment_name.join(', ')
                          : project.assessment_name}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3">No projects available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CreateProject form component */}
      {showCreateProject && (
        <div style={formStyle}>
          <CreateProject
            onProjectCreated={handleProjectCreated}
            setShowCreateProject={setShowCreateProject}
          />
        </div>
      )}
    </div>
  );
};

export default ProjectTable;

