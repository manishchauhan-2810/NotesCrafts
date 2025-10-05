import React from 'react'

export default function Quiz() {
  const quizzes = [
    {
      id: 1,
      title: 'Derivatives Quick Quiz',
      questions: 10,
      duration: '15 mins',
      status: 'available'
    },
    {
      id: 2,
      title: 'Linear Algebra Basics',
      questions: 15,
      duration: '20 mins',
      status: 'completed',
      score: '92%'
    },
    {
      id: 3,
      title: 'Integration Practice',
      questions: 12,
      duration: '18 mins',
      status: 'available'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quizzes.map((quiz) => (
        <div key={quiz.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{quiz.title}</h3>
          <div className="space-y-2 text-sm text-gray-600 mb-4">
            <p>❓ {quiz.questions} questions</p>
            <p>⏱️ {quiz.duration}</p>
            {quiz.score && <p className="text-purple-700 font-semibold">Score: {quiz.score}</p>}
          </div>
          <button className={`w-full py-2 rounded-lg font-medium transition-colors ${
            quiz.status === 'available'
              ? 'bg-purple-700 text-white hover:bg-purple-800'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}>
            {quiz.status === 'available' ? 'Take Quiz' : 'Review Quiz'}
          </button>
        </div>
      ))}
    </div>
  )
}