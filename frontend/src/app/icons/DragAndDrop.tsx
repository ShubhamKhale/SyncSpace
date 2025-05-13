import React from "react";

interface DragAndDropIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const DragAndDropIcon: React.FC<DragAndDropIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#2563EB",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5 9.5L2 12.5L5 15.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 5.5L12 2.5L15 5.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 19.5L12 22.5L9 19.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 9.5L22 12.5L19 15.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 12.5H22"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 2.5V22.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DragAndDropIcon;
