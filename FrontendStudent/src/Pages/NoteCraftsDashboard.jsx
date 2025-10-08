import React, { useState } from "react";
import { BookOpen, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NoteCraftsDashboard() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classId, setClassId] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  // Combined the better parts of both versions
  const myCourses = [
    {
      id: 1,
      title: "Web Development Fundamentals",
      teacher: "Ms. Anjali Gupta",
      color: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
      courseId: "web-dev-fundamentals",
    },
    {
      id: 2,
      title: "Python for Beginners",
      teacher: "Mr. Rahul Verma",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      courseId: "python-beginners",
    },
    {
      id: 3,
      title: "Database Management",
      teacher: "Prof. Amit Kumar",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      courseId: "database-management",
    },
    {
      id: 4,
      title: "Java",
      teacher: "Deepak Singh",
      color: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
      courseId: 101,
    },
  ];

  const handleJoinClass = (e) => {
    e.preventDefault();
    if (classId.trim()) {
      alert(`Joining class with ID: ${classId}`);
      setClassId("");
      setShowJoinModal(false);
    } else {
      // Default navigate for static demo
      setShowJoinModal(false);
      navigate("/course/101");
    }
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

        {/* My Courses Section */}
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
                Enter a Class ID or click join to enter the sample course.
              </p>
            </div>

            <form onSubmit={handleJoinClass} className="flex flex-col gap-3">
              <input
                type="text"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                placeholder="Enter Class ID"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-all"
                  style={{
                    background:
                      "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
                  }}
                >
                  Join Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
