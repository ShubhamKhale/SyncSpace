import React from "react";

interface PlusIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "none",
}) => {
  const viewbox = `0 0 ${width} ${height}`;
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={viewbox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.03613 8H13.3695"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.70312 3.33398V12.6673"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PlusIcon;
