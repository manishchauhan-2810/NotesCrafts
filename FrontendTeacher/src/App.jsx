import React, { useState } from 'react';
import Dashboard from './Pages/Dashboard';
import ClassDetail from './Pages/ClassDetail';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <div>
      {currentPage === 'dashboard' ? (
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
      )}
    </div>
  );
}

export default App;
