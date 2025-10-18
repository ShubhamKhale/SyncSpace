import Image from "next/image";
import BoardActivity from "../components/analytics-charts/BoardActivity";
import TaskCompletionTrend from "../components/analytics-charts/TaskCompletionTrend";
import TaskDistribution from "../components/analytics-charts/TaskDistribution";
import TeamContribution from "../components/analytics-charts/TeamContribution";
import CompletedTasksIcon from "../icons/CompletedTasks";
import TaskBoardIcon from "../icons/TaskBoardIcon";
import TasksDueSoonIcon from "../icons/TasksDueSoon";
import TeamMembersIcon from "../icons/TeamMembers";
import HistoryIcon from "../icons/HistoryIcon";
import CalendarIcon from "../icons/CalendarIcon";
import TagIcon from "../icons/TagIcon";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "Product Roadmap",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "4 months ago",
    members: 4,
  },
  {
    id: 2,
    title: "UI Revamp",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "2 months ago",
    members: 6,
  },
  {
    id: 3,
    title: "Backend API",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "1 month ago",
    members: 3,
  },
  {
    id: 4,
    title: "Mobile App",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "3 months ago",
    members: 4,
  },
  {
    id: 5,
    title: "Design System",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "2 months ago",
    members: 5,
  },
  {
    id: 6,
    title: "Frontend Refactor",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "1 month ago",
    members: 4,
  },
  {
    id: 7,
    title: "Backend Migration",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "3 months ago",
    members: 3,
  },
  {
    id: 8,
    title: "UX Audit",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "2 months ago",
    members: 4,
  },
  {
    id: 9,
    title: "Security Audit",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "1 month ago",
    members: 5,
  },
  {
    id: 10,
    title: "Performance Optimization",
    img: "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
    lastUpdated: "3 months ago",
    members: 4,
  },
];

const activities = [
  {
    user: "John Smith",
    action: "edited",
    item: "Product Roadmap",
    time: "4 months ago",
  },
  {
    user: "Sarah Lee",
    action: "created",
    item: "Marketing Plan",
    time: "2 months ago",
  },
  {
    user: "Michael Brown",
    action: "updated",
    item: "User Flow",
    time: "1 month ago",
  },
  {
    user: "John Smith",
    action: "edited",
    item: "Product Roadmap",
    time: "4 months ago",
  },
  {
    user: "Sarah Lee",
    action: "created",
    item: "Marketing Plan",
    time: "2 months ago",
  },
  {
    user: "Michael Brown",
    action: "updated",
    item: "User Flow",
    time: "1 month ago",
  },
  {
    user: "John Smith",
    action: "edited",
    item: "Product Roadmap",
    time: "4 months ago",
  },
  {
    user: "Sarah Lee",
    action: "created",
    item: "Marketing Plan",
    time: "2 months ago",
  },
  {
    user: "Michael Brown",
    action: "updated",
    item: "User Flow",
    time: "1 month ago",
  },
];

const tasks = [
  {
    title: "Define app architecture",
    date: "25 May 2025",
    project: "Product Roadmap",
    tag: "Planning",
    tagColor: "#7C3AED",
    tagBg: "#F3E8FF",
    priority: "High",
    priorityColor: "#B45309",
    priorityBg: "#FEE2E2",
  },
  {
    title: "UI design review",
    date: "1 Jun 2025",
    project: "Design System",
    tag: "Design",
    tagColor: "#2563EB",
    tagBg: "#DBEAFE",
    priority: "Medium",
    priorityColor: "#92400E",
    priorityBg: "#FEF3C7",
  },
  {
    title: "Backend API integration",
    date: "12 Jun 2025",
    project: "Mobile App",
    tag: "Development",
    tagColor: "#059669",
    tagBg: "#D1FAE5",
    priority: "High",
    priorityColor: "#B45309",
    priorityBg: "#FEE2E2",
  },
  {
    title: "Test user onboarding flow",
    date: "20 Jun 2025",
    project: "User Experience",
    tag: "Testing",
    tagColor: "#DB2777",
    tagBg: "#FCE7F3",
    priority: "Low",
    priorityColor: "#065F46",
    priorityBg: "#D1FAE5",
  },
  {
    title: "Deploy staging build",
    date: "25 Jun 2025",
    project: "Deployment",
    tag: "Release",
    tagColor: "#9333EA",
    tagBg: "#F3E8FF",
    priority: "High",
    priorityColor: "#B45309",
    priorityBg: "#FEE2E2",
  },
];

export default function DashboardHome() {
  return (
    <div className="px-12 pt-4 pb-6 bg-gray-100">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-xl text-[var(--primary-text-colo)]">
          My Dashboard
        </p>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-x-4">
        <div className="bg-white px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] text-base">Total Boards</p>
            <p className="text-black text-xl font-semibold">8</p>
          </div>
          <TaskBoardIcon />
        </div>
        <div className="bg-white px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] text-base">Team Members</p>
            <p className="text-black text-xl font-semibold">12</p>
          </div>
          <TeamMembersIcon />
        </div>
        <div className="bg-white px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] text-base">Completed Tasks</p>
            <p className="text-black text-xl font-semibold">24</p>
          </div>
          <div>
            <CompletedTasksIcon />
          </div>
        </div>
        <div className="bg-white px-4 pt-4 pb-6 inline-flex items-start justify-between rounded-lg shadow-md">
          <div className="space-y-4">
            <p className="text-[#6B7280] text-base">Tasks Due Soon</p>
            <p className="text-black text-xl font-semibold">7</p>
          </div>
          <div>
            <TasksDueSoonIcon />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <TaskCompletionTrend />
        <TaskDistribution />
        <BoardActivity />
        <TeamContribution />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="p-5 space-y-6 h-fit bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-base">Recent Boards</p>
            <Link href={"/dashboard/boards"}>
              <p className="text-xs text-[#2563EB]">View all</p>
            </Link>
          </div>
          <div className="space-y-4">
            {projects?.slice(0, 5)?.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between"
              >
                <Image
                  className="rounded-lg w-12 h-12"
                  src={project.img}
                  alt={project.title}
                  width={48}
                  height={48}
                />
                <div>
                  <p className="font-medium text-sm">{project.title}</p>
                  <div className="inline-flex items-center space-x-3">
                    <p className="text-[10px] text-[#6B7280]">Last updated</p>
                    <p className="text-[10px] text-[#6B7280]">
                      {project.lastUpdated}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-2 text-[10px] bg-[#E5E7EB] rounded-full hover:cursor-pointer">
                  {project.members} members
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 space-y-6 h-fit bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-base">Recent Activity</p>
            <p className="text-xs text-[#2563EB]">View all</p>
          </div>
          <div className="space-y-4">
            {activities?.slice(0, 5)?.map((activity, index) => (
              <div key={index} className="flex items-start justify-between">
                <HistoryIcon width={32} height={32} fill="#3B82F6" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">
                    {activity.user}{" "}
                    <span className="text-[#4B5563] text-sm">
                      {activity.action}
                    </span>{" "}
                    <span className="text-[#2563EB] text-sm">
                      {activity.item}
                    </span>
                  </p>
                </div>
                <p className="text-sm text-[#6B7280]">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-5 space-y-6 bg-white rounded-lg">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-base">Upcoming Tasks</p>
            <p className="text-xs text-[#2563EB]">View all</p>
          </div>
          <div className="mt-3 space-y-4">
            {tasks.slice(0, 2).map((task, index) => (
              <div key={index} className="p-3 flex justify-between items-start">
                <div className="inline-flex flex-col space-y-2">
                  <p className="font-medium text-sm">{task.title}</p>
                  <div className="inline-flex items-center space-x-4">
                    <CalendarIcon width={20} height={20} />
                    <p className="text-[#6B7280] text-xs">{task.date}</p>
                    <p>{task.project}</p>
                  </div>
                  <div
                    className="px-4 py-2 w-fit inline-flex items-center space-x-2 rounded-3xl hover:cursor-pointer"
                    style={{ backgroundColor: task.tagBg }}
                  >
                    <TagIcon width={16} height={16} fill={task.tagColor} />
                    <p style={{ color: task.tagColor }}>{task.tag}</p>
                  </div>
                </div>
                <div
                  className="ml-4 px-4 py-2 text-base rounded-3xl hover:cursor-pointer"
                  style={{
                    backgroundColor: task.priorityBg,
                    color: task.priorityColor,
                  }}
                >
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
