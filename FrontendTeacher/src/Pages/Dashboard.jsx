import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import ClassCard from "../components/ClassCard";
import NewClass from "../components/NewClass";
import { getClassrooms, createClassroom } from "../api/classroomApi";

const Dashboard = ({ onClassClick }) => {
  const [classes, setClasses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const teacherId = "68e17b57dc1316f0a041792f";
  const role = "teacher";

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const data = await getClassrooms(teacherId, role);
        setClasses(data || []);
      } catch (error) {
        console.error("Error fetching classrooms:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const handleCreateClass = async (newClassData) => {
    try {
      const { name } = newClassData;
      const response = await createClassroom(teacherId, name);
      if (response && response.classroom) {
        setClasses((prev) => [...prev, response.classroom]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating classroom:", error);
      alert("Failed to create classroom");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Classes</h1>
          {classes.length > 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              + Create New Class
            </button>
          )}
        </div>

        {loading ? (
          <p className="text-gray-500">Loading classrooms...</p>
        ) : classes.length === 0 ? (
          <div className="text-center mt-20">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              You haven’t created any classrooms yet.
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
                  name: classItem.name,
                  subject: classItem.name,
                  studentCount: classItem.students?.length || 0,
                  color: "bg-gradient-to-br from-purple-500 to-purple-700",
                }}
                onClick={() => onClassClick(classItem)}
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
