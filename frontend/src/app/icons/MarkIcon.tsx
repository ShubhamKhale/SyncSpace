import React from "react";

interface MarkIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const MarkIcon: React.FC<MarkIconProps> = ({
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
        d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
        fill="#DBEAFE"
      />
      <path
        d="M17.3332 8L9.99984 15.3333L6.6665 12"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MarkIcon;
