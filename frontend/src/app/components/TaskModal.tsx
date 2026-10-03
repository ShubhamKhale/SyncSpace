"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Link,
  Tag,
  User,
  ListChecks,
  X,
  Flag,
  Upload,
  Share2,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Check,
  LayoutGrid,
  Send,
  CalendarDays,
} from "lucide-react";
import CustomDatePicker from "./CustomDatePicker";
import { apiFetch } from "@/lib/api";
import { useBoardTaskStore } from "@/app/store/useBoardTaskStore";
import type { BoardMember, BoardTask, TaskPatch } from "@/app/store/useBoardTaskStore";
import { useEditMode } from "@/app/hooks/useEditMode";

/** Local checklist row. `key` is React-only; `id` is the server ID ("" until saved). */
interface Subtask {
  key: string;
  id: string;
  text: string;
  completed: boolean;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardName?: string;
  boardId?: string;
  /** When set, the modal edits this task instead of creating a new one. */
  task?: BoardTask | null;
}

const toLocalSubtasks = (task?: BoardTask | null): Subtask[] =>
  (task?.subtasks ?? []).map((s) => ({ key: s.id, id: s.id, text: s.text, completed: s.completed }));

const sameSubtasks = (a: Subtask[], b: Subtask[]) =>
  a.length === b.length &&
  a.every((s, i) => s.id === b[i].id && s.text === b[i].text && s.completed === b[i].completed);

const sameTags = (a: string[], b: string[]) =>
  a.length === b.length && a.every((t, i) => t === b[i]);

const tagOptions = ["Frontend", "Backend", "Design", "Testing", "Bug", "Feature"];

const STATUS_OPTIONS = [
  { value: "Planning",    color: "#8B5CF6" },
  { value: "Design",      color: "#3B82F6" },
  { value: "Development", color: "#F59E0B" },
  { value: "QA",          color: "#10B981" },
  { value: "Deployment",  color: "#14B8A6" },
];

const fieldLabel = (icon: React.ReactNode, text: string) => (
  <label className="flex items-center gap-1.5 text-[11px] font-semibold tracking-widest text-slate-500 uppercase mb-2">
    {icon}{text}
  </label>
);

// The modal body scrolls with a hidden scrollbar, so a dropdown opened near its
// bottom edge would render out of view with no visual hint — scroll it in on mount.
const scrollIntoViewOnMount = (el: HTMLElement | null) => el?.scrollIntoView({ block: "nearest", behavior: "smooth" });

const inputCls = "w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 focus:border-[#6366F1] transition";

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, boardName, boardId, task }) => {
  const isEdit = !!task;
  const { canEditTasks, canDeleteTasks } = useEditMode();
  const readOnly = isEdit && !canEditTasks;
  const [title, setTitle]                           = useState("");
  const [description, setDescription]               = useState("");
  const [priority, setPriority]                     = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus]                         = useState("Planning");
  const [showStatusDrop, setShowStatusDrop]         = useState(false);
  const [assigneeId, setAssigneeId]                 = useState("");
  const [members, setMembers]                       = useState<BoardMember[]>([]);
  const [membersLoading, setMembersLoading]         = useState(false);
  const [showAssigneeDrop, setShowAssigneeDrop]     = useState(false);
  const [startDate, setStartDate]                   = useState("");
  const [dueDate, setDueDate]                       = useState("");
  const [timeEstimate, setTimeEstimate]             = useState("");
  const [selectedTags, setSelectedTags]             = useState<string[]>([]);
  const [showTagDrop, setShowTagDrop]               = useState(false);
  const [referenceLink, setReferenceLink]           = useState("");
  const [flowDiagramLink, setFlowDiagramLink]       = useState("");
  const [subtasks, setSubtasks]                     = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText]         = useState("");
  const [submitting, setSubmitting]                 = useState(false);
  const [submitError, setSubmitError]               = useState("");
  const [confirmDelete, setConfirmDelete]           = useState(false);
  const [deleting, setDeleting]                     = useState(false);
  const { createTask, updateTask, deleteTask } = useBoardTaskStore();
  const storeMembers = useBoardTaskStore((s) => s.members);

  useEffect(() => {
    if (isOpen) {
      // Reset (create) or prefill (edit) on every open
      setTitle(task?.title ?? "");
      setDescription(task?.description ?? "");
      setPriority(task?.priority ?? "medium");
      setStatus(task?.stage ?? "Planning");
      setAssigneeId(task?.assigneeId ?? "");
      setStartDate(task?.startDate ?? "");
      setDueDate(task?.endDate ?? "");
      setTimeEstimate(task?.timeEstimate ?? "");
      setSelectedTags(task?.tags ?? []);
      setReferenceLink(task?.referenceLink ?? "");
      setFlowDiagramLink(task?.flowDiagramLink ?? "");
      setSubtasks(toLocalSubtasks(task));
      setNewSubtaskText("");
      setSubmitError("");
      setConfirmDelete(false);
      setShowStatusDrop(false);
      setShowAssigneeDrop(false);
      setShowTagDrop(false);
    }
    // Prefill only when the modal opens or switches task — not on every store
    // update of the same task, which would wipe in-progress edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, task?.id]);

  useEffect(() => {
    if (!isOpen || !boardId) return;
    // The board pages already load members into the store; only fetch if missing.
    if (storeMembers.length > 0) { setMembers(storeMembers); return; }
    setMembersLoading(true);
    apiFetch<BoardMember[]>(`/api/boards/${boardId}/members`)
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [isOpen, boardId, storeMembers]);

  const assigneeName = members.find(m => m.id === assigneeId)?.name ?? "";
  const subtasksPayload = subtasks.map(({ id, text, completed }) => ({ id, text, completed }));

  /** Only the fields that differ from the task being edited. */
  const buildPatch = (t: BoardTask): TaskPatch => {
    const patch: TaskPatch = {};
    if (title.trim() !== t.title) patch.title = title.trim();
    if (description.trim() !== t.description) patch.description = description.trim();
    if (priority !== t.priority) patch.priority = priority;
    if (status !== t.stage) patch.stage = status;
    if (assigneeId !== t.assigneeId) patch.assigneeId = assigneeId;
    if (startDate !== t.startDate) patch.startDate = startDate;
    if (dueDate !== t.endDate) patch.endDate = dueDate;
    if (timeEstimate !== t.timeEstimate) patch.timeEstimate = timeEstimate;
    if (!sameTags(selectedTags, t.tags)) patch.tags = selectedTags;
    if (referenceLink.trim() !== t.referenceLink) patch.referenceLink = referenceLink.trim();
    if (flowDiagramLink.trim() !== t.flowDiagramLink) patch.flowDiagramLink = flowDiagramLink.trim();
    if (!sameSubtasks(subtasks, toLocalSubtasks(t))) patch.subtasks = subtasksPayload;
    return patch;
  };

  const handleSubmit = async () => {
    if (readOnly) return;
    if (!title.trim()) { setSubmitError("Task title is required."); return; }
    if (startDate && dueDate && dueDate < startDate) { setSubmitError("Due date can't be before the start date."); return; }
    if (!isEdit && !boardId) { setSubmitError("Board ID missing."); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      if (task) {
        const patch = buildPatch(task);
        if (Object.keys(patch).length > 0) await updateTask(task.id, patch);
      } else {
        await createTask(boardId!, {
          title: title.trim(),
          stage: status,
          priority,
          description: description.trim() || undefined,
          assigneeId: assigneeId || undefined,
          startDate: startDate || undefined,
          endDate: dueDate || undefined,
          timeEstimate: timeEstimate || undefined,
          tags: selectedTags.length ? selectedTags : undefined,
          referenceLink: referenceLink.trim() || undefined,
          flowDiagramLink: flowDiagramLink.trim() || undefined,
          subtasks: subtasksPayload.length ? subtasksPayload : undefined,
        });
      }
      onClose();
    } catch (err) {
      setSubmitError((err as Error).message || (isEdit ? "Failed to save changes." : "Failed to create task."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task) return;
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    setSubmitError("");
    try {
      await deleteTask(task.id);
      onClose();
    } catch (err) {
      setSubmitError((err as Error).message || "Failed to delete task.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const statusColor = STATUS_OPTIONS.find(s => s.value === status)?.color ?? "#6366F1";

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks(p => [...p, { key: `new-${Date.now()}`, id: "", text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText("");
  };

  const closeDrop = () => {
    setShowStatusDrop(false);
    setShowAssigneeDrop(false);
    setShowTagDrop(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4" onClick={closeDrop}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.15 }}
        onClick={e => { e.stopPropagation(); closeDrop(); }}
        className="bg-[#F4F5FB] dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EEF2FF] flex items-center justify-center">
              <ListChecks size={15} className="text-[#6366F1]" />
            </div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
              {!isEdit ? "Create Task" : readOnly ? "Task Details" : "Edit Task"}
            </h2>
            {readOnly && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                View only
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[78vh] scrollbar-hide">
          {/* A disabled fieldset makes every input and button inside inert for viewers. */}
          <fieldset disabled={readOnly} className="contents">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr]">

            {/* LEFT */}
            <div className="px-6 py-6 space-y-4">
              {/* Title */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">Task title</h3>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Enter a clear and concise task title..."
                  className={inputCls}
                />
              </div>

              {/* Description */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
                {fieldLabel(<ListChecks size={11} />, "Description")}
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Write your task description here..."
                  rows={5}
                  className={`${inputCls} resize-none`}
                />
              </div>

              {/* Meta fields card */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
              {/* Priority */}
              <div>
                {fieldLabel(<Flag size={11} />, "Priority")}
                <div className="grid grid-cols-3 gap-2">
                  {(["low", "medium", "high"] as const).map((p) => {
                    const cfg: Record<string, { color: string; label: string }> = {
                      low:    { color: "#16A34A", label: "Low" },
                      medium: { color: "#D97706", label: "Medium" },
                      high:   { color: "#DC2626", label: "High" },
                    };
                    const active = priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(p)}
                        className={`rounded-lg border py-2 text-xs font-semibold transition ${active ? "border-current" : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300"}`}
                        style={active ? { color: cfg[p].color, background: cfg[p].color + "15", borderColor: cfg[p].color } : {}}
                      >
                        {cfg[p].label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 1: Status | Assignee | Task Duration */}
              <div className="grid grid-cols-3 gap-4">
                {/* Status */}
                <div className="relative">
                  {fieldLabel(<Flag size={11} />, "Status")}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setShowStatusDrop(p => !p); }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition"
                  >
                    <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: statusColor }} />
                    <span className="flex-1 text-left">{status}</span>
                    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showStatusDrop && (
                    <ul ref={scrollIntoViewOnMount} className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden">
                      {STATUS_OPTIONS.map(opt => (
                        <li key={opt.value}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          onClick={e => { e.stopPropagation(); setStatus(opt.value); setShowStatusDrop(false); }}
                        >
                          <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: opt.color }} />
                          <span className="text-slate-800 dark:text-slate-100">{opt.value}</span>
                          {status === opt.value && <Check size={14} className="ml-auto text-[#6366F1]" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Assignee */}
                <div className="relative">
                  {fieldLabel(<User size={11} />, "Assignee")}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setShowAssigneeDrop(p => !p); }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition"
                  >
                    <span className={`flex-1 text-left truncate ${assigneeName ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>{assigneeName || "Select Assignee"}</span>
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showAssigneeDrop && (
                    <ul ref={scrollIntoViewOnMount} className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      {membersLoading ? (
                        <li className="px-3 py-3 text-xs text-slate-400 text-center">Loading members…</li>
                      ) : members.length === 0 ? (
                        <li className="px-3 py-3 text-xs text-slate-400 text-center">No members found</li>
                      ) : [
                        <li key="unassigned"
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          onClick={e => { e.stopPropagation(); setAssigneeId(""); setShowAssigneeDrop(false); }}
                        >
                          <span className="flex-1">Unassigned</span>
                          {!assigneeId && <Check size={14} className="text-[#6366F1] flex-shrink-0" />}
                        </li>,
                        ...members.map(m => (
                        <li key={m.id}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          onClick={e => { e.stopPropagation(); setAssigneeId(m.id); setShowAssigneeDrop(false); }}
                        >
                          <div className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#6366F1] uppercase">{m.name[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                            <p className="text-xs text-slate-400 truncate">{m.email}</p>
                          </div>
                          {assigneeId === m.id && <Check size={14} className="text-[#6366F1] flex-shrink-0" />}
                        </li>
                      ))]}
                    </ul>
                  )}
                </div>

                {/* Task Duration */}
                <div>
                  {fieldLabel(<CalendarDays size={11} />, "Task Duration")}
                  <div className="flex flex-col gap-1.5">
                    <CustomDatePicker
                      value={startDate}
                      onChange={setStartDate}
                      placeholder="Start date"
                    />
                    <CustomDatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      placeholder="Due date"
                      minDate={startDate || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Time | Tags | Board Name */}
              <div className="grid grid-cols-3 gap-4">
                {/* Time */}
                <div>
                  {fieldLabel(<Clock size={11} />, "Time (hrs)")}
                  <input
                    type="number"
                    min="0"
                    value={timeEstimate}
                    onChange={e => setTimeEstimate(e.target.value)}
                    placeholder="e.g. 4"
                    className={inputCls}
                  />
                </div>

                {/* Tags */}
                <div className="relative">
                  {fieldLabel(<Tag size={11} />, "Tags")}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setShowTagDrop(p => !p); }}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2.5 text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition"
                  >
                    <span className={`flex-1 text-left truncate ${selectedTags.length ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>
                      {selectedTags.length ? selectedTags.join(", ") : "Select Tag"}
                    </span>
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showTagDrop && (
                    <ul ref={scrollIntoViewOnMount} className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-44 overflow-y-auto">
                      {tagOptions.map(tag => (
                        <li key={tag}
                          className="flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition text-slate-800 dark:text-slate-100"
                          onClick={e => { e.stopPropagation(); setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]); }}
                        >
                          {tag}
                          {selectedTags.includes(tag) && <Check size={14} className="text-[#6366F1]" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Board Name — fixed, read-only */}
                <div>
                  {fieldLabel(<LayoutGrid size={11} />, "Board Name")}
                  <div className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-700/50 px-3 py-2.5 text-sm text-slate-500 dark:text-slate-400 select-none cursor-default flex items-center gap-2">
                    <LayoutGrid size={13} className="text-[#6366F1] flex-shrink-0" />
                    <span className="truncate">{boardName || "—"}</span>
                  </div>
                </div>
              </div>
              </div>{/* end meta fields card */}
            </div>

            {/* RIGHT */}
            <div className="border-l border-slate-200 dark:border-slate-700 px-5 py-6 space-y-4">

              {/* Attach Files */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                {fieldLabel(<Upload size={11} />, "Attachments")}
                {/* File storage isn't wired up yet — say so rather than accepting files that would be dropped. */}
                <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 px-4 py-5 flex flex-col items-center justify-center gap-1 text-center">
                  <Upload size={18} className="text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">File uploads coming soon</p>
                  {isEdit && (task?.attachments ?? 0) > 0 && (
                    <p className="text-xs text-slate-400">{task!.attachments} existing attachment{task!.attachments !== 1 ? "s" : ""}</p>
                  )}
                </div>
              </div>

              {/* Flow Diagram Link */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                {fieldLabel(<Share2 size={11} />, "Flow Diagram Link")}
                <input
                  type="url"
                  value={flowDiagramLink}
                  onChange={e => setFlowDiagramLink(e.target.value)}
                  placeholder="Paste your SyncSpace flow link..."
                  className={inputCls}
                />
              </div>

              {/* Reference Task Link */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                {fieldLabel(<Link size={11} />, "Reference Task Link")}
                <input
                  type="url"
                  value={referenceLink}
                  onChange={e => setReferenceLink(e.target.value)}
                  placeholder="https://..."
                  className={inputCls}
                />
              </div>

              {/* Checklist */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
                {fieldLabel(<ListChecks size={11} />, "Checklist")}
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={e => setNewSubtaskText(e.target.value)}
                    placeholder="Add a subtask..."
                    className={inputCls}
                    onKeyDown={e => e.key === "Enter" && handleAddSubtask()}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="w-10 h-10 flex-shrink-0 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg flex items-center justify-center transition"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                {subtasks.length === 0 ? (
                  <p className="text-xs text-slate-400">No subtasks yet. Add one above.</p>
                ) : (
                  <ul className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
                    {subtasks.map(st => (
                      <li key={st.key} className="flex items-center gap-2">
                        <button type="button" onClick={() => setSubtasks(p => p.map(s => s.key === st.key ? { ...s, completed: !s.completed } : s))} className="shrink-0">
                          {st.completed
                            ? <CheckSquare size={16} className="text-[#6366F1]" />
                            : <Square size={16} className="text-slate-300" />}
                        </button>
                        <span className={`text-sm flex-1 ${st.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>{st.text}</span>
                        <button type="button" onClick={() => setSubtasks(p => p.filter(s => s.key !== st.key))} className="text-slate-300 hover:text-red-500 transition shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
          </fieldset>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {isEdit && !readOnly && canDeleteTasks && (
              <button
                type="button"
                onClick={handleDelete}
                onBlur={() => setConfirmDelete(false)}
                disabled={deleting || submitting}
                className={`px-4 py-2.5 text-sm font-semibold rounded-xl flex items-center gap-2 transition disabled:opacity-50 ${
                  confirmDelete
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                }`}
              >
                <Trash2 size={15} />
                {deleting ? "Deleting…" : confirmDelete ? "Click again to delete" : "Delete"}
              </button>
            )}
            {submitError && <p className="text-xs text-red-500 font-medium truncate">{submitError}</p>}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting || deleting}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
            >
              {readOnly ? "Close" : "Cancel"}
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || deleting}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {submitting ? (isEdit ? "Saving…" : "Creating…") : (isEdit ? "Save changes" : "Create Task")}
                {!submitting && (isEdit ? <Check size={15} /> : <Send size={15} />)}
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskModal;
