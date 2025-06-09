"use client";
import React from "react";
import CalendarIcon from "../icons/CalendarIcon";
import TagIcon from "../icons/TagIcon";
import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { priorityStyles, tagStyles } from "@/utils/taskStyles";

interface ShortTaskCardProps {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  priority: "Urgent" | "High" | "Normal" | "Low";
  tag: string;
  assigneeInitial: string;
  onOpenDetail?: () => void;
}

// const priorityStyles: Record<
//   "Urgent" | "High" | "Normal" | "Low",
//   { bg: string; text: string }
// > = {
//   Urgent: { bg: "#FEE2E2", text: "#B91C1C" },
//   High: { bg: "#FEF3C7", text: "#B45309" },
//   Normal: { bg: "#DBEAFE", text: "#1D4ED8" },
//   Low: { bg: "#DCFCE7", text: "#15803D" },
// };

// const tagStyles: Record<string, { bg: string; fill: string; text: string }> = {
//   "User Testing": { bg: "#E0F2FE", fill: "#0284C7", text: "#0284C7" },
//   "Market Analysis": { bg: "#FFEDD5", fill: "#EA580C", text: "#EA580C" },
//   "Feasibility Study": { bg: "#EDE9FE", fill: "#7C3AED", text: "#7C3AED" },
//   Benchmarking: { bg: "#F3E8FF", fill: "#6B21A8", text: "#6B21A8" },
//   Strategy: { bg: "#D1FAE5", fill: "#047857", text: "#047857" },
//   "UX Design": { bg: "#FEF9C3", fill: "#CA8A04", text: "#CA8A04" },
//   "UI Design": { bg: "#FFE4E6", fill: "#BE123C", text: "#BE123C" },
//   Prototyping: { bg: "#E0E7FF", fill: "#4338CA", text: "#4338CA" },
//   Wireframing: { bg: "#F0FDF4", fill: "#15803D", text: "#15803D" },
//   Branding: { bg: "#FFF7ED", fill: "#EA580C", text: "#EA580C" },
//   Frontend: { bg: "#F3E8FF", fill: "#7C3AED", text: "#7C3AED" },
//   Backend: { bg: "#ECFDF5", fill: "#047857", text: "#047857" },
//   API: { bg: "#FDF4FF", fill: "#A21CAF", text: "#A21CAF" },
//   "Bug Fix": { bg: "#FEF2F2", fill: "#DC2626", text: "#DC2626" },
//   "Code Review": { bg: "#EFF6FF", fill: "#2563EB", text: "#2563EB" },
//   Deployment: { bg: "#F0F9FF", fill: "#0EA5E9", text: "#0EA5E9" },
//   Database: { bg: "#FFFBEB", fill: "#D97706", text: "#D97706" },
//   "Team Sync": { bg: "#F3F4F6", fill: "#6B7280", text: "#6B7280" },
//   "Client Meeting": { bg: "#FFF1F2", fill: "#E11D48", text: "#E11D48" },
//   "Sprint Planning": { bg: "#F5F3FF", fill: "#8B5CF6", text: "#8B5CF6" },
//   Retrospective: { bg: "#FEE2E2", fill: "#991B1B", text: "#991B1B" },
//   "1:1 Meeting": { bg: "#DBEAFE", fill: "#1D4ED8", text: "#1D4ED8" },
//   Roadmap: { bg: "#ECFDF5", fill: "#10B981", text: "#10B981" },
//   Milestone: { bg: "#FEFCE8", fill: "#CA8A04", text: "#CA8A04" },
//   OKRs: { bg: "#F3F4F6", fill: "#374151", text: "#374151" },
//   Backlog: { bg: "#FFEDD5", fill: "#EA580C", text: "#EA580C" },
//   "Feature Request": { bg: "#E0F2FE", fill: "#0284C7", text: "#0284C7" },
//   "Unit Test": { bg: "#ECFDF5", fill: "#059669", text: "#059669" },
//   "Integration Test": { bg: "#F3E8FF", fill: "#6B21A8", text: "#6B21A8" },
//   QA: { bg: "#FFFBEB", fill: "#D97706", text: "#D97706" },
//   Regression: { bg: "#FEE2E2", fill: "#DC2626", text: "#DC2626" },
//   "Test Case": { bg: "#E0E7FF", fill: "#4338CA", text: "#4338CA" },
//   Monitoring: { bg: "#F0FDF4", fill: "#15803D", text: "#15803D" },
//   Support: { bg: "#E0F2FE", fill: "#0369A1", text: "#0369A1" },
//   Maintenance: { bg: "#FEF9C3", fill: "#CA8A04", text: "#CA8A04" },
//   DevOps: { bg: "#F0F9FF", fill: "#0EA5E9", text: "#0EA5E9" },
//   "CI/CD": { bg: "#FDF2F8", fill: "#BE185D", text: "#BE185D" },
// };

const ShortTaskCard: React.FC<ShortTaskCardProps> = ({
  id,
  title,
  description,
  dueDate,
  priority,
  tag,
  assigneeInitial,
  onOpenDetail,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: defaultAnimateLayoutChanges,
  });   

  const { bg, text } = priorityStyles[priority];

  const tagStyle = tagStyles[tag] || {
    bg: "#F3E8FF",
    fill: "#6B21A8",
    text: "#6B21A8",
  };

  const dateObj = new Date(dueDate * 1000);
  const formattedDate = `${dateObj.getDate()} ${dateObj.toLocaleString(
    "default",
    { month: "short" }
  )} ${dateObj.getFullYear()}`;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    opacity: isDragging ? 0.7 : 1,
    zIndex: isDragging ? 999 : "auto",
    border: isDragging ? "2px dashed #ccc" : "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-md bg-white px-4 py-4 pb-6 cursor-pointer"
      onClick={() => {
        if (!isDragging && onOpenDetail) {
          onOpenDetail();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium text-lg text-[var(--sixth-text-color)]">
            {title}
          </p>
          <p className="text-base text-[var(--sixth-text-color)] ">
            {description.length > 38
              ? `${description.slice(0, 38)}...`
              : description}
          </p>
        </div>   
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab p-1"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="text-gray-400" />
        </div>
      </div>

      <div className="mt-2 flex items-center">
        <CalendarIcon width={20} height={20} />
        <p className="ml-2 text-[var(--tertiary-text-color)]">
          {formattedDate}
        </p>
        <div
          className="ml-4 px-4 py-2 text-base rounded-3xl"
          style={{ backgroundColor: bg, color: text }}
        >
          {priority}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div
          className="px-4 py-2 inline-flex items-center space-x-2 rounded-3xl"
          style={{ backgroundColor: tagStyle.bg }}
        >
          <TagIcon width={16} height={16} fill={tagStyle.fill} />
          <p style={{ color: tagStyle.text }}>{tag}</p>
        </div>
        <div className="bg-[#D1D5DB] text-[#4B5563] w-10 h-10 flex items-center justify-center rounded-full">
          {assigneeInitial}
        </div>
      </div>
    </div>
  );
};

export default ShortTaskCard;
