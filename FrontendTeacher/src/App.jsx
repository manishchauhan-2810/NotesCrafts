import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import ClassDetail from './Pages/ClassDetail';
import TestResultsViewer from './Pages/TestResultsViewer'; // ✅ import here

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <Routes>
      <Route
        path="/classdetails/:classId/testpapers/viewresults/:testId"
        element={<TestResultsViewer />}
      />
      {/* Keep your existing state-based navigation for Dashboard & ClassDetail */}
      <Route
        path="/"
        element={
          currentPage === 'dashboard' ? (
            <Dashboard
              onClassClick={(classData) => {
                setSelectedClass(classData);
                setCurrentPage('class');
              }}
            />
          ) : (
            <ClassDetail
              classData={selectedClass}
              onBack={() => setCurrentPage('dashboard')}
            />
          )
        }
      />
    </Routes>
  );
}

export default App;
