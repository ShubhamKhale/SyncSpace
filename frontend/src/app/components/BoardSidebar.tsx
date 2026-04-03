"use client";
import React, { useEffect, useState } from "react";
import ProfileIcon from "../icons/ProfileIcon";
import { HistoryIcon, Moon, Pencil, Sun, TagIcon } from "lucide-react";
import BoardActivityIcon from "../icons/BoardActivity";
import { EditableText } from "./EditableText";
import { useBoardStore } from "@/app/store/useBoardStore";
import { useEditMode } from "@/app/hooks/useEditMode";
import { useTheme } from "@/app/hooks/useTheme";
import { BoardSidebarSkeleton } from "./Skeleton";
import EditBoardModal from "./EditBoardModal";

const BoardSidebar: React.FC = () => {
  const { board, loading, saveStates, updateBoardTitle, updateBoardDescription, updateBoardDetails } =
    useBoardStore();
  const permissions = useEditMode("owner"); // Replace "owner" with actual user role
  const { theme, darkModeToggle } = useTheme();
  const [showEditModal, setShowEditModal] = useState(false);
  const isSaving = saveStates["details"] === "loading";

  useEffect(() => {
    if (!board) {
      useBoardStore.setState({
        board: {
          id: "board-1",
          title: "Product Launch Q4",
          description: "Manage design, development, and documentation resources",
          owner: "Sarah Miller",
          createdAt: "2023-08-15",
          updatedAt: "2023-08-20",
          tags: [
            { label: "User Testing",      color: "#DBEAFE", textColor: "#1D4ED8" },
            { label: "Market Analysis",   color: "#FED7AA", textColor: "#C2410C" },
            { label: "Feasibility Study", color: "#EDE9FE", textColor: "#6D28D9" },
          ],
          status: "active",
          coverColor: "#2563EB",
        },
        loading: false,
      });
    }
  }, [board]);

  if (loading || !board) return <BoardSidebarSkeleton />;

  return (
    <aside className="flex flex-col justify-between w-full h-screen border-r border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800">
      {/* Top Section */}
      <div className="overflow-y-auto scrollbar-hide">
        {/* Board Details */}
        <div className="px-5 py-4">
          {/* Board Details header with edit trigger */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Board Details
            </p>
            {permissions.canEditBoardMetadata && (
              <button
                onClick={() => setShowEditModal(true)}
                title="Edit board details"
                className="text-slate-400 hover:text-slate-600 hover:cursor-pointer transition"
              >
                <Pencil size={14} />
              </button>
            )}
          </div>

          {/* Editable Board Title */}
          <div className="mb-3">
            <EditableText
              value={board.title}
              onSave={updateBoardTitle}
              placeholder="Enter board title"
              className="text-base font-semibold text-slate-900 dark:text-slate-100"
              saveState={saveStates.title}
              disabled={!permissions.canEditBoardMetadata}
            />
          </div>

          {/* Editable Board Description */}
          <div className="mb-5">
            <EditableText
              value={board.description}
              onSave={updateBoardDescription}
              placeholder="Add board description"
              className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
              multiline
              saveState={saveStates.description}
              disabled={!permissions.canEditBoardMetadata}
            />
          </div>

          {/* Meta list */}
          <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <ProfileIcon width="16" height="16" />
              <p>Owner: <span className="text-slate-800 dark:text-slate-100 font-medium">{board.owner}</span></p>
            </li>
            <li className="flex items-center space-x-2">
              <HistoryIcon width="16" height="16" />
              <p>Created: <span className="text-slate-800 dark:text-slate-100">{board.createdAt}</span></p>
            </li>
            <li className="flex items-center space-x-2">
              <HistoryIcon width="16" height="16" />
              <p>Updated: <span className="text-slate-800 dark:text-slate-100">{board.updatedAt}</span></p>
            </li>

            {/* Tags */}
            {board.tags.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 items-start gap-2 pt-1">
                {board.tags.map((tag) => (
                  <div
                    key={tag.label}
                    className="px-3 py-1.5 inline-flex items-center text-xs space-x-1.5 rounded-full border"
                    style={{
                      backgroundColor: tag.color,
                      color: tag.textColor,
                      borderColor: tag.textColor + "33",
                    }}
                  >
                    <TagIcon width={11} height={11} fill={tag.textColor} />
                    <p className="font-medium truncate">{tag.label}</p>
                  </div>
                ))}
              </div>
            )}
          </ul>

          {/* Board Health */}
          <div className="mt-7">
            <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mb-3">
              Board Health
            </p>
            <div className="bg-white dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-3 shadow-sm">
              <ul className="text-sm space-y-2.5">
                <li className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 bg-amber-400 rounded-full ring-2 ring-amber-200"></div>
                  <p className="font-semibold text-slate-800 dark:text-slate-100">Warning</p>
                </li>
                <li className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-slate-400">Overdue tasks</p>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded">3</span>
                </li>
                <li className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-slate-400">Bottlenecks</p>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded">1</span>
                </li>
                <li className="flex items-center justify-between">
                  <p className="text-slate-500 dark:text-slate-400">At risk</p>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded">2</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                Recent Activity
              </p>
              <BoardActivityIcon />
            </div>
            <div className="space-y-3">
              <div className="pl-4 text-sm space-y-0.5 border-l-2 border-slate-300 dark:border-slate-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-slate-900 dark:text-slate-100 font-medium">Alex Kim</p>
                  <p className="text-slate-600 dark:text-slate-300">added a new task</p>
                </div>
                <p className="text-slate-400 text-xs">10 min ago</p>
              </div>
              <div className="pl-4 text-sm space-y-0.5 border-l-2 border-slate-300 dark:border-slate-600">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-slate-900 dark:text-slate-100 font-medium">Sarah Miller</p>
                  <p className="text-slate-600 dark:text-slate-300">commented on a task</p>
                </div>
                <p className="text-slate-400 text-xs">2 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom user bar */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold text-sm">
            N
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">Nick Jones</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">nick@example.com</p>
          </div>
        </div>
        <button
          onClick={darkModeToggle}
          className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-200 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      {/* Edit Board Modal */}
      {showEditModal && (
        <EditBoardModal
          initialTitle={board.title}
          initialDescription={board.description}
          initialTags={board.tags}
          initialStatus={board.status}
          initialCoverColor={board.coverColor}
          isSaving={isSaving}
          onSave={async (details) => {
            await updateBoardDetails(details);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </aside>
  );
};

export default BoardSidebar;
