"use client";
import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  Calendar,
  FilterIcon,
  Grid,
  Layout,
} from "lucide-react";
import TimelineShortTaskCard from "./TimeLineShortTaskCard";
import { format, addDays, differenceInCalendarDays, isSameDay } from "date-fns";
import PriorityPhaseMatrix from "./PriorityPhaseMatrix";
import { useBoardTaskStore } from "@/app/store/useBoardTaskStore";
import { useEditMode } from "@/app/hooks/useEditMode";
import SelectPopover from "./SelectPopover";
import { SortablePipelineStage } from "./kanban/SortablePipelineStage";
import { DroppableColumn } from "./kanban/DroppableColumn";
import { DraggableTaskCard } from "./kanban/DraggableTaskCard";

const STAGE_COLORS: Record<string, string> = {
  Planning:    "bg-purple-500",
  Design:      "bg-blue-500",
  Development: "bg-yellow-400",
  QA:          "bg-green-400",
  Deployment:  "bg-teal-500",
};

const BoardTaskFlow: React.FC = () => {
  const { tasks, saveStates, updateTaskTitle, updateTaskPriority, updateTaskDates, updateTaskAssignee, updateTaskStage } = useBoardTaskStore();
  const permissions = useEditMode("owner");
  const [activeView,        setActiveView]        = useState<"kanban" | "timeline" | "matrix">("kanban");
  const [phaseFilter,       setPhaseFilter]       = useState("Phase");
  const [priorityFilter,    setPriorityFilter]    = useState("Priority");
  const [contributorFilter, setContributorFilter] = useState("Contributor");
  const [labelFilter,       setLabelFilter]       = useState("Label");

  // Stage ordering state
  const [stageOrder, setStageOrder] = useState<string[]>([
    "Planning", "Design", "Development", "QA", "Deployment",
  ]);
  const [activeStageName, setActiveStageName] = useState<string | null>(null);
  const [activeTaskId,    setActiveTaskId]    = useState<string | null>(null);

  const stages = stageOrder.map((name) => ({
    name,
    color: STAGE_COLORS[name] ?? "bg-slate-400",
    count: tasks.filter((t) => t.stage === name).length,
  }));

  // Shared sensors for both DndContexts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Initialize tasks on component mount
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      useBoardTaskStore.setState({
        tasks: [
          {
            id: "task-1",
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
            id: "task-2",
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
            id: "task-3",
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
            id: "task-4",
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
            id: "task-5",
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
            id: "task-6",
            stage: "Planning",
            title: "Stakeholder Meetings",
            tags: ["Planning > Reviews"],
            startDate: "2025-10-05",
            endDate: "2025-10-12",
            assignee: "Alex Kim",
            priority: "high",
            comments: 1,
            attachments: 0,
            flagged: false,
          },
          {
            id: "task-7",
            stage: "Design",
            title: "UI Design System",
            tags: ["Design > System"],
            startDate: "2025-10-10",
            endDate: "2025-10-18",
            assignee: "John Doe",
            priority: "medium",
            comments: 5,
            attachments: 2,
            flagged: false,
          },
        ],
      });
    }
  }, [tasks]);

  const startDate = new Date("2025-10-05");
  const numberOfDays = 14;

  const timelineDays = Array.from({ length: numberOfDays }, (_, i) =>
    addDays(startDate, i)
  );

  // Pipeline drag handlers
  const handlePipelineDragStart = (e: DragStartEvent) => {
    setActiveStageName(e.active.id as string);
  };
  const handlePipelineDragEnd = (e: DragEndEvent) => {
    setActiveStageName(null);
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setStageOrder((prev) =>
      arrayMove(prev, prev.indexOf(active.id as string), prev.indexOf(over.id as string))
    );
  };

  // Task drag handlers
  const handleTaskDragStart = (e: DragStartEvent) => {
    setActiveTaskId(e.active.id as string);
  };
  const handleTaskDragEnd = (e: DragEndEvent) => {
    setActiveTaskId(null);
    const { active, over } = e;
    if (!over) return;
    const task = tasks.find((t) => t.id === active.id);
    if (!task || task.stage === over.id) return;
    updateTaskStage(task.id, over.id as string);
  };

  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const activeStage = activeStageName ? stages.find((s) => s.name === activeStageName) : null;

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 sticky top-0 z-20 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        {/* Title row */}
        <div className="flex items-center justify-between mb-2.5">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Product Launch Q4
          </h1>

          {/* View buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView("kanban")}
              className={`flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition hover:cursor-pointer ${
                activeView === "kanban"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-400"
                  : "text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Layout size={15} />
              Kanban
            </button>
            <button
              onClick={() => setActiveView("timeline")}
              className={`flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition hover:cursor-pointer ${
                activeView === "timeline"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-400"
                  : "text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Calendar size={15} />
              Timeline
            </button>
            <button
              onClick={() => setActiveView("matrix")}
              className={`flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition hover:cursor-pointer ${
                activeView === "matrix"
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-400"
                  : "text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Grid size={15} />
              Matrix
            </button>
          </div>
        </div>

        {/* Filters row — all inline, no wrapping */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 shrink-0 text-sm text-slate-500 dark:text-slate-400">
            <FilterIcon size={13} />
            <span className="font-medium">Filters:</span>
          </div>
          <SelectPopover
            value={phaseFilter}
            onChange={setPhaseFilter}
            options={[
              { value: "Phase",       label: "Phase" },
              { value: "Planning",    label: "Planning" },
              { value: "Design",      label: "Design" },
              { value: "Development", label: "Development" },
            ]}
            triggerClassName="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-sm px-2 py-1 text-slate-700 dark:text-slate-200 whitespace-nowrap"
            // dropdownClassName="min-w-[120px]"
          />
          <SelectPopover
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={[
              { value: "Priority", label: "Priority" },
              { value: "High",     label: "High" },
              { value: "Medium",   label: "Medium" },
              { value: "Low",      label: "Low" },
            ]}
            triggerClassName="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-sm px-2 py-1 text-slate-700 dark:text-slate-200 whitespace-nowrap"
            // dropdownClassName="min-w-[110px]"
          />
          <SelectPopover
            value={contributorFilter}
            onChange={setContributorFilter}
            options={[
              { value: "Contributor", label: "Contributor" },
              { value: "Sarah",       label: "Sarah" },
              { value: "Alex",        label: "Alex" },
              { value: "Maria",       label: "Maria" },
            ]}
            triggerClassName="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-sm px-2 py-1 text-slate-700 dark:text-slate-200 whitespace-nowrap"
            // dropdownClassName="min-w-[130px]"
          />
          <SelectPopover
            value={labelFilter}
            onChange={setLabelFilter}
            options={[
              { value: "Label",   label: "Label" },
              { value: "UI",      label: "UI" },
              { value: "Backend", label: "Backend" },
              { value: "QA",      label: "QA" },
            ]}
            triggerClassName="border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md text-sm px-2 py-1 text-slate-700 dark:text-slate-200 whitespace-nowrap"
            // dropdownClassName="min-w-[110px]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-200 dark:bg-slate-900 py-6 px-6">
        {/* kanban */}
        {activeView === "kanban" && (
          <div>
            {/* Task Flow Pipeline */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg w-fit mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Task Flow
                {permissions.canReorderTasks && (
                  <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
                    (drag to reorder)
                  </span>
                )}
              </h2>

              {permissions.canReorderTasks ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handlePipelineDragStart}
                  onDragEnd={handlePipelineDragEnd}
                  onDragCancel={() => setActiveStageName(null)}
                >
                  <SortableContext items={stageOrder} strategy={horizontalListSortingStrategy}>
                    <div className="flex items-center justify-center gap-4">
                      {stages.map((stage, index) => (
                        <SortablePipelineStage
                          key={stage.name}
                          name={stage.name}
                          color={stage.color}
                          count={stage.count}
                          isLast={index === stages.length - 1}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeStage && (
                      <div className="flex flex-col items-center opacity-90 scale-105">
                        <div
                          className={`w-12 h-12 rounded-full ${activeStage.color} text-white flex items-center justify-center font-semibold shadow-xl ring-2 ring-white dark:ring-slate-600`}
                        >
                          {activeStage.count}
                        </div>
                        <span className="text-xs mt-2 text-gray-600 dark:text-slate-300 font-medium">
                          {activeStage.name}
                        </span>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              ) : (
                // Static pipeline for viewers
                <div className="flex items-center justify-center gap-4">
                  {stages.map((stage, index) => (
                    <React.Fragment key={stage.name}>
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-12 h-12 rounded-full ${stage.color} text-white flex items-center justify-center font-semibold shadow-md`}
                        >
                          {stage.count}
                        </div>
                        <span className="text-xs mt-2 text-gray-600 dark:text-slate-300 font-medium">
                          {stage.name}
                        </span>
                      </div>
                      {index !== stages.length - 1 && (
                        <span className="text-gray-400 text-lg">→</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Kanban Columns */}
            {permissions.canReorderTasks ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleTaskDragStart}
                onDragEnd={handleTaskDragEnd}
                onDragCancel={() => setActiveTaskId(null)}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stages.map((stage) => {
                    const colTasks = tasks.filter((t) => t.stage === stage.name);
                    return (
                      <DroppableColumn
                        key={stage.name}
                        id={stage.name}
                        isEmpty={colTasks.length === 0}
                        header={
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                              {stage.name}{" "}
                              <span className="text-slate-400">({colTasks.length})</span>
                            </h3>
                            <button className="text-slate-400 text-lg font-bold hover:text-slate-700 dark:hover:text-slate-200 hover:cursor-pointer">
                              +
                            </button>
                          </div>
                        }
                      >
                        {colTasks.map((task) => (
                          <DraggableTaskCard
                            key={task.id}
                            task={task}
                            saveStates={saveStates}
                            permissions={permissions}
                            updateTaskTitle={updateTaskTitle}
                            updateTaskPriority={updateTaskPriority}
                            updateTaskDates={updateTaskDates}
                            updateTaskAssignee={updateTaskAssignee}
                          />
                        ))}
                      </DroppableColumn>
                    );
                  })}
                </div>

                <DragOverlay>
                  {activeTask && (
                    <DraggableTaskCard
                      task={activeTask}
                      saveStates={saveStates}
                      permissions={permissions}
                      updateTaskTitle={updateTaskTitle}
                      updateTaskPriority={updateTaskPriority}
                      updateTaskDates={updateTaskDates}
                      updateTaskAssignee={updateTaskAssignee}
                      isDraggingOverlay
                    />
                  )}
                </DragOverlay>
              </DndContext>
            ) : (
              // Static columns for viewers
              <div className="grid grid-cols-2 gap-4">
                {stages.map((stage) => {
                  const colTasks = tasks.filter((t) => t.stage === stage.name);
                  return (
                    <div
                      key={stage.name}
                      className="bg-white dark:bg-slate-800 h-fit rounded-lg p-4 w-full shadow-sm border border-slate-200 dark:border-slate-700"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {stage.name}{" "}
                          <span className="text-slate-400">({colTasks.length})</span>
                        </h3>
                      </div>
                      {colTasks.length > 0 ? (
                        colTasks.map((task) => (
                          <DraggableTaskCard
                            key={task.id}
                            task={task}
                            saveStates={saveStates}
                            permissions={permissions}
                            updateTaskTitle={updateTaskTitle}
                            updateTaskPriority={updateTaskPriority}
                            updateTaskDates={updateTaskDates}
                            updateTaskAssignee={updateTaskAssignee}
                          />
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">No tasks yet</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* timeline */}
        {activeView === "timeline" && (
          <div className="overflow-x-auto scrollbar-hide rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800">
            {/* Title bar */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                Timeline:{" "}
                <span className="font-normal text-slate-500 dark:text-slate-400">
                  {format(startDate, "MMM d")} – {format(addDays(startDate, numberOfDays - 1), "MMM d, yyyy")}
                </span>
              </h2>
            </div>

            {/* Calendar grid */}
            <div
              className="min-w-max"
              style={{ display: "grid", gridTemplateColumns: `180px repeat(${numberOfDays}, 56px)` }}
            >
              {/* ── Header row ── */}
              {/* Top-left corner */}
              <div className="sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 border-b border-r border-slate-200 dark:border-slate-700 px-3 py-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-end">
                Task
              </div>
              {timelineDays.map((day, idx) => {
                const isToday = isSameDay(day, new Date());
                return (
                  <div
                    key={idx}
                    className={`border-b border-r border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center py-2 text-[11px] font-medium ${
                      isToday
                        ? "bg-blue-50 dark:bg-blue-900/25 text-blue-600 dark:text-blue-300 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <span className="uppercase tracking-wide">{format(day, "EEE")}</span>
                    <span className="text-[10px] mt-0.5">{format(day, "MMM d")}</span>
                    {isToday && (
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 dark:bg-blue-400" />
                    )}
                  </div>
                );
              })}

              {/* ── Task rows ── */}
              {tasks.map((task, rowIdx) => {
                const taskStart = new Date(task.startDate);
                const taskEnd   = new Date(task.endDate);
                const barColStart = Math.max(0, differenceInCalendarDays(taskStart, startDate));
                const barColSpan  = Math.min(
                  differenceInCalendarDays(taskEnd, taskStart) + 1,
                  numberOfDays - barColStart
                );
                const isOdd = rowIdx % 2 === 1;

                const priorityDot: Record<string, string> = {
                  high:   "bg-pink-500",
                  medium: "bg-yellow-400",
                  low:    "bg-blue-400",
                };
                const stagePill: Record<string, string> = {
                  Planning:    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
                  Design:      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                  Development: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
                  QA:          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                  Deployment:  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
                };

                return (
                  <React.Fragment key={task.id}>
                    {/* Label cell */}
                    <div
                      className={`sticky left-0 z-10 h-14 flex flex-col justify-center gap-0.5 px-3 border-b border-r border-slate-200 dark:border-slate-700 ${
                        isOdd ? "bg-slate-50 dark:bg-slate-800/60" : "bg-white dark:bg-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`shrink-0 w-2 h-2 rounded-full ${priorityDot[task.priority] ?? "bg-slate-400"}`} />
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 pl-3.5">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {task.assignee}
                        </span>
                        <span className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${stagePill[task.stage] ?? "bg-slate-100 text-slate-600"}`}>
                          {task.stage}
                        </span>
                      </div>
                    </div>

                    {/* Day cells — render one per day, bar spans using gridColumn */}
                    {timelineDays.map((day, dayIdx) => {
                      const isToday     = isSameDay(day, new Date());
                      const isBarStart  = dayIdx === barColStart;
                      const inBar       = dayIdx >= barColStart && dayIdx < barColStart + barColSpan;

                      if (isBarStart) {
                        // Render the task bar spanning barColSpan columns
                        return (
                          <div
                            key={dayIdx}
                            style={{ gridColumn: `span ${barColSpan}` }}
                            className={`h-14 p-1.5 border-b border-r border-slate-200 dark:border-slate-700 ${
                              isToday ? "bg-blue-50/40 dark:bg-blue-900/10" : isOdd ? "bg-slate-50 dark:bg-slate-800/60" : "bg-white dark:bg-slate-800"
                            }`}
                          >
                            <TimelineShortTaskCard
                              title={task.title}
                              assignee={task.assignee}
                              priority={task.priority}
                            />
                          </div>
                        );
                      }

                      if (inBar) {
                        // Cells covered by the span — skip rendering (they're absorbed)
                        return null;
                      }

                      // Empty filler cell
                      return (
                        <div
                          key={dayIdx}
                          className={`h-14 border-b border-r border-slate-200 dark:border-slate-700 ${
                            isToday
                              ? "bg-blue-50/40 dark:bg-blue-900/10"
                              : isOdd
                                ? "bg-slate-50 dark:bg-slate-800/60"
                                : "bg-white dark:bg-slate-800"
                          }`}
                        />
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* matrix */}
        {activeView === "matrix" && <PriorityPhaseMatrix />}
      </div>
    </div>
  );
};

export default BoardTaskFlow;
