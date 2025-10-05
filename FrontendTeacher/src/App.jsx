<<<<<<< HEAD
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
=======
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
>>>>>>> f93394e62ae362567e4e0007f38ca62c7e5dfc78
