import React from "react";

interface DescriptionIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const DescriptionIcon: React.FC<DescriptionIconProps> = ({
  width = 16,
  height = 16,    
  className = "",
  fill = "#6B7280",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.25 4.2998H1.75"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8.75 7.7998H1.75"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.91667 11.2998H1.75"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DescriptionIcon;
