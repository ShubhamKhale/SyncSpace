import React from "react";

interface FigmaIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const FigmaIcon: React.FC<FigmaIconProps> = ({
  width = 48,
  height = 48,
  className = "",
  fill = "#6B7280",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      
    </svg>
  );
};

export default FigmaIcon;
