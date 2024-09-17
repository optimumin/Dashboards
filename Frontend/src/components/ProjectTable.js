import React, { useState, useEffect } from 'react';
import CreateProject from './CreateProject'; 
import '../Table.css';
const ProjectTable = () => {
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/projects')
      .then(response => response.json())
      .then(data => setProjects(data))
      .catch(error => console.error('There was an error fetching the projects!', error));
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
                {projects.map((project, index) => (
                  <tr key={index}>
                    <td>{project.name}</td>
                    <td>{project.description}</td>
                    <td>{project.assessment_types.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showCreateProject && (
          <div className="col-md-4">
            <div className="card">
              <div className="card-body">
                <CreateProject onProjectCreated={handleProjectCreated} />
                <button type="button" className="btn btn-secondary mt-3 w-100" onClick={handleClose}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectTable;
