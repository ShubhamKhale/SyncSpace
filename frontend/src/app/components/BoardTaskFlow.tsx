"use client";
import React, { useState } from "react";
import {
  ArrowRight,
  Calendar,
  FilterIcon,
  Flag,
  Grid,
  Layout,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import TimelineShortTaskCard from "./TimeLineShortTaskCard";
import { format, addDays, differenceInCalendarDays, isSameDay } from "date-fns";
import PriorityPhaseMatrix from "./PriorityPhaseMatrix";

type Priority = "high" | "medium" | "low";

const BoardTaskFlow: React.FC = () => {
  const stages = [
    { name: "Planning", color: "bg-purple-500", count: 5 },
    { name: "Design", color: "bg-blue-500", count: 8 },
    { name: "Development", color: "bg-yellow-400", count: 12 },
    { name: "QA", color: "bg-green-400", count: 4 },
    { name: "Deployment", color: "bg-teal-500", count: 2 },
  ];

  const tasks: {
    stage: string;
    title: string;
    tags: string[];
    startDate: string;
    endDate: string;
    assignee: string;
    priority: Priority;
    comments: number;
    attachments: number;
    flagged: boolean;
  }[] = [
    {
      stage: "Planning",
      title: "Market Research",
      tags: ["Marketing > Research", "External"],
      startDate: "2025-10-05",
      endDate: "2025-10-15",
      assignee: "Alex Kim",
      priority: "high", 
      comments: 3,
      attachments: 2,
      flagged: true,
    },
    {
      stage: "Design",
      title: "Wireframes",
      tags: ["Design > Wireframes"],
      startDate: "2025-10-10",
      endDate: "2025-10-20",
      assignee: "John Doe",
      priority: "medium",
      comments: 2,
      attachments: 1,
      flagged: false,
    },
    {
      stage: "Development",
      title: "Frontend Implementation",
      tags: ["Development > Frontend"],
      startDate: "2025-10-15",
      endDate: "2025-10-25",
      assignee: "Jane Smith",
      priority: "low",
      comments: 1,
      attachments: 0,
      flagged: false,
    },
    {
      stage: "QA",
      title: "User Testing",
      tags: ["Testing > User Testing"],
      startDate: "2025-10-20",
      endDate: "2025-10-30",
      assignee: "Bob Johnson",
      priority: "high",
      comments: 0,
      attachments: 0,
      flagged: false,
    },
    {
      stage: "Deployment",
      title: "Production Deployment",
      tags: ["Deployment > Production"],
      startDate: "2025-10-25",
      endDate: "2025-11-05",
      assignee: "Alice Lee",
      priority: "medium",
      comments: 0,
      attachments: 0,
      flagged: false,
    },
    {
      stage: "Planning",
      title: "Market Research",
      tags: ["Marketing > Research", "External"],
      startDate: "2025-10-05",
      endDate: "2025-10-15",
      assignee: "Alex Kim",
      priority: "high",
      comments: 3,
      attachments: 2,
      flagged: true,
    },
    {
      stage: "Design",
      title: "Wireframes",
      tags: ["Design > Wireframes"],
      startDate: "2025-10-10",
      endDate: "2025-10-20",
      assignee: "John Doe",
      priority: "medium",
      comments: 2,
      attachments: 1,
      flagged: false,
    },
  ];

  const [activeView, setActiveView] = useState<
    "kanban" | "timeline" | "matrix"
  >("kanban");

  const startDate = new Date("2025-10-05");
  const numberOfDays = 14; // or make this dynamic

  const timelineDays = Array.from({ length: numberOfDays }, (_, i) =>
    addDays(startDate, i)
  );

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 sticky top-0 z-20">
        {/* Header Row */}
        {/* */}
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-gray-800">
              Product Launch Q4
            </h1>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <div className="inline-flex items-center space-x-2">
                <FilterIcon />
                <p className="mr-2">Filters:</p>
              </div>
              <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1 mr-2">
                <option>Phase</option>
                <option>Planning</option>
                <option>Design</option>
                <option>Development</option>
              </select>
              <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1 mr-2">
                <option>Priority</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
              <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1 mr-2">
                <option>Contributor</option>
                <option>Sarah</option>
                <option>Alex</option>
                <option>Maria</option>
              </select>
              <select className="border border-gray-300 rounded-md hover:cursor-pointer text-sm px-2 py-1">
                <option>Label</option>
                <option>UI</option>
                <option>Backend</option>
                <option>QA</option>
              </select>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView("kanban")}
              className={`flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm transition hover:cursor-pointer ${
                activeView === "kanban"
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <Layout size={16} />
              Kanban
            </button>

            <button
              onClick={() => setActiveView("timeline")}
              className={`flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm transition hover:cursor-pointer ${
                activeView === "timeline"
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <Calendar size={16} />
              Timeline
            </button>

            <button
              onClick={() => setActiveView("matrix")}
              className={`flex items-center gap-1 border px-3 py-1.5 rounded-md text-sm transition hover:cursor-pointer ${
                activeView === "matrix"
                  ? "bg-[#EFF6FF] text-[#2563EB] border-[#2563EB]"
                  : "text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              <Grid size={16} />
              Matrix
            </button>

            {/* <button className="flex items-center gap-1 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-md text-sm hover:bg-blue-50 hover:cursor-pointer transition">
            <Save size={16} />
            Save view
          </button> */}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-100 py-6 px-6">
        {/* kanban  */}
        {activeView === "kanban" && (
          <div>
            <div className="bg-white p-5 rounded-lg w-fit mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Task Flow
              </h2>
              <div className="flex items-center justify-center gap-4">
                {stages.map((stage, index) => (
                  <React.Fragment key={stage.name}>
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full ${stage.color} text-white flex items-center justify-center font-semibold shadow-md`}
                      >
                        {stage.count}
                      </div>
                      <span className="text-xs mt-2 text-gray-600 font-medium">
                        {stage.name}
                      </span>
                    </div>
                    {index !== stages.length - 1 && (
                      <ArrowRight size={20} className="text-gray-400" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {stages.map((stage) => {
                const colTasks = tasks.filter((t) => t.stage === stage.name);
                return (
                  <div
                    key={stage.name}
                    className="bg-white h-fit rounded-lg p-4 w-72 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800 text-sm">
                        {stage.name}{" "}
                        <span className="text-gray-500">
                          ({colTasks.length})
                        </span>
                      </h3>
                      <button className="text-gray-400 text-lg font-bold hover:text-gray-600 hover:cursor-pointer">
                        +
                      </button>
                    </div>

                    {/* Task Cards */}
                    {colTasks.length > 0 ? (
                      colTasks.map((task, idx) => (
                        <div
                          key={idx}
                          className="bg-gray-50 rounded-md p-3 mb-3 shadow-sm hover:shadow-md transition"
                        >
                          <h4 className="text-sm font-medium text-gray-800 mb-2">
                            {task.title}
                          </h4>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-gray-500 text-xs">
                            <div className="flex items-center gap-1 hover:cursor-pointer">
                              <Calendar size={14} />
                              <span>{task.startDate}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {task.flagged && (
                                <Flag size={14} className="text-red-500" />
                              )}
                              <div className="flex items-center gap-1 hover:cursor-pointer">
                                <MessageSquare size={14} />
                                <span>{task.comments}</span>
                              </div>
                              <div className="flex items-center gap-1 hover:cursor-pointer">
                                <Paperclip size={14} />
                                <span>{task.attachments}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No tasks yet
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* timeline  */}
        {activeView === "timeline" && (
          <div className="overflow-x-auto">
            <div className="min-w-max space-y-4 bg-white rounded-2xl p-6">
              <h2 className="text-xl font-bold">
                Timeline View: {format(startDate, "MMM d")} –{" "}
                {format(addDays(startDate, numberOfDays - 1), "MMM d")}
              </h2>

              {/* Day Headers */}
              <div className="grid grid-flow-col auto-cols-min gap-4 text-sm font-medium text-gray-600 mb-2">
                {timelineDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`text-center px-2 py-1 rounded ${
                      isSameDay(day, new Date())
                        ? "bg-blue-100 text-blue-700 font-bold"
                        : ""
                    }`}
                  >
                    {format(day, "EEE")} <br />
                    {format(day, "MMM d")}
                  </div>
                ))}
              </div>

              {/* Task Rows */}
              <div className="relative grid grid-flow-col auto-cols-min gap-4">
                {tasks.map((task, idx) => {
                  const taskStart = new Date(task.startDate);
                  const taskEnd = new Date(task.endDate);
                  const colStart =
                    differenceInCalendarDays(taskStart, startDate) + 1;
                  const colSpan =
                    differenceInCalendarDays(taskEnd, taskStart) + 1;

                  return (
                    <div
                      key={idx}
                      className={`col-start-${colStart} col-span-${colSpan}`}
                      style={{
                        gridColumnStart: colStart,
                        gridColumnEnd: `span ${colSpan}`,
                      }}
                    >
                      <TimelineShortTaskCard {...task} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* matrix */}
        {activeView === "matrix" && (
            <PriorityPhaseMatrix />
        )}
      </div>
    </div>
  );
};

export default BoardTaskFlow;
