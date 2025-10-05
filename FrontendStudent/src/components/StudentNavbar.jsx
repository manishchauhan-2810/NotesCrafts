import React from 'react';

export default function StudentNavbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo and Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-700 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">NoteCrafts.ai</span>
          </div>

          {/* Center - Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search your courses..."
                className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-700 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Right Side - User Profile */}
          <div className="flex items-center">
            <button className="w-10 h-10 rounded-full bg-purple-700 flex items-center justify-center text-white font-semibold hover:bg-purple-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-700 focus:ring-offset-2">
              <span className="text-sm">JD</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}