import React from "react";

interface PresenceAwarenessIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const PresenceAwarenessIcon: React.FC<PresenceAwarenessIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#2563EB",
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
        d="M16 21.5V19.5C16 18.4391 15.5786 17.4217 14.8284 16.6716C14.0783 15.9214 13.0609 15.5 12 15.5H6C4.93913 15.5 3.92172 15.9214 3.17157 16.6716C2.42143 17.4217 2 18.4391 2 19.5V21.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11.5C11.2091 11.5 13 9.70914 13 7.5C13 5.29086 11.2091 3.5 9 3.5C6.79086 3.5 5 5.29086 5 7.5C5 9.70914 6.79086 11.5 9 11.5Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M22 21.4999V19.4999C21.9993 18.6136 21.7044 17.7527 21.1614 17.0522C20.6184 16.3517 19.8581 15.8515 19 15.6299"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 3.62988C16.8604 3.85018 17.623 4.35058 18.1676 5.05219C18.7122 5.7538 19.0078 6.61671 19.0078 7.50488C19.0078 8.39305 18.7122 9.25596 18.1676 9.95757C17.623 10.6592 16.8604 11.1596 16 11.3799"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default PresenceAwarenessIcon;
