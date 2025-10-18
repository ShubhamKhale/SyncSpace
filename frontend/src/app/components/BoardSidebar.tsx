"use client";
import React from "react";
import ProfileIcon from "../icons/ProfileIcon";
import { HistoryIcon, TagIcon } from "lucide-react";
import BoardActivityIcon from "../icons/BoardActivity";

const BoardSidebar: React.FC = () => {
  return (
    <aside className="flex flex-col  justify-between w-68 h-screen border-r border-gray-200 bg-white">
      {/* Top Section */}
      <div>
        {/* Board Details */}
        <div className="px-5 py-6 text-[#6B7280]">
          <p className="text-sm font-semibold mb-3">BOARD DETAILS</p>
          <ul className="text-sm space-y-2">
            <li className="flex items-center space-x-2">
              <ProfileIcon width="16" height="16" />
              <p>Owner: Sarah Miller</p>
            </li>
            <li className="flex items-center space-x-2">
              <HistoryIcon width="16" height="16" />
              <p>Created: 2023-08-15</p>
            </li>
            <li className="flex items-center space-x-2">
              <HistoryIcon width="16" height="16" />
              <p>Updated: 2023-08-20</p>
            </li>
            <div className="grid grid-cols-2 items-center gap-2">
              <div
                className="px-4 py-2 inline-flex items-center text-xs space-x-2 rounded-3xl hover:cursor-pointer"
                style={{ backgroundColor: "#E0F2FE" }}
              >
                <TagIcon width={16} height={16} fill="#0284C7" />
                <p style={{ color: "#0284C7" }}>User Testing</p>
              </div>
              <div
                className="px-4 py-2 inline-flex items-center text-xs space-x-2 rounded-3xl hover:cursor-pointer"
                style={{ backgroundColor: "#FFEDD5" }}
              >
                <TagIcon width={16} height={16} fill="#EA580C" />
                <p style={{ color: "#EA580C" }}>Market Analysis</p>
              </div>
              <div
                className="px-4 py-2 inline-flex items-center text-xs space-x-2 rounded-3xl hover:cursor-pointer"
                style={{ backgroundColor: "#EDE9FE" }}
              >
                <TagIcon width={16} height={16} fill="#7C3AED" />
                <p style={{ color: "#7C3AED" }}>Feasibility Study</p>
              </div>
            </div>
          </ul>

          {/* Board Health */}
          <div className="mt-8">
            <p className="text-sm font-medium text-[#6B7280] mb-2">
              BOARD HEALTH
            </p>
            <ul className="text-sm space-y-3 p-4">
              <li className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-[#EAB308] rounded-full"></div>
                <p className="font-medium text-black">warning</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-[#6B7280]">Overdue tasks</p>
                <p className="text-[#374151]">3</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-[#6B7280]">Bottlenecks</p>
                <p className="text-[#374151]">1</p>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-[#6B7280]">At risk</p>
                <p className="text-[#374151]">2</p>
              </li>
            </ul>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#6B7280] mb-2">
                RECENT ACTIVITY
              </p>
              <BoardActivityIcon />
            </div>
            <div className="space-y-2">
              <div className="pl-6 text-sm space-y-1 border-l-2 border-l-[#E5E7EB]">
                <div className="flex items-center space-x-3">
                  <p className="text-[#1F2937] font-medium">Alex Kim</p>
                  <p className="text-[#4B5563]">added a new task</p>
                </div>
                <p className="text-[#9CA3AF]">10 min ago</p>
              </div>
              <div className="pl-6 text-sm space-y-1 border-l-2 border-l-[#E5E7EB]">
                <div className="flex items-center space-x-3">
                  <p className="text-[#1F2937] font-medium">Sarah Miller</p>
                  <p className="text-[#4B5563]">commented on a task</p>
                </div>
                <p className="text-[#9CA3AF]">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex items-center space-x-4 border-t border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-800 font-semibold">
          N
        </div>
        <div>
          <p className="text-sm font-medium text-gray-800">Nick Jones</p>
          <p className="text-xs text-gray-500">nick@example.com</p>
        </div>
      </div>
    </aside>
  );
};

export default BoardSidebar;
