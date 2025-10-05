import React from 'react'

export default function TestPapers() {
  const testPapers = [
    {
      id: 1,
      title: 'Midterm Exam - Calculus',
      date: 'Due: Oct 15, 2025',
      duration: '2 hours',
      questions: 50,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Chapter 3 Test',
      date: 'Completed: Oct 1, 2025',
      duration: '1 hour',
      questions: 25,
      status: 'completed',
      score: '85%'
    }
  ]

  return (
    <div className="space-y-4">
      {testPapers.map((test) => (
        <div key={test.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{test.title}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>📅 {test.date}</span>
                <span>⏱️ {test.duration}</span>
                <span>❓ {test.questions} questions</span>
                {test.score && <span className="text-purple-700 font-semibold">Score: {test.score}</span>}
              </div>
            </div>
            <button className={`px-6 py-2 rounded-full font-medium transition-colors ${
              test.status === 'upcoming' 
                ? 'bg-purple-700 text-white hover:bg-purple-800' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}>
              {test.status === 'upcoming' ? 'Start Test' : 'View Results'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}