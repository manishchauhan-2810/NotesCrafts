// src/components/NewClass.jsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

const NewClass = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    studentCount: '',
    color: 'bg-gradient-to-br from-purple-500 to-purple-700'
  });

  const colors = [
    { name: 'Purple', value: 'bg-gradient-to-br from-purple-500 to-purple-700' },
    { name: 'Blue', value: 'bg-gradient-to-br from-blue-500 to-blue-700' },
    { name: 'Green', value: 'bg-gradient-to-br from-green-500 to-green-700' },
    { name: 'Orange', value: 'bg-gradient-to-br from-orange-500 to-orange-700' },
    { name: 'Red', value: 'bg-gradient-to-br from-red-500 to-red-700' },
    { name: 'Pink', value: 'bg-gradient-to-br from-pink-500 to-pink-700' },
    { name: 'Indigo', value: 'bg-gradient-to-br from-indigo-500 to-indigo-700' },
    { name: 'Teal', value: 'bg-gradient-to-br from-teal-500 to-teal-700' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.studentCount) return;

    onCreate({
      name: formData.name,
      subject: formData.subject,
      studentCount: parseInt(formData.studentCount, 10),
      color: formData.color
    });

    setFormData({
      name: '',
      subject: '',
      studentCount: '',
      color: 'bg-gradient-to-br from-purple-500 to-purple-700'
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden animate-slideDown">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Create New Class</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 cursor-pointer" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-2 gap-6">
          <div className="space-y-5">
            {/* Left Column - Form Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Biology - Class 10A"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Biology"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Students
              </label>
              <input
                type="number"
                value={formData.studentCount}
                onChange={(e) => setFormData({ ...formData, studentCount: e.target.value })}
                placeholder="e.g., 30"
                min="1"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Color Theme
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: color.value })}
                    className={`h-14 rounded-xl ${color.value} transition-transform ${
                      formData.color === color.value
                        ? 'ring-2 ring-purple-300 scale-105'
                        : 'hover:scale-105'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Right Column - Preview */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <div className={`${formData.color} h-36 flex items-center justify-center p-4 rounded-t-2xl`}>
                <h3 className="text-xl font-bold text-white text-center">
                  {formData.name || 'Class Name'}
                </h3>
              </div>
              <div className="p-5">
                <p className="text-gray-700 font-semibold mb-2">
                  {formData.subject || 'Subject'}
                </p>
                <p className="text-gray-500 text-sm">
                  {formData.studentCount || '0'} students
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Buttons - Full Width */}
          <div className="col-span-2 flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
            >
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewClass;
