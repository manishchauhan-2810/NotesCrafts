import React from 'react'
import { Routes, Route } from 'react-router-dom'
import StudentNavbar from './components/StudentNavbar'
import NoteCraftsDashboard from './Pages/NoteCraftsDashboard'
import CourseDetail from './Pages/CourseDetail'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentNavbar />
      <Routes>
        <Route path="/" element={<NoteCraftsDashboard />} />
        <Route path="/course/:courseId/*" element={<CourseDetail />} />
      </Routes>
    </div>
  )
}

export default App