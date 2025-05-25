import React from "react";

interface TagIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const TagIcon: React.FC<TagIconProps> = ({
  width = 20,
  height = 20,
  className = "",
  fill = "#6B21A8",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 10 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_106_46)">
        <path
          d="M5.24384 1.07717C5.0876 0.920883 4.87567 0.833055 4.65467 0.833008H1.66634C1.44533 0.833008 1.23337 0.920805 1.07709 1.07709C0.920805 1.23337 0.833008 1.44533 0.833008 1.66634V4.65467C0.833055 4.87567 0.920883 5.0876 1.07717 5.24384L4.70384 8.87051C4.89322 9.05869 5.14936 9.16431 5.41634 9.16431C5.68332 9.16431 5.93946 9.05869 6.12884 8.87051L8.87051 6.12884C9.05869 5.93946 9.16431 5.68332 9.16431 5.41634C9.16431 5.14936 9.05869 4.89322 8.87051 4.70384L5.24384 1.07717Z"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.12533 3.33366C3.24038 3.33366 3.33366 3.24038 3.33366 3.12533C3.33366 3.01027 3.24038 2.91699 3.12533 2.91699C3.01027 2.91699 2.91699 3.01027 2.91699 3.12533C2.91699 3.24038 3.01027 3.33366 3.12533 3.33366Z"
          fill="black"
          stroke={fill}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_106_46">
          <rect width="10" height="10" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default TagIcon;
