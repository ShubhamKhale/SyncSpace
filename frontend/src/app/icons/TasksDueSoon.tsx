import React from "react";

interface TasksDueSoonIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const TasksDueSoonIcon: React.FC<TasksDueSoonIconProps> = ({
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
        d="M0.799805 6.59961C0.799805 3.2859 3.4861 0.599609 6.7998 0.599609H30.7998C34.1135 0.599609 36.7998 3.2859 36.7998 6.59961V30.5996C36.7998 33.9133 34.1135 36.5996 30.7998 36.5996H6.79981C3.4861 36.5996 0.799805 33.9133 0.799805 30.5996V6.59961Z"
        fill="#FFF7ED"
      />
      <g clipPath="url(#clip0_302_474)">
        <path
          d="M18.8001 26.9333C23.4025 26.9333 27.1335 23.2023 27.1335 18.5999C27.1335 13.9976 23.4025 10.2666 18.8001 10.2666C14.1978 10.2666 10.4668 13.9976 10.4668 18.5999C10.4668 23.2023 14.1978 26.9333 18.8001 26.9333Z"
          stroke="#EA580C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.7998 13.5996V18.5996L22.1331 20.2663"
          stroke="#EA580C"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_302_474">
          <rect
            width="20"
            height="20"
            fill="white"
            transform="translate(8.7998 8.59961)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TasksDueSoonIcon;
