import React from "react";

interface SystemWarningIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const SystemWarningIcon: React.FC<SystemWarningIconProps> = ({
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
      <g clipPath="url(#clip0_377_98)">
        <path
          d="M14.6863 12.2007L9.35299 2.86734C9.2367 2.66214 9.06806 2.49146 8.86428 2.37272C8.66049 2.25397 8.42885 2.19141 8.19299 2.19141C7.95713 2.19141 7.7255 2.25397 7.52171 2.37272C7.31792 2.49146 7.14928 2.66214 7.03299 2.86734L1.69966 12.2007C1.58211 12.4042 1.52048 12.6353 1.521 12.8703C1.52152 13.1054 1.58418 13.3362 1.70262 13.5392C1.82107 13.7423 1.99109 13.9104 2.19546 14.0266C2.39982 14.1427 2.63126 14.2028 2.86633 14.2007H13.533C13.7669 14.2004 13.9967 14.1386 14.1992 14.0215C14.4017 13.9044 14.5698 13.7361 14.6867 13.5334C14.8035 13.3308 14.865 13.1009 14.865 12.867C14.8649 12.6331 14.8033 12.4033 14.6863 12.2007Z"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.19971 6.2002V8.86686"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.19971 11.5332H8.20637"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_377_98">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0.199707 0.200195)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default SystemWarningIcon;
