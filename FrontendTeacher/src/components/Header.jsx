import React from 'react';
import { Bell, User } from 'lucide-react';

const Header = ({ onLogoClick }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={onLogoClick}
        >
          <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
            <div className="grid grid-cols-3 gap-0.5">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
              ))}
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ADHYAYAN.AI</h1>
            <p className="text-sm text-gray-500">Teacher Panel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <User className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
