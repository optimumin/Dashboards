import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginRegister from './components/LoginRegister';
import CreateProject from './components/CreateProject';
import Dashboard from './components/Dashboard';  // Adjust the path as needed
import AssessmentPage from './components/AssessmentPages';  // Adjust the path as needed
import ProjectTable from './components/ProjectTable';
import ReviewPage from './components/ReviewPage';
import ReviewAssessmentPage from './components/ReviewAssessmentpage';
import EditAssessmentPage from './components/EditAssessmentPage';
import { ToastContainer } from 'react-toastify';  // Import ToastContainer
import 'bootstrap/dist/css/bootstrap.min.css';
import ReviewComments from './components/ReviewComments';

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
          <Route path="/reviewPage/project/:userId" element={<ReviewPage/>} />
          <Route path="/review-assessment/:assessment_name" element={<ReviewAssessmentPage/>} />
          <Route path="/edit-assessment/:assessment_name" element={<EditAssessmentPage />} />
          <Route path="/reviewer-comments/:assessment_name" element={<ReviewComments />} />


        </Routes>
        <ToastContainer />  {/* Add ToastContainer to your app */}
      </div>
    </Router>
  );
};

export default App;
