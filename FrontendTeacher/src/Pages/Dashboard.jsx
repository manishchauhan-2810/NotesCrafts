import React, { useState } from 'react';
import Header from '../components/Header';
import ClassCard from '../components/ClassCard';
import CreateClassCard from '../components/CreateClassCard';
import NewClass from '../components/NewClass';

const Dashboard = ({ onClassClick }) => {
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: 'Biology - Class 10A',
      subject: 'Biology',
      studentCount: 32,
      color: 'bg-gradient-to-br from-purple-500 to-purple-700'
    },
    {
      id: 2,
      name: 'Chemistry - Class 10B',
      subject: 'Chemistry',
      studentCount: 28,
      color: 'bg-gradient-to-br from-blue-500 to-blue-700'
    },
    {
      id: 3,
      name: 'Physics - Class 9A',
      subject: 'Physics',
      studentCount: 30,
      color: 'bg-gradient-to-br from-green-500 to-green-700'
    },
    {
      id: 4,
      name: 'Mathematics - Class 10A',
      subject: 'Mathematics',
      studentCount: 35,
      color: 'bg-gradient-to-br from-orange-500 to-orange-700'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateClass = (newClassData) => {
    const newClass = {
      id: classes.length + 1,
      ...newClassData
    };
    setClasses([...classes, newClass]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Classes</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <CreateClassCard onClick={() => setIsModalOpen(true)} />
          {classes.map((classItem) => (
            <ClassCard
              key={classItem.id}
              classData={classItem}
              onClick={() => onClassClick(classItem)}
            />
          ))}
        </div>
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
