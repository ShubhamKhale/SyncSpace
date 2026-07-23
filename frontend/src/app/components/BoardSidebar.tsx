"use client";
import React, { useEffect, useState } from "react";
import ProfileIcon from "../icons/ProfileIcon";
import { ArrowLeft, HistoryIcon, Moon, Pencil, Sun, TagIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import BoardActivityIcon from "../icons/BoardActivity";
import { EditableText } from "./EditableText";
import { useBoardStore } from "@/app/store/useBoardStore";
import { useEditMode } from "@/app/hooks/useEditMode";
import { useTheme } from "@/app/hooks/useTheme";
import { useUserStore, getInitials } from "@/app/store/useUserStore";
import { apiFetch } from "@/lib/api";
import { BoardSidebarSkeleton } from "./Skeleton";
import EditBoardModal from "./EditBoardModal";

interface BoardActivityItem {
  id?: string;
  actor?: string;
  user?: string;
  action: string;
  target?: string;
  item?: string;
  createdAt?: string;
  created_at?: string;
  time?: string;
}

interface BoardHealth {
  status?: "healthy" | "warning" | "critical";
  overdueTasks?: number;
  bottlenecks?: number;
  atRisk?: number;
  overdue_tasks?: number;
  at_risk?: number;
}

function formatDate(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const dd   = String(d.getDate()).padStart(2, "0");
    const mm   = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const HH   = String(d.getHours()).padStart(2, "0");
    const MM   = String(d.getMinutes()).padStart(2, "0");
    const SS   = String(d.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${HH}:${MM}:${SS}`;
  } catch {
    return iso;
  }
}

const AVATAR_COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

const BoardSidebar: React.FC<{ boardId?: string }> = ({ boardId }) => {
  const { board, loading, saveStates, fetchBoard, updateBoardTitle, updateBoardDescription, updateBoardDetails } =
    useBoardStore();
  const permissions = useEditMode();
  const { theme, darkModeToggle } = useTheme();
  const { user, fetchUser } = useUserStore();
  const router = useRouter();
  const [showEditModal, setShowEditModal] = useState(false);
  const [activity, setActivity] = useState<BoardActivityItem[]>([]);
  const [health, setHealth] = useState<BoardHealth | null>(null);
  const isSaving = saveStates["details"] === "loading";

  useEffect(() => {
    if (boardId) {
      useBoardStore.setState({ board: null, loading: false, error: null });
      fetchBoard(boardId);
    }
  }, [boardId, fetchBoard]);

  useEffect(() => {
    if (!user) fetchUser();
  }, [user, fetchUser]);

  useEffect(() => {
    if (!boardId) return;
    apiFetch<BoardActivityItem[]>(`/api/boards/${boardId}/activity`)
      .then((d) => setActivity(Array.isArray(d) ? d : []))
      .catch(() => setActivity([]));
    apiFetch<BoardHealth>(`/api/boards/${boardId}/health`)
      .then(setHealth)
      .catch(() => setHealth(null));
  }, [boardId]);

  if (loading) return <BoardSidebarSkeleton />;
  if (!board) return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-sm text-slate-500 dark:text-slate-400 space-y-2">
      <p className="font-semibold">Board not found</p>
      {useBoardStore.getState().error && (
        <p className="text-xs text-red-500 text-center">{useBoardStore.getState().error}</p>
      )}
    </div>
  );

  return (
    <aside className="flex flex-col justify-between w-full h-screen border-r border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800">
      {/* Top Section */}
      <div className="overflow-y-auto scrollbar-hide">
        {/* Back button */}
        <div className="px-5 pt-4 pb-2">
          <button
            onClick={() => router.push("/dashboard/boards")}
            className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:cursor-pointer transition"
          >
            <ArrowLeft size={13} />
            Back to Boards
          </button>
        </div>
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
              placeholder="Click to add description..."
              className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed min-h-[2rem]"
              multiline
              saveState={saveStates.description}
              disabled={false}
            />
          </div>

          {/* Meta list */}
          <ul className="text-sm space-y-2 text-slate-600 dark:text-slate-300">
            <li className="flex items-center space-x-2">
              <ProfileIcon width="16" height="16" />
              <p>Owner: <span className="text-slate-800 dark:text-slate-100 font-medium">
                {board.owner === user?.id
                  ? user.name
                  : board.owner
                    ? `${board.owner.slice(0, 8)}…`
                    : "Unknown"}
              </span></p>
            </li>
            <li className="flex items-center space-x-2">
              <HistoryIcon width="16" height="16" />
              <p>Created: <span className="text-slate-800 dark:text-slate-100">{formatDate(board.createdAt)}</span></p>
            </li>
            <li className="flex items-center space-x-2">
              <HistoryIcon width="16" height="16" />
              <p>Updated: <span className="text-slate-800 dark:text-slate-100">{formatDate(board.updatedAt)}</span></p>
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
              {health ? (
                <ul className="text-sm space-y-2.5">
                  <li className="flex items-center space-x-2">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ring-2 ${
                        health.status === "critical"
                          ? "bg-red-400 ring-red-200"
                          : health.status === "healthy"
                          ? "bg-emerald-400 ring-emerald-200"
                          : "bg-amber-400 ring-amber-200"
                      }`}
                    ></div>
                    <p className="font-semibold text-slate-800 dark:text-slate-100 capitalize">
                      {health.status ?? "Unknown"}
                    </p>
                  </li>
                  <li className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400">Overdue tasks</p>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded">
                      {health.overdueTasks ?? health.overdue_tasks ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400">Bottlenecks</p>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded">
                      {health.bottlenecks ?? 0}
                    </span>
                  </li>
                  <li className="flex items-center justify-between">
                    <p className="text-slate-500 dark:text-slate-400">At risk</p>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-600 px-2 py-0.5 rounded">
                      {health.atRisk ?? health.at_risk ?? 0}
                    </span>
                  </li>
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No health data yet.</p>
              )}
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
              {activity.slice(0, 3).map((item, idx) => {
                const name = item.actor ?? item.user ?? "?";
                return (
                  <div key={item.id ?? idx} className="flex items-start gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: avatarColor(name) }}
                    >
                      {name[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-800 dark:text-slate-100 leading-snug">
                        <span className="font-semibold">{name}</span>{" "}
                        <span className="text-slate-500 dark:text-slate-400">{item.action}{item.target || item.item ? ` ${item.target ?? item.item}` : ""}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(item.createdAt ?? item.created_at ?? item.time ?? "")}</p>
                    </div>
                  </div>
                );
              })}
              {activity.length === 0 && (
                <p className="text-xs text-slate-400 italic">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom user bar */}
      <div className="px-5 py-4 flex items-center justify-between border-t border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 text-slate-700 font-semibold text-sm">
            {user ? getInitials(user.name) : "…"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{user?.name || "Loading…"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || ""}</p>
          </div>
        </div>
        <button
          onClick={darkModeToggle}
          className="p-2 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700 transition"
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
