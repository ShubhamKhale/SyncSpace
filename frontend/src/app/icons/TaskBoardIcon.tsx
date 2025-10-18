import React from "react";

interface TaskBoardIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const TaskBoardIcon: React.FC<TaskBoardIconProps> = ({
  width = 50,
  height = 50,
  className = "",
}) => {
  const viewbox = `0 0 ${width} ${height}`;
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={viewbox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.200195 6.59961C0.200195 3.2859 2.88649 0.599609 6.2002 0.599609H30.2002C33.5139 0.599609 36.2002 3.2859 36.2002 6.59961V30.5996C36.2002 33.9133 33.5139 36.5996 30.2002 36.5996H6.2002C2.88649 36.5996 0.200195 33.9133 0.200195 30.5996V6.59961Z"
        fill="#EFF6FF"
      />
      <path
        d="M20.7005 10.2666H15.7005C15.2403 10.2666 14.8672 10.6397 14.8672 11.0999V12.7666C14.8672 13.2268 15.2403 13.5999 15.7005 13.5999H20.7005C21.1608 13.5999 21.5339 13.2268 21.5339 12.7666V11.0999C21.5339 10.6397 21.1608 10.2666 20.7005 10.2666Z"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.5332 11.9326H23.1999C23.6419 11.9326 24.0658 12.1082 24.3784 12.4208C24.6909 12.7333 24.8665 13.1573 24.8665 13.5993V25.266C24.8665 25.708 24.6909 26.1319 24.3784 26.4445C24.0658 26.757 23.6419 26.9326 23.1999 26.9326H13.1999C12.7578 26.9326 12.3339 26.757 12.0214 26.4445C11.7088 26.1319 11.5332 25.708 11.5332 25.266V13.5993C11.5332 13.1573 11.7088 12.7333 12.0214 12.4208C12.3339 12.1082 12.7578 11.9326 13.1999 11.9326H14.8665"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.2002 17.7666H21.5335"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18.2002 21.9326H21.5335"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.8672 17.7666H14.8755"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.8672 21.9326H14.8755"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TaskBoardIcon;
