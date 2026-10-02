"use client";
import { usePathname, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import BoardSidebar from "@/app/components/BoardSidebar";
import BoardLinkedResources from "@/app/components/BoardLinkedResources";
import BoardAiChat from "@/app/components/BoardAiChat";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [leftCollapsed,  setLeftCollapsed]  = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useParams<{ boardid: string }>();
  const boardId = params?.boardid;

  useEffect(() => {
    setLeftCollapsed(window.innerWidth < 1024);
    setRightCollapsed(window.innerWidth < 1280);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setLeftCollapsed(window.innerWidth < 1024);
      setRightCollapsed(window.innerWidth < 1280);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const isTaskPage = pathname?.includes("/tasks");
  const isFlowEditor = /\/flows\/[^/]+/.test(pathname ?? "");
  const isFullScreen = isTaskPage || isFlowEditor;

  return (
    <>
      <BoardAiChat boardId={boardId} />

      {/* If it's NOT a full-screen page, show the board layout */}
      {!isFullScreen ? (
        <div className="bg-[#F8F9FC] dark:bg-slate-900 h-screen flex overflow-hidden rounded-none md:rounded-2xl shadow-none md:shadow-lg">

          {/* Mobile backdrop — shown when a sidebar is open on small screens */}
          {(!leftCollapsed || !rightCollapsed) && (
            <div
              className="fixed inset-0 z-[25] bg-black/40 lg:hidden"
              onClick={() => { setLeftCollapsed(true); setRightCollapsed(true); }}
            />
          )}

          {/* Left Sidebar */}
          <div
            className={`${
              leftCollapsed ? "w-0" : "w-64"
            } relative transition-all duration-300 ease-in-out flex-shrink-0`}
          >
            {!leftCollapsed && (
              <div className="absolute lg:relative inset-y-0 left-0 z-30 w-64 h-full">
                <BoardSidebar boardId={boardId} />
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col flex-1 bg-white dark:bg-slate-800 min-w-0 relative">
            {/* Toggle Button (Left) — in main content so it paints over the left sidebar (earlier in DOM) */}
            <button
              onClick={() => setLeftCollapsed(!leftCollapsed)}
              className="absolute top-4 -left-3.5 z-30 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm hover:cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition"
            >
              {leftCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            <div className="flex-1 overflow-y-auto scrollbar-hide p-4">{children}</div>
          </div>

          {/* Right Sidebar — toggle button lives here so it paints over the main content (earlier in DOM) */}
          <div
            className={`${
              rightCollapsed ? "w-0" : "w-72"
            } relative transition-all duration-300 ease-in-out flex-shrink-0`}
          >
            {/* Toggle Button (Right) */}
            <button
              onClick={() => setRightCollapsed(!rightCollapsed)}
              className="absolute top-4 -left-3.5 z-40 w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-full shadow-sm hover:cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600 transition"
            >
              {rightCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {!rightCollapsed && (
              <div className="absolute lg:relative inset-y-0 right-0 z-30 w-72 h-full">
                <BoardLinkedResources boardId={boardId} />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Full-screen: /tasks or /flows/[flowId] — no sidebars */
        <>{children}</>
      )}
    </>
  );
}
