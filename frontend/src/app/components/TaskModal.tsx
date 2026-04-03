"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
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
} from "lucide-react";
import CreateTaskIcon from "../icons/TaskIcon";
import SelectPopover from "./SelectPopover";

interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const inputClass =
  "rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm text-[var(--primary-text-color)] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 w-full transition";

const labelClass =
  "block text-xs font-medium text-[var(--tertiary-text-color)] uppercase tracking-wide mb-1.5";

const tagOptions   = ["Frontend", "Backend", "Design", "Testing", "Bug", "Feature"];
const boardOptions = ["Product Roadmap", "UI Revamp", "Backend API", "Mobile App", "Design System"];

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle]                         = useState("");
  const [description, setDescription]             = useState("");
  const [status, setStatus]                       = useState("To Do");
  const [assignee, setAssignee]                   = useState("");
  const [selectedTags, setSelectedTags]           = useState<string[]>([]);
  const [selectedBoardNames, setSelectedBoardNames] = useState<string[]>([]);
  const [startDate, setStartDate]                 = useState("");
  const [dueDate, setDueDate]                     = useState("");
  const [timeEstimate, setTimeEstimate]           = useState("");
  const [referenceLink, setReferenceLink]         = useState("");
  const [flowDiagramLink, setFlowDiagramLink]     = useState("");
  const [attachedFiles, setAttachedFiles]         = useState<File[]>([]);
  const [checklistTitle, setChecklistTitle]       = useState("Checklist");
  const [subtasks, setSubtasks]                   = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText]       = useState("");
  const [showTagDropdown, setShowTagDropdown]     = useState(false);
  const [showBoardDropdown, setShowBoardDropdown] = useState(false);
  const fileInputRef                              = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleRemoveTag   = (tag: string)   => setSelectedTags(selectedTags.filter((t) => t !== tag));
  const handleRemoveBoard = (b: string)     => setSelectedBoardNames(selectedBoardNames.filter((x) => x !== b));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setAttachedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };
  const handleRemoveFile = (i: number) => setAttachedFiles(attachedFiles.filter((_, idx) => idx !== i));

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([...subtasks, { id: Date.now(), text: newSubtaskText.trim(), completed: false }]);
    setNewSubtaskText("");
  };
  const handleToggleSubtask = (id: number) =>
    setSubtasks((prev) => prev.map((st) => (st.id === id ? { ...st, completed: !st.completed } : st)));
  const handleRemoveSubtask = (id: number) => setSubtasks(subtasks.filter((st) => st.id !== id));
  const handleEditSubtask   = (id: number, text: string) =>
    setSubtasks((prev) => prev.map((st) => (st.id === id ? { ...st, text } : st)));

  const dateClass =
    "rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm text-[var(--primary-text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 w-1/2 transition hover:cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="bg-white dark:bg-slate-800 w-full max-w-7xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <ListChecks size={20} className="text-blue-600 dark:text-blue-400" />
            <h2 className="text-base font-semibold text-[var(--primary-text-color)]">
              Create Task
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition hover:cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[75vh] scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 md:gap-8">

            {/* LEFT COLUMN */}
            <div className="space-y-5">
              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Task title"
                className="w-full text-2xl font-semibold text-[var(--primary-text-color)] placeholder:text-slate-300 dark:placeholder:text-slate-600 bg-transparent border-none focus:outline-none"
              />

              {/* Description */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><ListChecks size={12} className="inline" /> Description</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write your task description here..."
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Meta Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status */}
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Flag size={12} className="inline" /> Status</span>
                  </label>
                  <SelectPopover
                    value={status}
                    onChange={setStatus}
                    options={[
                      { value: "To Do",       label: "To Do" },
                      { value: "In Progress", label: "In Progress" },
                      { value: "Review",      label: "Review" },
                      { value: "Done",        label: "Done" },
                    ]}
                    triggerClassName="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm text-[var(--primary-text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
                    dropdownClassName="min-w-full"
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><User size={12} className="inline" /> Assignee</span>
                  </label>
                  <SelectPopover
                    value={assignee}
                    onChange={setAssignee}
                    options={[
                      { value: "",        label: "Select Assignee" },
                      { value: "Shubham", label: "Shubham" },
                      { value: "Sahil",   label: "Sahil" },
                      { value: "Rohit",   label: "Rohit" },
                    ]}
                    triggerClassName="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm text-[var(--primary-text-color)] focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition"
                    dropdownClassName="min-w-full"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="inline" /> Task Duration</span>
                  </label>
                  <div className="flex gap-2">
                    <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={dateClass} />
                    <input type="date" value={dueDate}   onChange={(e) => setDueDate(e.target.value)}   className={dateClass} />
                  </div>
                </div>

                {/* Time */}
                <div>
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Clock size={12} className="inline" /> Time (hrs)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={timeEstimate}
                    onChange={(e) => setTimeEstimate(e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Tags */}
                <div className="relative">
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Tag size={12} className="inline" /> Tags</span>
                  </label>
                  <div
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm flex flex-wrap items-center gap-1.5 cursor-pointer min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500/40 transition"
                    onClick={() => setShowTagDropdown((p) => !p)}
                  >
                    {selectedTags.length === 0 ? (
                      <span className="text-slate-400">Select Tag</span>
                    ) : (
                      selectedTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {tag}
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 leading-none">×</button>
                        </span>
                      ))
                    )}
                  </div>
                  {showTagDropdown && (
                    <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-40 overflow-auto">
                      {tagOptions.map((tag) => (
                        <li
                          key={tag}
                          className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition ${
                            selectedTags.includes(tag) ? "text-blue-600 dark:text-blue-400 font-medium" : "text-[var(--primary-text-color)]"
                          }`}
                          onClick={() => {
                            if (!selectedTags.includes(tag)) setSelectedTags([...selectedTags, tag]);
                            setShowTagDropdown(false);
                          }}
                        >
                          {tag}
                          {selectedTags.includes(tag) && <Check size={14} className="text-blue-500" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Board Name */}
                <div className="relative">
                  <label className={labelClass}>
                    <span className="flex items-center gap-1.5"><Tag size={12} className="inline" /> Board Name</span>
                  </label>
                  <div
                    className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-2.5 text-sm flex flex-wrap items-center gap-1.5 cursor-pointer min-h-[42px] focus-within:ring-2 focus-within:ring-blue-500/40 transition"
                    onClick={() => setShowBoardDropdown((p) => !p)}
                  >
                    {selectedBoardNames.length === 0 ? (
                      <span className="text-slate-400">Select Boards</span>
                    ) : (
                      selectedBoardNames.map((board) => (
                        <span
                          key={board}
                          className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs rounded-full flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {board}
                          <button onClick={() => handleRemoveBoard(board)} className="hover:text-red-500 leading-none">×</button>
                        </span>
                      ))
                    )}
                  </div>
                  {showBoardDropdown && (
                    <ul className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl max-h-40 overflow-auto">
                      {boardOptions.map((board) => (
                        <li
                          key={board}
                          className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition ${
                            selectedBoardNames.includes(board) ? "text-blue-600 dark:text-blue-400 font-medium" : "text-[var(--primary-text-color)]"
                          }`}
                          onClick={() => {
                            if (!selectedBoardNames.includes(board)) setSelectedBoardNames([...selectedBoardNames, board]);
                            setShowBoardDropdown(false);
                          }}
                        >
                          {board}
                          {selectedBoardNames.includes(board) && <Check size={14} className="text-blue-500" />}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="flex flex-col gap-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-700 pt-4 lg:pt-0 lg:pl-6">

              {/* Attach Files */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><Upload size={12} className="inline" /> Attach Files</span>
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full rounded-xl border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/60 px-3 py-3 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-blue-400 flex items-center justify-center gap-2 transition hover:cursor-pointer"
                >
                  <Upload size={14} />
                  Click to attach files
                </button>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
                {attachedFiles.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {attachedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/60 px-3 py-2 text-sm"
                      >
                        <span className="truncate text-[var(--primary-text-color)]">{file.name}</span>
                        <button type="button" onClick={() => handleRemoveFile(index)} className="text-slate-400 hover:text-red-500 transition shrink-0 ml-2">
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Flow Diagram Link */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><Share2 size={12} className="inline" /> Flow Diagram Link</span>
                </label>
                <input
                  type="url"
                  value={flowDiagramLink}
                  onChange={(e) => setFlowDiagramLink(e.target.value)}
                  placeholder="Paste your SyncSpace flow link..."
                  className={inputClass}
                />
              </div>

              {/* Reference Link */}
              <div>
                <label className={labelClass}>
                  <span className="flex items-center gap-1.5"><Link size={12} className="inline" /> Reference Task Link</span>
                </label>
                <input
                  type="url"
                  value={referenceLink}
                  onChange={(e) => setReferenceLink(e.target.value)}
                  placeholder="https://..."
                  className={inputClass}
                />
              </div>

              {/* Checklist */}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <ListChecks size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <input
                    type="text"
                    value={checklistTitle}
                    onChange={(e) => setChecklistTitle(e.target.value)}
                    className="text-sm font-medium text-[var(--primary-text-color)] bg-transparent border-none focus:outline-none flex-1"
                  />
                </div>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newSubtaskText}
                    onChange={(e) => setNewSubtaskText(e.target.value)}
                    placeholder="Add a subtask..."
                    className={inputClass}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                  />
                  <button
                    onClick={handleAddSubtask}
                    className="bg-blue-600 text-white rounded-xl px-3 py-2 hover:bg-blue-700 transition hover:cursor-pointer shrink-0"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {subtasks.length === 0 ? (
                  <p className="text-[var(--tertiary-text-color)] text-xs">No subtasks yet. Add one above.</p>
                ) : (
                  <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                    {subtasks.map((subtask) => (
                      <li key={subtask.id} className="flex items-center gap-2">
                        <button onClick={() => handleToggleSubtask(subtask.id)} className="p-1 hover:cursor-pointer shrink-0">
                          {subtask.completed
                            ? <CheckSquare size={16} className="text-green-500" />
                            : <Square size={16} className="text-slate-400" />
                          }
                        </button>
                        <input
                          type="text"
                          value={subtask.text}
                          onChange={(e) => handleEditSubtask(subtask.id, e.target.value)}
                          className={`text-sm flex-1 bg-transparent border-none focus:outline-none hover:cursor-pointer ${
                            subtask.completed
                              ? "line-through text-slate-400 dark:text-slate-500"
                              : "text-[var(--primary-text-color)]"
                          }`}
                          disabled={subtask.completed}
                        />
                        <button onClick={() => handleRemoveSubtask(subtask.id)} className="text-slate-400 hover:text-red-500 rounded p-1 hover:cursor-pointer shrink-0">
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

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-[var(--primary-text-color)] hover:bg-slate-50 dark:hover:bg-slate-700 transition hover:cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium rounded-lg bg-[var(--primary-button-background-color)] text-white hover:opacity-90 transition hover:cursor-pointer flex items-center gap-2"
          >
            Create Task
            <CreateTaskIcon />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TaskModal;
