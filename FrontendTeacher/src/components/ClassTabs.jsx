import React from 'react';
import QuizzesPage from './QuizzesPage';
import TestPapersPage from './TestPapersPage';
import NotesPage from '../Pages/NotesPage'; // Add this import

const ClassTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'notes', label: 'Notes' },
    { id: 'quizzes', label: 'Quizzes' },
    { id: 'test-papers', label: 'Test papers' },
    { id: 'doubts', label: 'Doubts', badge: 1 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'notes':
        return <NotesPage />; // Add this case
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
      {/* Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              console.log('Tab clicked:', tab.id);
              onTabChange(tab.id);
            }}
            className={`pb-3 px-1 font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
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

      {/* Tab Content */}
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
};

export default ClassTabs;
