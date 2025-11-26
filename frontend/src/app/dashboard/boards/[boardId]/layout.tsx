"use client";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import BoardSidebar from "@/app/components/BoardSidebar";
import BoardLinkedResources from "@/app/components/BoardLinkedResources";
import { MoveLeft, MoveRight } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const pathname = usePathname();
  const isTaskPage = pathname?.includes("/tasks");

  return (
    <>
      {/* ✅ If it's NOT the task page, show the board layout */}
      {!isTaskPage ? (
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
              className="absolute top-3 -right-3 z-30 bg-white border border-gray-300 rounded-full shadow-sm hover:cursor-pointer hover:bg-gray-50 transition"
            >
              {leftCollapsed ? <MoveRight /> : <MoveLeft />}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </div>

          {/* Right Sidebar */}
          <div
            className={`relative transition-all duration-300 ease-in-out ${
              rightCollapsed ? "w-0" : "w-72"
            }`}
          >
            {/* Toggle Button (Right) */}
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="absolute top-3 -left-3 z-30 bg-white border border-gray-300 rounded-full shadow-sm hover:cursor-pointer hover:bg-gray-50 transition"
            >
              {rightCollapsed ? <MoveLeft /> : <MoveRight />}
            </button>

            {!rightCollapsed && (
              <div className="h-full">
                <BoardLinkedResources />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ✅ On /tasks page, render only the children (no sidebars) */
        <>{children}</>
      )}
    </>
  );
}
