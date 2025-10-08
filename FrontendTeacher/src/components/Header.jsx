import React from 'react';
import { LogOut } from 'lucide-react';

const Header = ({ onLogoClick }) => {
  const handleLogout = () => {
    // Add your logout logic here
    console.log('Logging out...');
  };

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
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;