"use client";
import React, { useEffect, useRef, useState } from "react";
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

interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

interface BoardMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string | null;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardName?: string;
  boardId?: string;
}

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

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, boardName, boardId }) => {
  const [title, setTitle]                           = useState("");
  const [description, setDescription]               = useState("");
  const [priority, setPriority]                     = useState<"low" | "medium" | "high">("medium");
  const [status, setStatus]                         = useState("Planning");
  const [showStatusDrop, setShowStatusDrop]         = useState(false);
  const [assignee, setAssignee]                     = useState("");
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
  const [attachedFiles, setAttachedFiles]           = useState<File[]>([]);
  const [subtasks, setSubtasks]                     = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText]         = useState("");
  const [draggingOver, setDraggingOver]             = useState(false);
  const [submitting, setSubmitting]                 = useState(false);
  const [submitError, setSubmitError]               = useState("");
  const fileInputRef                                = useRef<HTMLInputElement>(null);
  const { createTask } = useBoardTaskStore();

  useEffect(() => {
    if (isOpen) {
      // Reset form on every open
      setTitle("");
      setDescription("");
      setStatus("Planning");
      setAssignee("");
      setStartDate("");
      setDueDate("");
      setTimeEstimate("");
      setSelectedTags([]);
      setReferenceLink("");
      setFlowDiagramLink("");
      setAttachedFiles([]);
      setSubtasks([]);
      setNewSubtaskText("");
      setSubmitError("");
      setShowStatusDrop(false);
      setShowAssigneeDrop(false);
      setShowTagDrop(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !boardId) return;
    setMembersLoading(true);
    apiFetch<BoardMember[]>(`/api/boards/${boardId}/members`)
      .then(data => setMembers(Array.isArray(data) ? data : []))
      .catch(() => setMembers([]))
      .finally(() => setMembersLoading(false));
  }, [isOpen, boardId]);

  const handleSubmit = async () => {
    if (!title.trim()) { setSubmitError("Task title is required."); return; }
    if (!boardId) { setSubmitError("Board ID missing."); return; }
    setSubmitError("");
    setSubmitting(true);
    try {
      await createTask(boardId, {
        title: title.trim(),
        stage: status,
        priority,
        description: description.trim() || undefined,
        assignee: assignee || undefined,
        startDate: startDate || undefined,
        endDate: dueDate || undefined,
        timeEstimate: timeEstimate ? Number(timeEstimate) : undefined,
        tags: selectedTags.length ? selectedTags : undefined,
      });
      onClose();
    } catch (err) {
      setSubmitError((err as Error).message ?? "Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const statusColor = STATUS_OPTIONS.find(s => s.value === status)?.color ?? "#6366F1";

  const handleFileUpload = (files: FileList | null) => {
    if (files) setAttachedFiles(p => [...p, ...Array.from(files)]);
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks(p => [...p, { id: Date.now(), text: newSubtaskText.trim(), completed: false }]);
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
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">Create Task</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto max-h-[78vh] scrollbar-hide">
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
                    <span className={`flex-1 text-left ${assignee ? "text-slate-800 dark:text-slate-100" : "text-slate-400"}`}>{assignee || "Select Assignee"}</span>
                    <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showAssigneeDrop && (
                    <ul ref={scrollIntoViewOnMount} className="absolute z-20 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                      {membersLoading ? (
                        <li className="px-3 py-3 text-xs text-slate-400 text-center">Loading members…</li>
                      ) : members.length === 0 ? (
                        <li className="px-3 py-3 text-xs text-slate-400 text-center">No members found</li>
                      ) : members.map(m => (
                        <li key={m.id}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                          onClick={e => { e.stopPropagation(); setAssignee(m.name); setShowAssigneeDrop(false); }}
                        >
                          <div className="w-6 h-6 rounded-full bg-[#EEF2FF] flex items-center justify-center flex-shrink-0">
                            <span className="text-[10px] font-bold text-[#6366F1] uppercase">{m.name[0]}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-800 dark:text-slate-100 truncate">{m.name}</p>
                            <p className="text-xs text-slate-400 truncate">{m.email}</p>
                          </div>
                          {assignee === m.name && <Check size={14} className="text-[#6366F1] flex-shrink-0" />}
                        </li>
                      ))}
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
                {fieldLabel(<Upload size={11} />, "Attach Files")}
                <div
                  onDragOver={e => { e.preventDefault(); setDraggingOver(true); }}
                  onDragLeave={() => setDraggingOver(false)}
                  onDrop={e => { e.preventDefault(); setDraggingOver(false); handleFileUpload(e.dataTransfer.files); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`rounded-xl border-2 border-dashed px-4 py-6 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition ${
                    draggingOver
                      ? "border-[#6366F1] bg-[#EEF2FF]"
                      : "border-[#6366F1]/30 hover:border-[#6366F1]/60 hover:bg-[#EEF2FF]/50"
                  }`}
                >
                  <Upload size={20} className="text-[#6366F1]" />
                  <p className="text-sm font-semibold text-[#6366F1]">Click to attach files</p>
                  <p className="text-xs text-slate-400">or drag and drop here</p>
                </div>
                <input ref={fileInputRef} type="file" multiple onChange={e => handleFileUpload(e.target.files)} className="hidden" />
                {attachedFiles.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {attachedFiles.map((file, i) => (
                      <li key={i} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs">
                        <span className="truncate text-slate-700 dark:text-slate-200">{file.name}</span>
                        <button onClick={() => setAttachedFiles(p => p.filter((_, idx) => idx !== i))} className="text-slate-400 hover:text-red-500 transition ml-2 shrink-0">
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
                      <li key={st.id} className="flex items-center gap-2">
                        <button onClick={() => setSubtasks(p => p.map(s => s.id === st.id ? { ...s, completed: !s.completed } : s))} className="shrink-0">
                          {st.completed
                            ? <CheckSquare size={16} className="text-[#6366F1]" />
                            : <Square size={16} className="text-slate-300" />}
                        </button>
                        <span className={`text-sm flex-1 ${st.completed ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>{st.text}</span>
                        <button onClick={() => setSubtasks(p => p.filter(s => s.id !== st.id))} className="text-slate-300 hover:text-red-500 transition shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between gap-3">
          {submitError ? (
            <p className="text-xs text-red-500 font-medium">{submitError}</p>
          ) : <span />}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Creating…" : "Create Task"}
              {!submitting && <Send size={15} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskModal;
