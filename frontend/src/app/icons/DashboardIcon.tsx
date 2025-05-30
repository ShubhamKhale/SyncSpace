import React from "react";

interface DashboardIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const DashboardIcon: React.FC<DashboardIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#374151",
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
        d="M6.75 2.25H3C2.58579 2.25 2.25 2.58579 2.25 3V8.25C2.25 8.66421 2.58579 9 3 9H6.75C7.16421 9 7.5 8.66421 7.5 8.25V3C7.5 2.58579 7.16421 2.25 6.75 2.25Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 2.25H11.25C10.8358 2.25 10.5 2.58579 10.5 3V5.25C10.5 5.66421 10.8358 6 11.25 6H15C15.4142 6 15.75 5.66421 15.75 5.25V3C15.75 2.58579 15.4142 2.25 15 2.25Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 9H11.25C10.8358 9 10.5 9.33579 10.5 9.75V15C10.5 15.4142 10.8358 15.75 11.25 15.75H15C15.4142 15.75 15.75 15.4142 15.75 15V9.75C15.75 9.33579 15.4142 9 15 9Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.75 12H3C2.58579 12 2.25 12.3358 2.25 12.75V15C2.25 15.4142 2.58579 15.75 3 15.75H6.75C7.16421 15.75 7.5 15.4142 7.5 15V12.75C7.5 12.3358 7.16421 12 6.75 12Z"
        stroke={fill}
        strokeWidth="2"               
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default DashboardIcon;
