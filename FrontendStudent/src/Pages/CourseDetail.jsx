import React from 'react'
import { Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom'
import NotesAndAssignments from './NotesAndAssignments'
import TestPapers from './TestPapers'
import Quiz from './Quiz'
import Doubt from './Doubt'
import Chat from './Chat'
import Students from './Students'

// Sample data for courses
const coursesData = {
  'web-dev-fundamentals': {
    title: 'Web Development Fundamentals',
    instructor: 'Ms. Anjali Gupta',
  },
  'python-beginners': {
    title: 'Python for Beginners',
    instructor: 'Mr. Rahul Verma',
  },
  'database-management': {
    title: 'Database Management',
    instructor: 'Prof. Amit Kumar',
  },
};

export default function CourseDetail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { courseId } = useParams()

  const tabs = [
    { path: 'notes', label: 'Notes & Assignments' },
    { path: 'testpapers', label: 'Test Papers' },
    { path: 'quiz', label: 'Quiz' },
    { path: 'doubt', label: 'Doubt' },
    { path: 'chat', label: 'Chat' },
    { path: 'students', label: 'Students' }
  ]

  const isActive = (path) => {
    return location.pathname.endsWith(path)
  }

  // Get course details based on courseId
  const courseDetails = coursesData[courseId] || { title: 'Course Not Found', instructor: 'N/A' };

  return (
    <div>
      {/* Course Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-white mb-6 hover:text-purple-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium cursor-pointer">Back to courses</span>
          </button>
          <h1 className="text-5xl font-bold mb-3">{courseDetails.title}</h1>
          <p className="text-xl text-purple-100">{courseDetails.instructor}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={`/course/${courseId}/${tab.path}`}
                className={`py-4 px-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive(tab.path)
                    ? 'border-purple-700 text-purple-700'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="notes" element={<NotesAndAssignments />} />
          <Route path="testpapers" element={<TestPapers />} />
          <Route path="quiz" element={<Quiz />} />
          <Route path="doubt" element={<Doubt />} />
          <Route path="chat" element={<Chat />} />
          <Route path="students" element={<Students />} />
          <Route path="/" element={<NotesAndAssignments />} />
        </Routes>
      </div>
    </div>
  )
}