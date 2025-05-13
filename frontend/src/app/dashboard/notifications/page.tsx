"use client";
import MarkIcon from "@/app/icons/MarkIcon";
import React, { useEffect, useState } from "react";

const NotificationsPage = () => {
  const notificationsLogs = [
    {
      notificationTitle:
        "Sarah Johnson mentioned you in a comment on Product Roadmap",
      notificationEpoch: 1747129675,
      isNotificationSeen: true,
    },
    {
      notificationTitle:
        "Michael Brown invited you to collaborate on Website Redesign",
      notificationEpoch: 1747129675,
      isNotificationSeen: true,
    },
    {
      notificationTitle: "Emily Davis commented on Marketing Campaign",
      notificationEpoch: 1747129675,
      isNotificationSeen: false,
    },
    {
      notificationTitle: "Product Roadmap was updated by John Smith",
      notificationEpoch: 1747129675,
      isNotificationSeen: false,
    },
  ];

  const formatTimeAgo = (timestamp: number): string => {
    const now = Date.now();
    const seconds = Math.floor((now - timestamp * 1000) / 1000);

    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return `${years} year${years > 1 ? "s" : ""} ago`;
  };

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-100 h-screen pt-5 pl-6 pr-8 pb-8">
      <div className="flex items-center justify-between">
        <p className="text-[var(--primary-text-color)] font-semibold text-xl">
          Notifications
        </p>
        <p className="font-medium hover:cursor-pointer text-xs text-[var(--fifth-text-color)]">
          Mark all as read
        </p>
      </div>

      <div className="rounded-lg mt-5 mr-40  shadow">
        {notificationsLogs?.map((notification, index) => (
          <div
            key={index}
            className={`flex items-center justify-between ${
              notification?.isNotificationSeen
                ? "bg-[var(--sidebar-option-background-color)]"
                : ""
            } px-6 rounded-t-lg hover:cursor-pointer`}
          >
            <div
              className={`py-4   space-y-2 border-b border-b-[var(--sidebar-option-background-color)]`}
            >
              <p
                className={`font-medium text-base ${
                  notification?.isNotificationSeen
                    ? "text-[var(--fifth-text-color)]"
                    : "text-[var(--sidebar-option-name-color)]"
                }`}
              >
                {notification?.notificationTitle}
              </p>
              <p className="text-xs text-[var(--tertiary-text-color)]">
                {formatTimeAgo(
                  notification?.notificationEpoch + currentTime * 0
                )}
              </p>
            </div>
            <div>
              {notification?.isNotificationSeen && (
                <MarkIcon width={24} height={24} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
