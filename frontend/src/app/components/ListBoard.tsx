import Image from "next/image";
import React from "react";
import HistoryIcon from "../icons/HistoryIcon";
import PresenceAwarenessIcon from "../icons/PresenceAwarenessIcon";
import { formatTimeAgo } from "@/utils/timeUtils";

interface ListBoardProps {
  imageSrc: string;
  title: string;
  description: string;
  lastUpdated: number;
  presenceCount: number;
}

const ListBoard: React.FC<ListBoardProps> = ({
  imageSrc,
  title,
  description,
  lastUpdated,
  presenceCount,
}) => {
  return (
    <div className="flex items-center gap-4 rounded-lg border-2 border-[var(--sidebar-border-color)] dark:bg-slate-800 px-4 py-3 shadow hover:cursor-pointer">
      {/* Thumbnail */}
      <Image
        src={imageSrc}
        alt={title}
        width={500}
        height={500}
        className="w-16 h-12 object-cover rounded-md shrink-0"
      />

      {/* Title + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--primary-text-color)] truncate">
          {title}
        </p>
        <p className="text-xs text-[var(--tertiary-text-color)] line-clamp-1 mt-0.5">
          {description}
        </p>
      </div>

      {/* Meta: last updated + member count */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        <div className="inline-flex items-center gap-1.5">
          <HistoryIcon width={16} height={16} />
          <span className="text-xs text-[var(--tertiary-text-color)]">
            {formatTimeAgo(lastUpdated)}
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5">
          <PresenceAwarenessIcon width={16} height={16} fill="#6B7280" />
          <span className="text-xs text-[var(--tertiary-text-color)]">
            {presenceCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ListBoard;
