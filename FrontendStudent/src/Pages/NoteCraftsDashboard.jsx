import React, { useState } from "react";
import { BookOpen, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NoteCraftsDashboard() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Since it's static, we won't fetch courses dynamically
  const myCourses = [
    {
      id: 1,
      title: "Java",
      teacher: "Deepak Singh",
      color: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
      courseId: 101,
    },
  ];

  // Directly navigate to CourseDetailPage
  const handleJoinClass = () => {
    setShowJoinModal(false);
    navigate("/course/101"); // static route
  };

  const CourseCard = ({ course }) => (
    <div
      onClick={() => navigate(`/course/${course.courseId}`)}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div
        className="h-40 flex items-center justify-center relative"
        style={{ background: course.color }}
      >
        <div className="absolute inset-0 bg-black/10 rounded-t-2xl" />
        <h3 className="text-2xl font-bold text-white z-10 px-3 text-center">
          {course.title}
        </h3>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center text-gray-700 font-medium">
          <User size={18} className="mr-2 text-indigo-600" />
          <span>{course.teacher}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/course/${course.courseId}`);
          }}
          className="w-full py-3 rounded-lg text-white font-semibold transition-all cursor-pointer"
          style={{
            background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
          }}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Courses</h1>
            <p className="text-gray-600">Keep growing your skills 🚀</p>
          </div>
          <button
            onClick={() => setShowJoinModal(true)}
            className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
            }}
          >
            <BookOpen size={20} />
            Join Class
          </button>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {myCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowJoinModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-6">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#EDE9FE" }}
              >
                <BookOpen size={32} style={{ color: "#6D28D9" }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Join a Class
              </h3>
              <p className="text-gray-600">
                Click join to enter the sample course
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinClass}
                className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                style={{
                  background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
                }}
              >
                Join Class
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
