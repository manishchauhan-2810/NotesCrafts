// FrontendStudent/src/Pages/NoteCraftsDashboard.jsx
import React, { useState, useEffect } from "react";
import { BookOpen, User, X, CheckCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function NoteCraftsDashboard() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState("");
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Get student info from localStorage
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const studentId = user.id || user._id;

  // Fetch student's enrolled classes
  useEffect(() => {
    const fetchEnrolledClasses = async () => {
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/classroom", {
          params: { userId: studentId, role: "student" },
        });

        const classes = response.data.classrooms || [];
        
        // Transform backend data to match UI format
        const formattedClasses = classes.map((cls, idx) => ({
          id: cls._id,
          title: cls.name,
          teacher: cls.teacherId?.name || "Teacher",
          color: getGradientColor(idx),
          courseId: cls._id,
          classCode: cls.classCode,
        }));

        setMyCourses(formattedClasses);
      } catch (err) {
        console.error("Error fetching classes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledClasses();
  }, [studentId]);

  // Function to get different gradient colors
  const getGradientColor = (index) => {
    const colors = [
      "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    ];
    return colors[index % colors.length];
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    
    if (!classCode.trim()) {
      setError("Please enter a class code");
      return;
    }

    if (!studentId) {
      setError("Please login to join a class");
      return;
    }

    setJoining(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/classroom/join",
        {
          studentId: studentId,
          classCode: classCode.trim().toUpperCase(),
        }
      );

      setSuccess(`Successfully joined ${response.data.classroom.name}!`);
      
      // Add new class to the list
      const newClass = {
        id: response.data.classroom._id,
        title: response.data.classroom.name,
        teacher: "Teacher",
        color: getGradientColor(myCourses.length),
        courseId: response.data.classroom._id,
        classCode: response.data.classroom.classCode,
      };
      
      setMyCourses((prev) => [...prev, newClass]);
      
      setTimeout(() => {
        setClassCode("");
        setShowJoinModal(false);
        setSuccess("");
      }, 2000);
    } catch (err) {
      console.error("Join class error:", err);
      setError(
        err.response?.data?.error || "Failed to join class. Please check the code and try again."
      );
    } finally {
      setJoining(false);
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

        {course.classCode && (
          <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded font-mono text-center">
            Code: {course.classCode}
          </div>
        )}

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
            className="px-6 py-3 rounded-lg font-medium text-white flex items-center gap-2 transition-all cursor-pointer hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
            }}
          >
            <BookOpen size={20} />
            Join Class
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your courses...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && myCourses.length === 0 && (
          <div className="text-center mt-20">
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No classes yet
            </h2>
            <p className="text-gray-500 mb-6">
              Join a class using a class code from your teacher
            </p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all"
              style={{
                background: "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
              }}
            >
              Join Your First Class
            </button>
          </div>
        )}

        {/* My Courses Grid */}
        {!loading && myCourses.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>

      {/* Join Class Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => {
                setShowJoinModal(false);
                setError("");
                setSuccess("");
                setClassCode("");
              }}
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
                Enter the class code provided by your teacher
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleJoinClass} className="flex flex-col gap-3">
              <input
                type="text"
                value={classCode}
                onChange={(e) => {
                  setClassCode(e.target.value.toUpperCase());
                  setError("");
                }}
                placeholder="Enter Class Code (e.g., ABC123)"
                className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none uppercase font-mono text-center text-lg tracking-wider"
                maxLength={6}
                disabled={joining}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setError("");
                    setSuccess("");
                    setClassCode("");
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  disabled={joining}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joining || !classCode.trim()}
                  className="flex-1 py-3 rounded-lg text-white font-medium transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #6D28D9 0%, #9333EA 100%)",
                  }}
                >
                  {joining ? "Joining..." : "Join Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}