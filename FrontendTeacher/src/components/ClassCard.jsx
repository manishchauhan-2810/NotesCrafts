import React from 'react';

const ClassCard = ({ classData, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className={`${classData.color} h-32 flex items-center justify-center`}>
          <h3 className="text-2xl font-bold text-white px-4 text-center">
            {classData.name}
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 font-semibold mb-2">{classData.subject}</p>
          <p className="text-gray-500 text-sm">{classData.studentCount} students</p>
        </div>
      </div>
    </div>
  );
};

export default ClassCard;