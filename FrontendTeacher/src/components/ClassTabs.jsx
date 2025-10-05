import React from 'react';
import QuizzesPage from './QuizzesPage';
import TestPapersPage from './TestPapersPage';

const ClassTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'stream', label: 'Stream' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'test-papers', label: 'Test papers' },
    { id: 'doubts', label: 'Doubts', badge: 1 }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'quizzes':
        return <QuizzesPage />;
      case 'test-papers':
        return <TestPapersPage />;
      // Add other cases for different tabs
      default:
        return <div>Content for {activeTab}</div>;
    }
  };

  return (
    <div>
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`pb-3 px-1 font-semibold transition-colors flex items-center gap-2 ${
              activeTab === tab.id
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
            {tab.badge && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ClassTabs;