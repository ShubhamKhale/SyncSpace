import React from "react";
import { Layout, Calendar, Grid, Save } from "lucide-react";
import FilterIcon from "../icons/FilterIcon";

const BoardDetails: React.FC = () => {
  return (
    <div className="p-4">
      {/* Header Row */}
      <div className="flex items-end justify-between">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-800">
            Product Launch Q4
          </h1>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <div className="inline-flex items-center space-x-2">
              <FilterIcon />
              <p className="mr-2">Filters:</p>
            </div>
            <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1 mr-2">
              <option>Phase</option>
              <option>Planning</option>
              <option>Design</option>
              <option>Development</option>
            </select>
            <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1 mr-2">
              <option>Priority</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1 mr-2">
              <option>Contributor</option>
              <option>Sarah</option>
              <option>Alex</option>
              <option>Maria</option>
            </select>
            <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1">
              <option>Label</option>
              <option>UI</option>
              <option>Backend</option>
              <option>QA</option>
            </select>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:cursor-pointer transition">
            <Layout size={16} />
            Kanban
          </button>
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:cursor-pointer transition">
            <Calendar size={16} />
            Timeline
          </button>
          <button className="flex items-center gap-1 border border-gray-300 px-3 py-1.5 rounded-md text-sm text-gray-700 hover:bg-gray-100 hover:cursor-pointer transition">
            <Grid size={16} />
            Matrix
          </button>
          <button className="flex items-center gap-1 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md text-sm hover:bg-blue-50 hover:cursor-pointer transition">
            <Save size={16} />
            Save view
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
