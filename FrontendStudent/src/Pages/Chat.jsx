import React from 'react'

export default function Chat() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="text-6xl mb-4">💬</div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-3">Course Chat</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        Communicate with your classmates and instructor in real-time
      </p>
      <button className="bg-purple-700 text-white px-8 py-3 rounded-full font-medium hover:bg-purple-800 transition-colors">
        Open Chat Room
      </button>
    </div>
  )
}