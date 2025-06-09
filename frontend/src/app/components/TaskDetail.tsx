import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useGlobalTaskStore } from "../store/globalTaskStore";
import React from "react";
import { priorityStyles, tagStyles } from "@/utils/taskStyles";
import CalendarIcon from "../icons/CalendarIcon";
import HistoryIcon from "../icons/HistoryIcon";
import TagIcon from "../icons/TagIcon";
import DescriptionIcon from "../icons/DescriptionIcon";
import { formatTimeAgo } from "@/utils/timeUtils";
import AttachmentIcon from "../icons/AttachmentIcon";

const TaskDetail = () => {
  const { selectedTask, setSelectedTask, selectedTaskListTitle } = useGlobalTaskStore();

  if (!selectedTask) return null;

  const tagStyle = tagStyles[selectedTask.tag] || {
    bg: "#F3E8FF",
    fill: "#6B21A8",
    text: "#6B21A8",
  };

  const { bg, text } = priorityStyles[selectedTask.priority];

  const dateObj = new Date(selectedTask.dueDate * 1000);
  const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString(
    "default",
    { month: "short" }
  )} ${dateObj.getFullYear()}`;

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-xl z-50 p-6 overflow-y-auto"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="inline-flex items-center space-x-3">
            <div className="p-2 w-5 h-5 rounded-full" style={{ backgroundColor: text }}></div>
            <p className="text-xl text-[var(--secondary-text-color)]">{selectedTaskListTitle}</p>
          </div>   
        </div>
        <button onClick={() => setSelectedTask(null)}>
          <X className="w-6 h-6 text-gray-500 hover:text-red-500 cursor-pointer" />
        </button>
      </div>
    
      <div className="mt-6 px-4 space-y-3 text-sm text-gray-600">
        <p className="text-2xl text-[var(--sixth-text-color)] font-semibold ">{selectedTask.title}</p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-3">
              <CalendarIcon width={20} height={20} />
              <p className="text-lg  text-[var(--tertiary-text-color)]">
                Due Date
              </p>
            </div>
            <p className="text-lg">{formattedDate}</p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-3">
              <HistoryIcon width={20} height={20} />
              <p className="text-lg text-[var(--tertiary-text-color)]">
                Priority
              </p>
            </div>
            <div
              className="px-4 py-2 w-fit flex items-center space-x-2 rounded-3xl"
              style={{ backgroundColor: bg }}
            >
              <p className="text-lg" style={{ color: text }}>
                {selectedTask.priority}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-3">
              <TagIcon width={20} height={20} fill="#6B7280" />
              <p className="text-lg text-[var(--tertiary-text-color)]">Tags</p>
            </div>
            <div
              className="px-4 py-2 w-fit flex items-center space-x-2 rounded-3xl"
              style={{ backgroundColor: tagStyle.bg }}
            >
              <p className="text-lg" style={{ color: tagStyle.text }}>
                {selectedTask.tag}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg text-[var(--tertiary-text-color)]">
              Assignee
            </p>
            <div className="inline-flex items-center space-x-3">
              <div className="bg-[#D1D5DB] text-[#4B5563] w-10 h-10 flex items-center justify-center rounded-full">
                {selectedTask.assigneeInitial}
              </div>
              <p className="text-lg">{selectedTask.assigneeName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <DescriptionIcon width={20} height={20} />
            <p className="text-lg  text-[var(--tertiary-text-color)]">
              Description
            </p>
          </div>
          <div className="text-lg  text-[var(--tertiary-text-color)]">
            Created {formatTimeAgo(selectedTask.startDate)}
          </div>
        </div>

        <textarea
          className="w-full p-6 mt-2 text-sm bg-[#f0f9ff] text-[var(--secondary-text-color)] rounded-lg"
          value={selectedTask.description}
          readOnly
        ></textarea>   

        <div className="mt-12 flex items-center justify-between">
          <div className="inline-flex items-center space-x-3">
            <AttachmentIcon width={20} height={20} />
            <p className="text-lg  text-[var(--tertiary-text-color)]">
              Attachments
            </p>      
          </div>
          <button className="px-4 py-2 text-lg rounded-lg hover:cursor-pointer border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white ">
            Delete Task   
          </button>      
        </div>
      </div>
    </motion.div>   
  );
};

export default TaskDetail;
