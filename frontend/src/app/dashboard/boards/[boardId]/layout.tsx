// "use client";

// import React from "react";
// import BoardSidebar from "@/app/components/BoardSidebar";
// // import BoardNavbar from "@/app/components/BoardNavbar";
// import BoardLinkedResources from "@/app/components/BoardLinkedResources";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-white h-screen flex overflow-hidden rounded-2xl shadow-lg">
//       {/* Left Sidebar */}
//       <BoardSidebar />

//       {/* Main Content Area */}
//       <div className="flex flex-col flex-1 bg-white overflow-hidden">
//         {/* Top Navbar (fixed) */}
//         {/* <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
//           <BoardNavbar />
//         </div> */}

//         {/* Scrollable main section */}
//         <div className="flex-1 overflow-y-auto p-4">{children}</div>
//       </div>

//       {/* Right Sidebar */}
//       <BoardLinkedResources />
//     </div>
//   );
// }


"use client";

import React, { useState } from "react";
import BoardSidebar from "@/app/components/BoardSidebar";
import BoardLinkedResources from "@/app/components/BoardLinkedResources";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  return (
    <div className="bg-white h-screen flex overflow-hidden rounded-2xl shadow-lg">
      {/* Left Sidebar */}
      <div
        className={`relative transition-all duration-300 ease-in-out ${
          leftCollapsed ? "w-0" : "w-64"
        }`}
      >
        {!leftCollapsed && (
          <div className="h-full">
            <BoardSidebar />
          </div>
        )}

        {/* Toggle Button (Left) */}
        <button
          onClick={() => setLeftCollapsed(!leftCollapsed)}
          className="absolute top-3 -right-3 z-30 bg-white border border-gray-300 rounded-full shadow-sm p-1 hover:cursor-pointer hover:bg-gray-50 transition"
        >
          {leftCollapsed ? (
            <span className="text-gray-600 text-xs px-1">›</span>
          ) : (
            <span className="text-gray-600 text-xs px-1">‹</span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 bg-white overflow-hidden">
        {/* Scrollable main section */}
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>

      {/* Right Sidebar */}
      <div
        className={`relative transition-all duration-300 ease-in-out ${
          rightCollapsed ? "w-0" : "w-72"
        }`}
      >
        {!rightCollapsed && (
          <div className="h-full">
            <BoardLinkedResources />
          </div>
        )}

        {/* Toggle Button (Right) */}
        <button
          onClick={() => setRightCollapsed(!rightCollapsed)}
          className="absolute top-3 -left-3 z-30 bg-white border border-gray-300 rounded-full shadow-sm p-1 hover:cursor-pointer hover:bg-gray-50 transition"
        >
          {rightCollapsed ? (
            <span className="text-gray-600 text-xs px-1">‹</span>
          ) : (
            <span className="text-gray-600 text-xs px-1">›</span>
          )}
        </button>
      </div>
    </div>
  );
}
