import React from "react";
import { Search } from "lucide-react";

const BoardNavbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between border-b p-4 bg-white">
      <div className="flex items-center gap-4">
        <div className="text-blue-600 font-semibold text-lg">ProjectFlow</div>
        <nav className="flex gap-6 text-gray-600">
          <a href="#">Dashboard</a>
          <a href="#">Boards</a>
          <a href="#">Reports</a>
          <a href="#">Calendar</a>
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <Search className="text-gray-500" size={20} />
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
          S
        </div>
      </div>
    </div>
  );
};

export default BoardNavbar;
