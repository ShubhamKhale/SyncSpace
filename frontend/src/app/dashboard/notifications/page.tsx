"use client";
import MarkIcon from "@/app/icons/MarkIcon";
import { formatTimeAgo } from "@/utils/timeUtils";
import React, { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

interface Notification {
  id: string;
  title?: string;
  notificationTitle?: string;
  body?: string;
  read?: boolean;
  isRead?: boolean;
  is_read?: boolean;
  createdAt?: number;
  created_at?: number;
  notificationEpoch?: number;
}

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    apiFetch<{ notifications: Notification[]; unread_count: number; total: number } | Notification[]>("/api/notifications")
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
        else setNotifications(Array.isArray((data as { notifications: Notification[] }).notifications) ? (data as { notifications: Notification[] }).notifications : []);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    try {
      await apiFetch("/api/notifications/mark-all-read", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true, isRead: true, is_read: true })));
    } catch {}
  };

  const markOneRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true, isRead: true, is_read: true } : n
        )
      );
    } catch {}
  };

  return (
    <div className="bg-[#F8F9FC] dark:bg-slate-900 min-h-screen pt-6 px-4 md:px-8 lg:px-12 pb-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-slate-800 dark:text-slate-100 font-semibold text-xl">
          Notifications
        </h1>
        <button
          onClick={markAllRead}
          className="font-medium text-xs text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Mark all as read
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24 text-slate-400 text-sm">
          Loading notifications…
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center justify-center py-24 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 dark:text-slate-500">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p className="text-sm font-medium">No notifications yet</p>
          <p className="text-xs">You&apos;ll see mentions, assignments and updates here.</p>
        </div>
      )}

      <div className="rounded-xl mt-2 border border-slate-100 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 max-w-3xl overflow-hidden">
        {!loading && !error && notifications.map((notification, idx) => {
          const isRead = notification.read ?? notification.isRead ?? notification.is_read ?? false;
          const epoch = notification.createdAt ?? notification.created_at ?? notification.notificationEpoch ?? 0;
          const title = notification.title ?? notification.notificationTitle ?? notification.body ?? "";

          return (
            <div
              key={notification.id}
              onClick={() => !isRead && markOneRead(notification.id)}
              className={`flex items-center justify-between px-6 transition-colors ${
                !isRead
                  ? "bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30"
                  : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              } ${!isRead ? "cursor-pointer" : ""} ${
                idx < notifications.length - 1 ? "border-b border-slate-100 dark:border-slate-700" : ""
              }`}
            >
              <div className="py-4 space-y-1 flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${
                  !isRead
                    ? "text-slate-800 dark:text-slate-100"
                    : "text-slate-500 dark:text-slate-400"
                }`}>
                  {!isRead && (
                    <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-2 flex-shrink-0 align-middle" />
                  )}
                  {title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {formatTimeAgo(epoch)}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">{isRead && <MarkIcon width={20} height={20} />}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NotificationsPage;
