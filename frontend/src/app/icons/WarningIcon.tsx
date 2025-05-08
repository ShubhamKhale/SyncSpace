import React from "react";

interface WarningIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const WarningIcon: React.FC<WarningIconProps> = ({
  width = 50,
  height = 50,   
  className = "",
  fill = "#991B1B",
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
      <g clip-path="url(#clip0_14_2295)">
        <path
          d="M10.0003 18.3327C14.6027 18.3327 18.3337 14.6017 18.3337 9.99935C18.3337 5.39698 14.6027 1.66602 10.0003 1.66602C5.39795 1.66602 1.66699 5.39698 1.66699 9.99935C1.66699 14.6017 5.39795 18.3327 10.0003 18.3327Z"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 6.66602V9.99935"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M10 13.334H10.0083"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_14_2295">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default WarningIcon;  
