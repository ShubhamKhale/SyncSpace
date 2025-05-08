import React from "react";

interface HistoryIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const HistoryIcon: React.FC<HistoryIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#6B7280",
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
      <g clip-path="url(#clip0_14_1810)">
        <path
          d="M10.0003 18.3327C14.6027 18.3327 18.3337 14.6017 18.3337 9.99935C18.3337 5.39698 14.6027 1.66602 10.0003 1.66602C5.39795 1.66602 1.66699 5.39698 1.66699 9.99935C1.66699 14.6017 5.39795 18.3327 10.0003 18.3327Z"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 5V10L13.3333 11.6667"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_14_1810">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default HistoryIcon;
