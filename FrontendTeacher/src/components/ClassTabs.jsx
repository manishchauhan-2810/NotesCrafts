// FrontendTeacher/src/components/ClassTabs.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const ClassTabs = ({ activeTab, classId }) => {
  const navigate = useNavigate();

  const tabs = [
    { id: 'notes', label: 'Notes', path: 'notes' },
    { id: 'quizzes', label: 'Quizzes', path: 'quizzes' },
    { id: 'test-papers', label: 'Test papers', path: 'test-papers' },
    { id: 'doubts', label: 'Doubts', path: 'doubts', badge: 1 },
  ];

  const handleTabClick = (tabPath) => {
    navigate(`/class/${classId}/${tabPath}`);
  };

  return (
    <div className="flex gap-6 mb-8 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.path)}
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
  );
};

export default ClassTabs;