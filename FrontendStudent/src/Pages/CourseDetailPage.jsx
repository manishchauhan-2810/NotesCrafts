// FrontendStudent/src/Pages/CourseDetailPage.jsx
import React, { useMemo } from "react";
import { useParams, Outlet, useNavigate, useLocation } from "react-router-dom";

export default function CourseDetailPage() {
  const { id } = useParams(); // classId
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Memoize active tab to prevent recalculation on every render
  const activeTab = useMemo(() => {
    const pathParts = location.pathname.split('/');
    return pathParts[pathParts.length - 1];
  }, [location.pathname]);

  // ✅ Memoize classInfo to prevent re-parsing localStorage
  const classInfo = useMemo(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      classId: id,
      studentId: user.id || user._id,
      studentName: user.name,
    };
  }, [id]); // Only recompute when id changes

  const tabs = [
    { id: 'notes', label: 'Notes', path: 'notes' },
    { id: 'quiz', label: 'Quiz', path: 'quiz' },
    { id: 'assignment', label: 'Assignment', path: 'assignment' }, // ✅ NEW TAB
    { id: 'test', label: 'Test Paper', path: 'test' },
  ];

  const handleTabClick = (tabPath) => {
    navigate(`/course/${id}/${tabPath}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="text-purple-600 hover:text-purple-700 mb-4 flex items-center gap-2 cursor-pointer"
        >
          ← Back to Courses
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Course Material</h1>
        <p className="text-gray-600 mt-1">Access notes, quizzes, assignments, and tests</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.path)}
            className={`pb-3 px-4 font-semibold transition-colors cursor-pointer ${
              activeTab === tab.path
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Nested Routes Content */}
      <div>
        <Outlet context={{ classInfo }} />
      </div>
    </div>
  );
}