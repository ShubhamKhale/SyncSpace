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
  ExternalLink,
  FilterIcon,
  Grid,
  Layout,
  BookOpen,
  Pen,
  Code2,
  ShieldCheck,
  Rocket,
  GitBranch,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TimelineShortTaskCard from "./TimeLineShortTaskCard";
import { format, addDays, differenceInCalendarDays, isSameDay } from "date-fns";
import PriorityPhaseMatrix from "./PriorityPhaseMatrix";
import { useBoardTaskStore } from "@/app/store/useBoardTaskStore";
import type { BoardTask } from "@/app/store/useBoardTaskStore";
import { useBoardStore } from "@/app/store/useBoardStore";
import TaskModal from "./TaskModal";
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

const STAGE_BORDER: Record<string, string> = {
  Planning:    "border-l-purple-500",
  Design:      "border-l-blue-500",
  Development: "border-l-amber-400",
  QA:          "border-l-green-500",
  Deployment:  "border-l-teal-500",
};

const STAGE_TOP_BORDER: Record<string, string> = {
  Planning:    "border-t-purple-500",
  Design:      "border-t-blue-500",
  Development: "border-t-amber-400",
  QA:          "border-t-green-500",
  Deployment:  "border-t-teal-500",
};

const STAGE_EMPTY: Record<string, { Icon: LucideIcon; bg: string; icon: string }> = {
  Planning:    { Icon: BookOpen,    bg: "bg-purple-50 dark:bg-purple-900/20", icon: "text-purple-400" },
  Design:      { Icon: Pen,         bg: "bg-blue-50 dark:bg-blue-900/20",     icon: "text-blue-400"   },
  Development: { Icon: Code2,       bg: "bg-amber-50 dark:bg-amber-900/20",   icon: "text-amber-400"  },
  QA:          { Icon: ShieldCheck, bg: "bg-green-50 dark:bg-green-900/20",   icon: "text-green-400"  },
  Deployment:  { Icon: Rocket,      bg: "bg-teal-50 dark:bg-teal-900/20",     icon: "text-teal-400"   },
};

function StageEmptyState({ stageName }: { stageName: string }) {
  const empty = STAGE_EMPTY[stageName];
  if (!empty) return <p className="text-xs text-slate-400 italic py-4">No tasks yet</p>;
  const { Icon, bg, icon } = empty;
  return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bg}`}>
        <Icon size={22} className={icon} />
      </div>
      <p className="text-sm text-slate-400">No tasks yet</p>
      <p className="text-xs text-slate-300 dark:text-slate-500">Add tasks to get started</p>
    </div>
  );
}

const BoardTaskFlow: React.FC<{ boardId?: string }> = ({ boardId }) => {
  const { tasks, saveStates, updateTaskTitle, updateTaskPriority, updateTaskDates, updateTaskAssignee, updateTaskStage, fetchTasks } = useBoardTaskStore();
  const { board, fetchBoard } = useBoardStore();
  const permissions = useEditMode();
  const router = useRouter();
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
  // Snapshot (not an ID) so the modal keeps its task while an optimistic delete removes it from the store.
  const [openTask,        setOpenTask]        = useState<BoardTask | null>(null);

  const contributors = Array.from(new Set(tasks.map((t) => t.assignee).filter(Boolean)));

  const stages = stageOrder.map((name) => ({
    name,
    color: STAGE_COLORS[name] ?? "bg-slate-400",
    count: tasks.filter((t) => t.stage === name).length,
  }));

  // Shared sensors for both DndContexts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoard(boardId);
      fetchTasks(boardId);
    }
  }, [boardId, fetchBoard, fetchTasks]);

  // Build dynamic range from actual task dates
  const validDates = tasks
    .flatMap((t) => [t.startDate, t.endDate])
    .filter(Boolean)
    .map((s) => new Date(s!))
    .filter((d) => !isNaN(d.getTime()));

  const rangeMin = validDates.length > 0
    ? new Date(Math.min(...validDates.map((d) => d.getTime())))
    : addDays(new Date(), -3);
  const rangeMax = validDates.length > 0
    ? new Date(Math.max(...validDates.map((d) => d.getTime())))
    : addDays(new Date(), 14);

  const startDate = addDays(rangeMin, -2);
  const numberOfDays = Math.max(14, differenceInCalendarDays(rangeMax, startDate) + 3);

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
            {board?.title ?? "Untitled Board"}
          </h1>

          {/* View buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView("kanban")}
              className={`flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition hover:cursor-pointer ${
                activeView === "kanban"
                  ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-400"
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
                  ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-400"
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
                  ? "bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-400"
                  : "text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              <Grid size={15} />
              Matrix
            </button>

            {boardId && (
              <button
                onClick={() => router.push(`/dashboard/boards/${boardId}/flows`)}
                className="flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition hover:cursor-pointer text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <GitBranch size={15} />
                Flows
              </button>
            )}

            {boardId && (
              <>
                <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1" />
                <Link
                  href={`/dashboard/boards/${boardId}/tasks`}
                  className="flex items-center gap-1 sm:gap-1.5 border px-2 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition hover:cursor-pointer bg-indigo-500 text-white border-indigo-500 hover:bg-indigo-600 dark:hover:bg-indigo-600"
                >
                  <ExternalLink size={15} />
                  All Tasks
                </Link>
              </>
            )}
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
              ...contributors.map((name) => ({ value: name, label: name })),
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
          {(phaseFilter !== "Phase" || priorityFilter !== "Priority" || contributorFilter !== "Contributor" || labelFilter !== "Label") && (
            <button
              onClick={() => {
                setPhaseFilter("Phase");
                setPriorityFilter("Priority");
                setContributorFilter("Contributor");
                setLabelFilter("Label");
              }}
              className="ml-auto shrink-0 text-sm font-medium text-indigo-500 hover:text-indigo-600 hover:cursor-pointer whitespace-nowrap"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide bg-[#F8F9FC] dark:bg-slate-900 py-6 px-6">
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
                    <div className="flex items-center gap-3">
                      {stages.map((stage) => (
                        <SortablePipelineStage
                          key={stage.name}
                          name={stage.name}
                          topBorderClass={STAGE_TOP_BORDER[stage.name] ?? "border-t-slate-400"}
                          count={stage.count}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeStage && (
                      <div
                        className={`opacity-90 scale-105 bg-slate-50 dark:bg-slate-900/40 rounded-lg border-t-2 ${STAGE_TOP_BORDER[activeStage.name] ?? "border-t-slate-400"} px-4 py-3 min-w-[110px] shadow-xl`}
                      >
                        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{activeStage.count}</p>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">
                          {activeStage.name}
                        </p>
                      </div>
                    )}
                  </DragOverlay>
                </DndContext>
              ) : (
                // Static pipeline for viewers
                <div className="flex items-center gap-3">
                  {stages.map((stage) => (
                    <div
                      key={stage.name}
                      className={`bg-slate-50 dark:bg-slate-900/40 rounded-lg border-t-2 ${STAGE_TOP_BORDER[stage.name] ?? "border-t-slate-400"} px-4 py-3 min-w-[110px]`}
                    >
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stage.count}</p>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">
                        {stage.name}
                      </p>
                    </div>
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
                        borderClass={STAGE_BORDER[stage.name]}
                        emptyContent={<StageEmptyState stageName={stage.name} />}
                        header={
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                              {stage.name}{" "}
                              <span className="text-slate-400">({colTasks.length})</span>
                            </h3>
                            <button className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition">+</button>
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
                            onOpen={setOpenTask}
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
                      className={`bg-white dark:bg-slate-800 h-fit rounded-lg p-4 w-full shadow-sm border border-l-4 border-slate-200 dark:border-slate-700 ${STAGE_BORDER[stage.name] ?? "border-l-slate-300"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {stage.name}{" "}
                          <span className="text-slate-400">({colTasks.length})</span>
                        </h3>
                        <button className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition">+</button>
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
                            onOpen={setOpenTask}
                          />
                        ))
                      ) : (
                        <StageEmptyState stageName={stage.name} />
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
                const taskStart = task.startDate ? new Date(task.startDate) : null;
                const taskEnd   = task.endDate   ? new Date(task.endDate)   : null;
                const hasBar = taskStart && taskEnd &&
                  !isNaN(taskStart.getTime()) && !isNaN(taskEnd.getTime());
                const barColStart = hasBar
                  ? Math.max(0, differenceInCalendarDays(taskStart!, startDate))
                  : -1;
                const barColSpan = hasBar
                  ? Math.max(1, Math.min(
                      differenceInCalendarDays(taskEnd!, taskStart!) + 1,
                      numberOfDays - barColStart
                    ))
                  : 0;
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
                      const isBarStart  = hasBar && dayIdx === barColStart;
                      const inBar       = hasBar && dayIdx >= barColStart && dayIdx < barColStart + barColSpan;

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

      <TaskModal
        isOpen={!!openTask}
        onClose={() => setOpenTask(null)}
        boardName={board?.title}
        boardId={boardId}
        task={openTask}
      />
    </div>
  );
};

export default BoardTaskFlow;
