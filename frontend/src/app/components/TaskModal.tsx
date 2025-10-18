"use client";
import React, { useState } from "react";
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
} from "lucide-react";
import CreateTaskIcon from "../icons/TaskIcon";

// Subtask interface
interface Subtask {
  id: number;
  text: string;
  completed: boolean;
}

// Checklist interface
// interface Checklist {
//   id: number;
//   title: string;
//   subtasks: Subtask[];
// }

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("To Do");
  const [assignee, setAssignee] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedBoardNames, setSelectedBoardNames] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [timeEstimate, setTimeEstimate] = useState("");
  const [referenceLink, setReferenceLink] = useState("");
  const [flowDiagramLink, setFlowDiagramLink] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // ✅ Single Checklist
  const [checklistTitle, setChecklistTitle] = useState("Checklist");
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState("");

  // Updated: multiple checklists
  // const [checklists, setChecklists] = useState<Checklist[]>([]);
  // const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [showBoardNamesDropdown, setShowBoardNamesDropdown] = useState(false);

  const tagOptions = [
    "Frontend",
    "Backend",
    "Design",
    "Testing",
    "Bug",
    "Feature",
  ];

  const boardOptions = [
    "Product Roadmap",
    "UI Revamp",
    "Backend API",
    "Mobile App",
    "Design System",
  ];

  if (!isOpen) return null;

  // const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const value = e.target.value;
  //   if (value && !selectedTags.includes(value)) {
  //     setSelectedTags([...selectedTags, value]);
  //   }
  // };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleRemoveBoard = (board: string) => {
    setSelectedBoardNames(selectedBoardNames?.filter((b) => b !== board));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...files]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    setSubtasks([
      ...subtasks,
      { id: Date.now(), text: newSubtaskText.trim(), completed: false },
    ]);
    setNewSubtaskText("");
  };

  const handleToggleSubtask = (id: number) => {
    setSubtasks((prev) =>
      prev.map((st) =>
        st.id === id ? { ...st, completed: !st.completed } : st
      )
    );
  };

  const handleRemoveSubtask = (id: number) => {
    setSubtasks(subtasks.filter((st) => st.id !== id));
  };

  const handleEditSubtask = (id: number, newText: string) => {
    setSubtasks((prev) =>
      prev.map((st) => (st.id === id ? { ...st, text: newText } : st))
    );
  };

  // --- Checklist Group Handlers ---
  // const handleAddChecklist = () => {
  //   const title = newChecklistTitle.trim();
  //   if (title) {
  //     setChecklists([
  //       ...checklists,
  //       {
  //         id: Date.now(),
  //         title,
  //         subtasks: [],
  //       },
  //     ]);
  //     setNewChecklistTitle("");
  //   }
  // };

  // const handleRemoveChecklist = (id: number) => {
  //   setChecklists(checklists.filter((cl) => cl.id !== id));
  // };

  // const handleAddSubtask = (checklistId: number, text: string) => {
  //   if (!text.trim()) return;
  //   setChecklists((checklists) =>
  //     checklists.map((cl) =>
  //       cl.id === checklistId
  //         ? {
  //             ...cl,
  //             subtasks: [
  //               ...cl.subtasks,
  //               { id: Date.now(), text: text.trim(), completed: false },
  //             ],
  //           }
  //         : cl
  //     )
  //   );
  // };

  // const handleToggleSubtask = (checklistId: number, subtaskId: number) => {
  //   setChecklists((checklists) =>
  //     checklists.map((cl) =>
  //       cl.id === checklistId
  //         ? {
  //             ...cl,
  //             subtasks: cl.subtasks.map((st) =>
  //               st.id === subtaskId ? { ...st, completed: !st.completed } : st
  //             ),
  //           }
  //         : cl
  //     )
  //   );
  // };

  // const handleRemoveSubtask = (checklistId: number, subtaskId: number) => {
  //   setChecklists((checklists) =>
  //     checklists.map((cl) =>
  //       cl.id === checklistId
  //         ? {
  //             ...cl,
  //             subtasks: cl.subtasks.filter((st) => st.id !== subtaskId),
  //           }
  //         : cl
  //     )
  //   );
  // };

  // const handleEditSubtask = (
  //   checklistId: number,
  //   subtaskId: number,
  //   newText: string
  // ) => {
  //   setChecklists((checklists) =>
  //     checklists.map((cl) =>
  //       cl.id === checklistId
  //         ? {
  //             ...cl,
  //             subtasks: cl.subtasks.map((st) =>
  //               st.id === subtaskId ? { ...st, text: newText } : st
  //             ),
  //           }
  //         : cl
  //     )
  //   );
  // };

  // const handleEditChecklistTitle = (id: number, newTitle: string) => {
  //   setChecklists((checklists) =>
  //     checklists.map((cl) => (cl.id === id ? { ...cl, title: newTitle } : cl))
  //   );
  // };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="bg-white w-[100vw] max-w-7xl rounded-2xl shadow-2xl p-8 relative"
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-blue-600" />
            Create Task
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:cursor-pointer hover:bg-gray-100 transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* LEFT COLUMN — Task Info */}
          <div className="space-y-6">
            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              className="w-full text-2xl font-semibold text-gray-800 placeholder-gray-400 border-none focus:outline-none"
            />

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <ListChecks className="w-4 h-4 text-blue-500" /> Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write your task description here..."
                className="w-full h-28 p-3 text-sm text-gray-700 bg-gray-50 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-400"
              ></textarea>
            </div>

            {/* Meta Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Status */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Flag className="w-4 h-4 text-blue-500" /> Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
                >
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Review</option>
                  <option>Done</option>
                </select>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-blue-500" /> Assignee
                </label>
                <select
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
                >
                  <option value="">Select Assignee</option>
                  <option value="Shubham">Shubham</option>
                  <option value="Sahil">Sahil</option>
                  <option value="Rohit">Rohit</option>
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" /> Task Duration
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
                  />
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-1/2 border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
                  />
                </div>
              </div>

              {/* Time */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-blue-500" /> Time (hrs)
                </label>
                <input
                  type="number"
                  min="0"
                  value={timeEstimate}
                  onChange={(e) => setTimeEstimate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
                />
              </div>

              {/* Tags */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-blue-500" /> Tags
                </label>

                <div
                  className="border border-gray-300 rounded-md p-2 text-sm flex flex-wrap items-center gap-2 cursor-pointer min-h-[42px] focus-within:ring-1 focus-within:ring-blue-400"
                  onClick={() => setShowTagDropdown((prev) => !prev)}
                >
                  {selectedTags.length === 0 ? (
                    <span className="text-gray-400">Select Tag</span>
                  ) : (
                    selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center"
                        onClick={(e) => e.stopPropagation()} // prevent dropdown toggle
                      >
                        {tag}
                        <button
                          className="ml-1 text-blue-500 hover:text-red-500"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown List */}
                {showTagDropdown && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-40 overflow-auto">
                    {tagOptions.map((tag) => (
                      <li
                        key={tag}
                        className={`p-2 text-sm cursor-pointer hover:bg-blue-100 ${
                          selectedTags.includes(tag)
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          if (!selectedTags.includes(tag)) {
                            setSelectedTags([...selectedTags, tag]);
                          }
                          setShowTagDropdown(false);
                        }}
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Board Name  */}
              <div className="relative">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-blue-500" /> Board Name
                </label>

                <div
                  className="border border-gray-300 rounded-md p-2 text-sm flex flex-wrap items-center gap-2 cursor-pointer min-h-[42px] focus-within:ring-1 focus-within:ring-blue-400 hover:cursor-pointer"
                  onClick={() => setShowBoardNamesDropdown((prev) => !prev)}
                >
                  {selectedBoardNames.length === 0 ? (
                    <span className="text-gray-400">Select Boards</span>
                  ) : (
                    selectedBoardNames.map((board) => (
                      <span
                        key={board}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center"
                        onClick={(e) => e.stopPropagation()} // prevent dropdown toggle
                      >
                        {board}
                        <button
                          className="ml-1 text-blue-500 hover:text-red-500"
                          onClick={() => handleRemoveBoard(board)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown List */}
                {showBoardNamesDropdown && (
                  <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-md max-h-40 overflow-auto">
                    {boardOptions.map((board) => (
                      <li
                        key={board}
                        className={`p-2 text-sm cursor-pointer hover:bg-blue-100 ${
                          selectedBoardNames.includes(board)
                            ? "text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                        onClick={() => {
                          if (!selectedBoardNames.includes(board)) {
                            setSelectedBoardNames([
                              ...selectedBoardNames,
                              board,
                            ]);
                          }
                          setShowBoardNamesDropdown(false);
                        }}
                      >
                        {board}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Attachments & Checklists */}
          <div className="flex flex-col border-l pl-6">
            {/* Attach Files */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" /> Attach Files
              </label>

              {/* File Input */}
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
              />

              {/* Uploaded Files List */}
              {attachedFiles.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {attachedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2 text-sm"
                    >
                      <span className="truncate text-gray-700">
                        {file.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Flow Diagram + Reference Links */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-500" /> Flow Diagram Link
              </label>
              <input
                type="url"
                value={flowDiagramLink}
                onChange={(e) => setFlowDiagramLink(e.target.value)}
                placeholder="Paste your SyncSpace flow link..."
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Link className="w-4 h-4 text-blue-500" /> Reference Task Link
              </label>
              <input
                type="url"
                value={referenceLink}
                onChange={(e) => setReferenceLink(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 hover:cursor-pointer"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-blue-600" />
                <input
                  type="text"
                  value={checklistTitle}
                  onChange={(e) => setChecklistTitle(e.target.value)}
                  className="font-medium text-gray-800 bg-transparent border-none focus:outline-none hover:cursor-pointer"
                />
              </div>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubtaskText}
                  onChange={(e) => setNewSubtaskText(e.target.value)}
                  placeholder="Add a subtask..."
                  className="border border-gray-300 rounded-md p-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
                />
                <button
                  onClick={handleAddSubtask}
                  className="bg-blue-600 text-white rounded-md px-3 py-2 hover:bg-blue-700 transition hover:cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {subtasks.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No subtasks yet. Add one above.
                </p>
              ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {subtasks.map((subtask) => (
                    <li key={subtask.id} className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSubtask(subtask.id)}
                        className="p-1 hover:cursor-pointer"
                      >
                        {subtask.completed ? (
                          <CheckSquare className="w-4 h-4 text-green-500" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <input
                        type="text"
                        value={subtask.text}
                        onChange={(e) =>
                          handleEditSubtask(subtask.id, e.target.value)
                        }
                        className={`border-none text-sm flex-1 bg-transparent hover:cursor-pointer focus:outline-none ${
                          subtask.completed
                            ? "line-through text-gray-400"
                            : "text-gray-700"
                        }`}
                        disabled={subtask.completed}
                      />
                      <button
                        onClick={() => handleRemoveSubtask(subtask.id)}
                        className="ml-2 text-red-500 rounded hover:bg-red-100 p-1 hover:cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        {/* Checklists */}
        {/* <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <ListChecks className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-800 text-base">
                  Checklists
                </span>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="New checklist title..."
                  className="border border-gray-300 rounded-md p-2 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
                  onKeyDown={(e) => e.key === "Enter" && handleAddChecklist()}
                />
                <button
                  onClick={handleAddChecklist}
                  className="bg-blue-600 text-white rounded-md px-3 py-2 flex items-center gap-1 hover:bg-blue-700 transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {checklists.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  No checklists yet. Add one above.
                </p>
              ) : (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {checklists.map((checklist) => (
                    <ChecklistGroup
                      key={checklist.id}
                      checklist={checklist}
                      onAddSubtask={handleAddSubtask}
                      onToggleSubtask={handleToggleSubtask}
                      onRemoveSubtask={handleRemoveSubtask}
                      onEditSubtask={handleEditSubtask}
                      onEditTitle={handleEditChecklistTitle}
                      onRemove={() => handleRemoveChecklist(checklist.id)}
                    />
                  ))}
                </div>
              )}
            </div> */}

        {/* Footer */}
        <div className="flex justify-end mt-8 space-x-3 border-t pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition hover:cursor-pointer"
          >
            Cancel
          </button>
          <button 
            className="px-4 py-2 flex items-center justify-center gap-x-4 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition hover:cursor-pointer"
            onClick={onClose}
          >
            Create Task
            <CreateTaskIcon />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// Reusable Checklist Group Component
// interface ChecklistGroupProps {
//   checklist: Checklist;
//   onAddSubtask: (checklistId: number, text: string) => void;
//   onToggleSubtask: (checklistId: number, subtaskId: number) => void;
//   onRemoveSubtask: (checklistId: number, subtaskId: number) => void;
//   onEditSubtask: (
//     checklistId: number,
//     subtaskId: number,
//     newText: string
//   ) => void;
//   onEditTitle: (id: number, newTitle: string) => void;
//   onRemove: () => void;
// }

// const ChecklistGroup: React.FC<ChecklistGroupProps> = ({
//   checklist,
//   onAddSubtask,
//   onToggleSubtask,
//   onRemoveSubtask,
//   onEditSubtask,
//   onEditTitle,
//   onRemove,
// }) => {
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [newSubtaskText, setNewSubtaskText] = useState("");

//   const handleAdd = () => {
//     if (newSubtaskText.trim()) {
//       onAddSubtask(checklist.id, newSubtaskText);
//       setNewSubtaskText("");
//     }
//   };

//   const completedCount = checklist.subtasks.filter((st) => st.completed).length;
//   const totalCount = checklist.subtasks.length;

//   return (
//     <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => setIsExpanded(!isExpanded)}
//             className="p-1 text-gray-500 hover:text-gray-700"
//           >
//             {isExpanded ? (
//               <ChevronDown className="w-4 h-4" />
//             ) : (
//               <ChevronUp className="w-4 h-4" />
//             )}
//           </button>
//           <input
//             type="text"
//             value={checklist.title}
//             onChange={(e) => onEditTitle(checklist.id, e.target.value)}
//             className="font-medium text-gray-800 bg-transparent border-none focus:outline-none"
//           />
//           <span className="text-xs text-gray-500">
//             ({completedCount}/{totalCount})
//           </span>
//         </div>
//         <button
//           onClick={onRemove}
//           className="text-red-500 hover:bg-red-100 p-1 rounded"
//         >
//           <Trash2 className="w-4 h-4" />
//         </button>
//       </div>

//       {isExpanded && (
//         <>
//           {/* Add Subtask */}
//           <div className="flex gap-2 mb-3">
//             <input
//               type="text"
//               value={newSubtaskText}
//               onChange={(e) => setNewSubtaskText(e.target.value)}
//               placeholder="Add a subtask..."
//               className="border border-gray-300 rounded-md p-2 text-sm w-full hover:cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-400"
//               onKeyDown={(e) => {
//                 if (e.key === "Enter") handleAdd();
//               }}
//             />
//             <button
//               onClick={handleAdd}
//               className="bg-blue-600 text-white rounded-md px-2 py-2 flex items-center gap-1 hover:cursor-pointer hover:bg-blue-700 transition text-sm"
//             >
//               <Plus className="w-3 h-3" />
//             </button>
//           </div>

//           {/* Subtasks List */}
//           <ul className="space-y-2">
//             {checklist.subtasks.map((subtask) => (
//               <li key={subtask.id} className="flex items-center gap-2">
//                 <button
//                   onClick={() => onToggleSubtask(checklist.id, subtask.id)}
//                   className="p-1 hover:cursor-pointer"
//                 >
//                   {subtask.completed ? (
//                     <CheckSquare className="w-4 h-4 text-green-500" />
//                   ) : (
//                     <Square className="w-4 h-4 text-gray-400" />
//                   )}
//                 </button>
//                 <input
//                   type="text"
//                   value={subtask.text}
//                   onChange={(e) =>
//                     onEditSubtask(checklist.id, subtask.id, e.target.value)
//                   }
//                   className={`border-none text-sm flex-1 bg-transparent hover:cursor-pointer focus:outline-none ${
//                     subtask.completed
//                       ? "line-through text-gray-400"
//                       : "text-gray-700"
//                   }`}
//                   disabled={subtask.completed}
//                 />
//                 <button
//                   className="ml-2 text-red-500 rounded hover:cursor-pointer hover:bg-red-100 p-1"
//                   onClick={() => onRemoveSubtask(checklist.id, subtask.id)}
//                 >
//                   <Trash2 className="w-3 h-3" />
//                 </button>
//               </li>
//             ))}
//           </ul>
//         </>
//       )}
//     </div>
//   );
// };

export default TaskModal;
