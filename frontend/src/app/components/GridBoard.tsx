import Image from "next/image";
import React from "react";
import HistoryIcon from "../icons/HistoryIcon";
import PresenceAwarenessIcon from "../icons/PresenceAwarenessIcon";
import { formatTimeAgo } from "@/utils/timeUtils";

interface GridBoardProps {
  imageSrc: string;
  title: string;
  lastUpdated: number;
  presenceCount: number;
}

const GridBoard: React.FC<GridBoardProps> = ({ imageSrc, title, lastUpdated, presenceCount }) => {
  return (
    <div className="rounded-lg shadow border-2 border-[var(--sidebar-border-color)] hover:cursor-pointer">
      <Image className="rounded-t-lg" src={imageSrc} alt={title}  width={500} height={500} />
      <div className="pt-4 pb-5 px-3">
        <p className="text-[var(--primary-text-color)] text-sm font-medium">{title}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center">
            <HistoryIcon width={20} height={20} />     
            <p className="ml-2 text-sm text-[var(--tertiary-text-color)]">{formatTimeAgo(lastUpdated)}</p>
          </div>
          <div className="inline-flex items-center">
            <PresenceAwarenessIcon width={20} height={20} fill="#6B7280" />
            <p className="ml-2 text-sm text-[var(--tertiary-text-color)]">{presenceCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridBoard;
