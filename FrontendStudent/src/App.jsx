import React from 'react'
import { Routes, Route } from 'react-router-dom'
import StudentNavbar from './components/StudentNavbar'
import NoteCraftsDashboard from './Pages/NoteCraftsDashboard'
import CourseDetail from './Pages/CourseDetail'
import Login from './Pages/Login'
import Signup from './Pages/Signup'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Auth Routes - No Navbar */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Protected Routes - With Navbar */}
        <Route path="/*" element={
          <>
            <StudentNavbar />
            <Routes>
              <Route path="/" element={<NoteCraftsDashboard />} />
              <Route path="/course/:courseId/*" element={<CourseDetail />} />
            </Routes>
          </>
        } />
      </Routes>
    </div>
  )
}

export default App