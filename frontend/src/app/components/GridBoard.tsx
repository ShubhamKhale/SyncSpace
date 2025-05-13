import Image from "next/image";
import React from "react";
import HistoryIcon from "../icons/HistoryIcon";
import PresenceAwarenessIcon from "../icons/PresenceAwarenessIcon";

const GridBoard = () => {
  return (
    <div className="rounded-lg">
      <Image
        className="rounded-t-lg"
        src="/images/board-image.png"
        alt=""
        width={500}
        height={500}
      />
      <div className="pt-4 px-3">
        <p className="text-[var(--primary-text-color)] text-sm">
          Product Roadmap
        </p>
        <div className="flex items-center justify-between">
          <div>
            <HistoryIcon width={20} height={20} />
            <p className="ml-2 text-sm text-[var(--tertiary-text-color)]">
              2 hours ago
            </p>
          </div>
          <div>
            <PresenceAwarenessIcon width={20} height={20} />
            <p className="ml-2 text-sm text-[var(--tertiary-text-color)]">
              4
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridBoard;
