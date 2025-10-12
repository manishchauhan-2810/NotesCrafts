// FrontendTeacher/src/components/ClassCard.jsx
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import ClassCodeModal from './ClassCodeModal';

const ClassCard = ({ classData, onClick }) => {
  const [showCodeModal, setShowCodeModal] = useState(false);

  const handleShareClick = (e) => {
    e.stopPropagation(); // Prevent card click
    setShowCodeModal(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
      >
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className={`${classData.color} h-32 flex items-center justify-center relative`}>
            <h3 className="text-2xl font-bold text-white px-4 text-center">
              {classData.name}
            </h3>
            
            {/* Share Button Overlay */}
            <button
              onClick={handleShareClick}
              className="absolute top-3 right-3 p-2 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-sm transition-all cursor-pointer"
              title="Share class code"
            >
              <Share2 className="w-4 h-4 text-white" />
            </button>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 font-semibold mb-2">{classData.subject}</p>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                {classData.studentCount} student{classData.studentCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
                {classData.classCode || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Code Modal */}
      <ClassCodeModal
        isOpen={showCodeModal}
        onClose={() => setShowCodeModal(false)}
        classData={classData}
      />
    </>
  );
};

export default ClassCard;