import React from "react";
import { twMerge } from "tailwind-merge";

interface ExternalLinkIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const ExternalLinkIcon: React.FC<ExternalLinkIconProps> = ({
  width = 13,
  height = 13,
  className = "",
  fill = "#9CA3AF",
}) => {
  const viewbox = `0 0 ${width} ${height}`;
  return (
    <svg
      width={width}
      height={height}
      className={twMerge("inline-block", className)}
      viewBox={viewbox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_377_783)">
        <path
          d="M8.4126 1.7002H11.4126V4.7002"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.9126 7.2002L11.4126 1.7002"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9.9126 6.7002V9.7002C9.9126 9.96541 9.80724 10.2198 9.6197 10.4073C9.43217 10.5948 9.17781 10.7002 8.9126 10.7002H3.4126C3.14738 10.7002 2.89303 10.5948 2.70549 10.4073C2.51795 10.2198 2.4126 9.96541 2.4126 9.7002V4.2002C2.4126 3.93498 2.51795 3.68062 2.70549 3.49309C2.89303 3.30555 3.14738 3.2002 3.4126 3.2002H6.4126"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_377_783">
          <rect
            width="12"
            height="12"
            fill="white"
            transform="translate(0.912598 0.200195)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ExternalLinkIcon;
