import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import CreateProject from './components/CreateProject';
import Dashboard from './components/Dashboard';  // Adjust the path as needed
import AssessmentPage from './components/AssessmentPages';  // Adjust the path as needed
import ProjectTable from './components/ProjectTable';
import { ToastContainer } from 'react-toastify';  // Import ToastContainer

const App = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/Login" element={<LoginRegister/>} />
          <Route path="/projectTable" element={<ProjectTable/>} />
          <Route path="/Project" element={<CreateProject/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assessments/:assessment_name" element={<AssessmentPage />} />
        </Routes>
        <ToastContainer />  {/* Add ToastContainer to your app */}
      </div>
    </Router>
  );
};

export default App;
