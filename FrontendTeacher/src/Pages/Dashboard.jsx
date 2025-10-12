// FrontendTeacher/src/Pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import ClassCard from "../components/ClassCard";
import NewClass from "../components/NewClass";
import { getClassrooms, createClassroom } from "../api/classroomApi";

const Dashboard = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Get teacher ID from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const teacherId = user.id || user._id;
  const role = "teacher";

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await getClassrooms(teacherId, role);
        console.log("Fetched classrooms:", data);
        setClasses(data || []);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (teacherId) {
      fetchClasses();
    }
  }, [teacherId]);

  const handleCreateClass = async (newClassData) => {
    try {
      const { name } = newClassData;
      const response = await createClassroom(teacherId, name);
      if (response && response.classroom) {
        setClasses((prev) => [...prev, response.classroom]);
        alert(`Class created successfully! Class Code: ${response.classroom.classCode}`);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating classroom:", error);
      alert("Failed to create classroom");
    }
  };

  const handleClassClick = (classItem) => {
    navigate(`/class/${classItem._id}`);
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogoClick={handleLogoClick} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">My Classes</h1>
            <p className="text-gray-600 mt-1">
              Manage your classes and share codes with students
            </p>
          </div>
          {classes.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              + Create New Class
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading classrooms...</p>
            </div>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              You haven't created any classrooms yet.
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((classItem) => (
              <ClassCard
                key={classItem._id}
                classData={{
                  id: classItem._id,
                  _id: classItem._id,
                  name: classItem.name,
                  subject: classItem.name,
                  studentCount: classItem.students?.length || 0,
                  classCode: classItem.classCode, // ⭐ Pass classCode
                  students: classItem.students, // ⭐ Pass students array
                  color: "bg-gradient-to-br from-purple-500 to-purple-700",
                }}
                onClick={() => handleClassClick(classItem)}
              />
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50">
          <NewClass
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateClass}
          />
        </div>
      )}
    </div>
  );
};

export default Dashboard;