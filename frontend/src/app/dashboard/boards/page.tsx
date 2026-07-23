"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MoreVertical, Search, LayoutGrid, List, Plus, Clock, Users } from "lucide-react";
import AddBoardModal from "@/app/dashboard/boards/AddBoardModal";
import { encryptedFetch } from "@/lib/api";
import { formatTimeAgo } from "@/utils/timeUtils";

interface Board {
  id: string;
  title: string;
  description: string;
  coverColor: string;
  memberCount?: number;
  updatedAt?: string;
  cover_color?: string;
  member_count?: number;
  updated_at?: string;
}

const ROWS_OPTIONS = [6, 12, 24];

const COVER_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#EC4899",
];

function boardColor(board: Board, index: number): string {
  return board.coverColor || board.cover_color || COVER_COLORS[index % COVER_COLORS.length];
}


export default function Boards() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  const [showAddBoard, setShowAddBoard] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const loadBoards = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await encryptedFetch<unknown>("/api/boards", "GET");
      let list: Board[] = [];
      if (Array.isArray(data)) {
        list = data as Board[];
      } else if (data && typeof data === "object") {
        const obj = data as Record<string, unknown>;
        const candidate = obj.boards ?? obj.data ?? obj.items ?? obj.results;
        if (Array.isArray(candidate)) list = candidate as Board[];
      }
      setBoards(list);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBoards(); }, []);

  const filtered = boards.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const pageStart = (page - 1) * rowsPerPage;
  const pageBoards = filtered.slice(pageStart, pageStart + rowsPerPage);


  return (
    <div className="min-h-screen px-4 md:px-8 lg:px-12 pt-6 pb-8 bg-[#F8F9FC] dark:bg-slate-900 flex flex-col">

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Boards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, manage and collaborate on your project boards.
          </p>
        </div>
        <button
          onClick={() => setShowAddBoard(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Board
        </button>
      </div>

      {/* Search + View toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 w-full">
          <Search size={16} className="text-slate-400 flex-shrink-0" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search boards..."
            className="flex-1 text-sm text-slate-700 dark:text-slate-200 bg-transparent outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-slate-500 dark:text-slate-400">View:</span>
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={() => setIsGridView(true)}
              className={`p-2.5 transition-colors ${isGridView ? "bg-[#EEF2FF] text-[#6366F1]" : "text-slate-400 hover:text-slate-600"}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setIsGridView(false)}
              className={`p-2.5 transition-colors ${!isGridView ? "bg-[#EEF2FF] text-[#6366F1]" : "text-slate-400 hover:text-slate-600"}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading boards…</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      )}

      {/* Empty state: 0 boards */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
          <div className="w-20 h-20 rounded-full bg-[#EEF2FF] flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
              <path d="M4 10C4 8.34 5.34 7 7 7H14L17 11H29C30.66 11 32 12.34 32 14V26C32 27.66 30.66 29 29 29H7C5.34 29 4 27.66 4 26V10Z"
                fill="#6366F1" fillOpacity="0.15" stroke="#6366F1" strokeWidth="1.5" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-slate-700 dark:text-slate-200">No boards yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first board to get started.</p>
          </div>
          <button
            onClick={() => setShowAddBoard(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus size={15} /> New Board
          </button>
        </div>
      )}

      {/* Grid view */}
      {!loading && !error && filtered.length > 0 && isGridView && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
          {pageBoards.map((board, i) => (
            <BoardCard key={board.id} board={board} index={pageStart + i} />
          ))}
        </div>
      )}

      {/* List view */}
      {!loading && !error && filtered.length > 0 && !isGridView && (
        <div className="flex flex-col gap-3 flex-1">
          {pageBoards.map((board, i) => (
            <BoardListRow key={board.id} board={board} index={pageStart + i} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && filtered.length > 0 && (
        <div className="mt-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
          <p>
            Showing {pageStart + 1} to {Math.min(pageStart + rowsPerPage, filtered.length)} of {filtered.length} board{filtered.length !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-colors text-sm font-medium ${
                    p === page
                      ? "bg-[#6366F1] text-white border-[#6366F1]"
                      : "border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                ›
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm bg-white dark:bg-slate-800 outline-none"
              >
                {ROWS_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {showAddBoard && (
        <AddBoardModal onClose={() => setShowAddBoard(false)} onCreated={loadBoards} />
      )}
    </div>
  );
}

function BoardCard({ board, index }: { board: Board; index: number }) {
  const color = boardColor(board, index);
  const updatedTs = board.updatedAt ?? board.updated_at;
  const members = board.memberCount ?? board.member_count ?? 0;

  return (
    <div className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <Link href={`/dashboard/boards/${board.id}`} className="block">
        {/* Color header */}
        <div className="h-36 w-full relative flex items-center justify-center" style={{ backgroundColor: color + "22" }}>
          <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ backgroundColor: color + "33" }}>
            <span className="text-2xl font-bold" style={{ color }}>{board.title[0]?.toUpperCase()}</span>
          </div>
        </div>
        {/* Card body */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
              <span className="text-sm font-bold" style={{ color }}>{board.title[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{board.title}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2 leading-snug">
                {board.description || "No description"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{updatedTs ? formatTimeAgo(new Date(updatedTs).getTime() / 1000) : "—"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={12} />
              <span>{members}</span>
            </div>
          </div>
        </div>
      </Link>
      {/* 3-dot menu */}
      <button className="absolute top-3 right-3 w-7 h-7 rounded-md bg-white/80 dark:bg-slate-700/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white dark:hover:bg-slate-700 shadow-sm">
        <MoreVertical size={14} className="text-slate-500" />
      </button>
    </div>
  );
}

function BoardListRow({ board, index }: { board: Board; index: number }) {
  const color = boardColor(board, index);
  const updatedTs = board.updatedAt ?? board.updated_at;
  const members = board.memberCount ?? board.member_count ?? 0;

  return (
    <Link href={`/dashboard/boards/${board.id}`}>
      <div className="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + "22" }}>
          <span className="text-base font-bold" style={{ color }}>{board.title[0]?.toUpperCase()}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">{board.title}</p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{board.description || "No description"}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>{updatedTs ? formatTimeAgo(new Date(updatedTs).getTime() / 1000) : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={12} />
            <span>{members}</span>
          </div>
        </div>
        <MoreVertical size={14} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
      </div>
    </Link>
  );
}
