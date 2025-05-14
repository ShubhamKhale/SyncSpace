"use client"
import HistoryIcon from "@/app/icons/HistoryIcon";
import { formatTimeAgo } from "@/utils/timeUtils";
import React, { useEffect, useState } from "react";

const HistoryPage = () => {
  const activityLogs = [
    {
      username: "John Smith",
      activityType: "edited",
      boardName: "Product Roadmap",
      activityEpoch: 1747129675,
    },
    {
      username: "Sarah Johnson",
      activityType: "commented on",
      boardName: "Marketing Campaign",
      activityEpoch: 1746956859,
    },
    {
      username: "Michael Brown",
      activityType: "shared",
      boardName: "Website Redesign",
      activityEpoch: 1715514000,
    },
    {
      username: "John Smith",
      activityType: "created",
      boardName: "Q3 Planning",
      activityEpoch: 1715341200,
    },
    {
      username: "Emily Davis",
      activityType: "added cards to",
      boardName: "Product Roadmap",
      activityEpoch: 1713008400,
    },
    {    
      username: "John Smith",
      activityType: "moved cards in",
      boardName: "Marketing Campaign",
      activityEpoch: 1694505600,
    },
    {
      username: "Sarah Johnson",
      activityType: "renamed",
      boardName: "Website Redesign",
      activityEpoch: 1694505600,
    },
  ];

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div className="bg-gray-100 h-screen pt-5 pl-6 pr-8 pb-8">
      <p className="text-[var(--primary-text-color)] font-semibold text-xl">
        Activity History
      </p>

      <div className="mt-5">
        {activityLogs?.map((activity, index) => (
          <div key={index}>
            <div className="mt-5 flex items-center space-x-3">
              <div className="relative flex flex-col items-center">
                <div className="bg-[var(--primary-background-color)] p-3 rounded-full">
                  <HistoryIcon width={20} height={20} fill="#3B82F6" />
                </div>
                {index !== activityLogs.length - 1 && (
                  <span className="absolute top-full h-full w-1 bg-gray-300"></span>
                )}
              </div>
    
              <div className="space-y-1">
                <p className="text-[var(--primary-text-color)] font-medium text-base">
                  {activity?.username}
                  <span className="ml-3">{activity?.activityType}</span>
                  <span className="ml-3 text-[var(--fifth-text-color)]">
                    {activity?.boardName}
                  </span>
                </p>
                <p className="text-[var(--tertiary-text-color)] text-xs">
                  {formatTimeAgo(activity.activityEpoch + currentTime * 0)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
