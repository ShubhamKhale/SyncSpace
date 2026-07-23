"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import CompletedTasksIcon from "../icons/CompletedTasks";
import TaskBoardIcon from "../icons/TaskBoardIcon";
import TasksDueSoonIcon from "../icons/TasksDueSoon";
import TeamMembersIcon from "../icons/TeamMembers";
import HistoryIcon from "../icons/HistoryIcon";
import CalendarIcon from "../icons/CalendarIcon";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { useUserStore } from "@/app/store/useUserStore";
import { LayoutGrid, Bell, Search, Plus, TrendingUp, Minus } from "lucide-react";

const BoardActivity = dynamic(
  () => import("../components/analytics-charts/BoardActivity"),
  { ssr: false }
);
const TaskCompletionTrend = dynamic(
  () => import("../components/analytics-charts/TaskCompletionTrend"),
  { ssr: false }
);
const TaskDistribution = dynamic(
  () => import("../components/analytics-charts/TaskDistribution"),
  { ssr: false }
);
const TeamContribution = dynamic(
  () => import("../components/analytics-charts/TeamContribution"),
  { ssr: false }
);

import type { TrendPoint } from "../components/analytics-charts/TaskCompletionTrend";
import type { DistributionItem } from "../components/analytics-charts/TaskDistribution";
import type { BoardActivityItem } from "../components/analytics-charts/BoardActivity";
import type { TeamContributionPoint } from "../components/analytics-charts/TeamContribution";

interface AnalyticsData {
  taskCompletionTrend: TrendPoint[];
  taskDistribution: DistributionItem[];
  boardActivity: BoardActivityItem[];
  teamContribution: {
    data: TeamContributionPoint[];
    members: string[];
  };
}

interface Stats {
  board_count?: number;
  task_todo?: number;
  task_in_progress?: number;
  task_done?: number;
  task_due_soon?: number;
  member_count?: number;
}

interface RecentBoard {
  id: string;
  title: string;
  img?: string;
  updatedAt?: string;
  updated_at?: string;
  members?: number;
  member_count?: number;
}

interface ActivityItem {
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

interface UpcomingTask {
  id: string;
  title: string;
  dueDate?: string;
  due_date?: string;
  date?: string;
  priority: string;
  stage?: string;
  boardTitle?: string;
  board_title?: string;
  project?: string;
}

const PRIORITY_STYLES: Record<string, { color: string; bg: string }> = {
  high:   { color: "#DC2626", bg: "#FEE2E2" },
  medium: { color: "#D97706", bg: "#FEF3C7" },
  low:    { color: "#16A34A", bg: "#DCFCE7" },
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function TrendBadge({ value, suffix = "from last month" }: { value: number; suffix?: string }) {
  if (value > 0) {
    return (
      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5">
        <TrendingUp size={11} />
        <span>{value}% {suffix}</span>
      </p>
    );
  }
  return (
    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1.5">
      <Minus size={11} />
      <span>0% {suffix}</span>
    </p>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconBg: string;
  trend?: number;
  trendSuffix?: string;
}

function StatCard({ label, value, icon, iconBg, trend = 0, trendSuffix }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 px-5 py-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">{value}</p>
        <TrendBadge value={trend} suffix={trendSuffix} />
      </div>
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {icon}
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useUserStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentBoards, setRecentBoards] = useState<RecentBoard[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<UpcomingTask[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    taskCompletionTrend: [],
    taskDistribution: [],
    boardActivity: [],
    teamContribution: { data: [], members: [] },
  });

  useEffect(() => {
    Promise.allSettled([
      apiFetch<Stats>("/api/dashboard/stats").then(setStats),
      apiFetch<RecentBoard[]>("/api/boards/recent").then((d) => setRecentBoards(Array.isArray(d) ? d : [])),
      apiFetch<{ logs: ActivityItem[]; total: number } | ActivityItem[]>("/api/activity-logs").then((d) => {
        if (Array.isArray(d)) setActivities(d);
        else setActivities(Array.isArray((d as { logs: ActivityItem[] }).logs) ? (d as { logs: ActivityItem[] }).logs : []);
      }),
      apiFetch<UpcomingTask[]>("/api/tasks/upcoming").then((d) => setUpcomingTasks(Array.isArray(d) ? d : [])),
      apiFetch<AnalyticsData>("/api/analytics/dashboard").then((d) => setAnalytics(d)),
      apiFetch<{ notifications: unknown[]; unread_count: number; total: number } | unknown[]>("/api/notifications").then((d) => {
        if (d && !Array.isArray(d) && typeof (d as { unread_count: number }).unread_count === "number") {
          setUnreadCount((d as { unread_count: number }).unread_count);
        }
      }),
    ]).finally(() => setStatsLoading(false));
  }, []);

  const totalBoards     = stats?.board_count      ?? 0;
  const tasksInProgress = stats?.task_in_progress ?? 0;
  const completedTasks  = stats?.task_done        ?? 0;
  const tasksDueSoon    = stats?.task_due_soon    ?? 0;
  const memberCount     = stats?.member_count     ?? 0;
  const firstName       = user?.name?.split(" ")[0] ?? "there";

  return (
    <div className="px-4 md:px-8 lg:px-10 pt-6 pb-10 bg-[#F8F9FC] dark:bg-slate-900 min-h-screen">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening in your workspace today.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 w-52 shadow-sm">
            <Search size={14} className="text-slate-400" />
            <input
              placeholder="Search anything..."
              className="text-xs text-slate-600 dark:text-slate-300 bg-transparent outline-none w-full placeholder:text-slate-400"
            />
            <span className="text-[10px] text-slate-300 dark:text-slate-600 border border-slate-200 dark:border-slate-600 rounded px-1 py-0.5 font-mono">⌘K</span>
          </div>

          {/* Create */}
          <Link href="/dashboard/boards">
            <button className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm transition">
              <Plus size={15} />
              New Board
            </button>
          </Link>

          {/* Notification bell */}
          <Link href="/dashboard/notifications">
            <button className="relative p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition shadow-sm">
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#6366F1] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </Link>

        </div>
      </div>

      {/* ── 5 Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {statsLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 px-5 py-4 flex items-center justify-between gap-4 animate-pulse">
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-7 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-700/50 rounded" />
              </div>
              <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0" />
            </div>
          ))
        ) : null}
        {!statsLoading && (
          <>
            <StatCard
              label="Total Boards"
              value={totalBoards}
              iconBg="#EFF6FF"
              icon={<TaskBoardIcon className="w-8 h-8" />}
              trend={totalBoards > 0 ? 14 : 0}
              trendSuffix="from last month"
            />
            <StatCard
              label="Tasks In Progress"
              value={tasksInProgress}
              iconBg="#ECFDF5"
              icon={<TeamMembersIcon className="w-8 h-8" />}
              trend={0}
              trendSuffix="from last month"
            />
            <StatCard
              label="Completed Tasks"
              value={completedTasks}
              iconBg="#F5F3FF"
              icon={<CompletedTasksIcon className="w-8 h-8" />}
              trend={0}
              trendSuffix="from last month"
            />
            <StatCard
              label="Tasks Due Soon"
              value={tasksDueSoon}
              iconBg="#FFF7ED"
              icon={<TasksDueSoonIcon className="w-8 h-8" />}
              trend={0}
              trendSuffix="from last week"
            />
            <StatCard
              label="Team Members"
              value={memberCount}
              iconBg="#FFF1F2"
              icon={<TeamMembersIcon className="w-8 h-8" />}
              trend={memberCount > 0 ? memberCount : 0}
              trendSuffix="new this month"
            />
          </>
        )}
      </div>

      {/* ── Charts ── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskCompletionTrend data={analytics.taskCompletionTrend} />
        <TaskDistribution data={analytics.taskDistribution} />
        <BoardActivity data={analytics.boardActivity} />
        <TeamContribution data={analytics.teamContribution.data} members={analytics.teamContribution.members} />
      </div>

      {/* ── Bottom 3-col ── */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Recent Boards */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Recent Boards</p>
            <Link href="/dashboard/boards" className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-medium">View All</Link>
          </div>
          {recentBoards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
              <LayoutGrid size={28} className="mb-2" />
              <p className="text-xs">No boards yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentBoards.slice(0, 5).map((board, i) => (
                <Link key={board.id ?? i} href={`/dashboard/boards/${board.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
                    <div className="w-9 h-9 rounded-lg bg-[#EEF2FF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#6366F1]">{board.title[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{board.title}</p>
                      <p className="text-xs text-slate-400 truncate">
                        {board.updatedAt ?? board.updated_at ?? "—"}
                      </p>
                    </div>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-700 dark:text-slate-300 text-slate-500 px-2 py-0.5 rounded-full flex-shrink-0">
                      {board.members ?? board.member_count ?? 0}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Recent Activity</p>
            <Link href="/dashboard/history" className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-medium">View All</Link>
          </div>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600">
              <HistoryIcon className="w-7 h-7" fill="currentColor" />
              <p className="text-xs mt-2">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id ?? index} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#EEF2FF] dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HistoryIcon className="w-3.5 h-3.5" fill="#6366F1" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                      <span className="font-semibold">{activity.actor ?? activity.user}</span>{" "}
                      <span className="text-slate-500">{activity.action}</span>{" "}
                      {(activity.target ?? activity.item) && (
                        <span className="text-[#6366F1] font-medium">{activity.target ?? activity.item}</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {(() => {
                        const raw = activity.createdAt ?? activity.created_at ?? activity.time;
                        if (!raw) return "";
                        const d = new Date(raw);
                        return isNaN(d.getTime()) ? raw : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Tasks */}
        <div className="p-5 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">Today&apos;s Tasks</p>
            <Link
              href={recentBoards[0] ? `/dashboard/boards/${recentBoards[0].id}/tasks` : "/dashboard/boards"}
              className="text-xs text-indigo-500 dark:text-indigo-400 hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-slate-300 dark:text-slate-600 gap-2">
              <div className="w-14 h-14 rounded-full bg-[#EEF2FF] dark:bg-blue-900/20 flex items-center justify-center">
                <CalendarIcon width={26} height={26} />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No tasks due today</p>
              <p className="text-xs text-slate-400">You&apos;re all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTasks.slice(0, 4).map((task, index) => {
                const pStyle = PRIORITY_STYLES[task.priority?.toLowerCase()] ?? PRIORITY_STYLES.medium;
                return (
                  <div key={task.id ?? index} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {(task.dueDate ?? task.due_date ?? task.date) && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <CalendarIcon width={10} height={10} />
                            {task.dueDate ?? task.due_date ?? task.date}
                          </span>
                        )}
                        {(task.boardTitle ?? task.board_title ?? task.project) && (
                          <span className="text-[10px] text-slate-400 truncate">
                            · {task.boardTitle ?? task.board_title ?? task.project}
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full capitalize font-medium flex-shrink-0"
                      style={{ backgroundColor: pStyle.bg, color: pStyle.color }}
                    >
                      {task.priority}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
