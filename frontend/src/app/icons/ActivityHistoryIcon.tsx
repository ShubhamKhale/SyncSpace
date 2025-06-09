import React from "react";

interface ActivityHistoryIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const ActivityHistoryIcon: React.FC<ActivityHistoryIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "none",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 50 50"
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_dd_14_2500)">
        <path
          d="M8 28C8 16.9543 16.9543 8 28 8C39.0457 8 48 16.9543 48 28C48 39.0457 39.0457 48 28 48C16.9543 48 8 39.0457 8 28Z"
          fill="#DBEAFE"
        />
        <g clipPath="url(#clip0_14_2500)">
          <path
            d="M27.9998 36.3327C32.6022 36.3327 36.3332 32.6017 36.3332 27.9993C36.3332 23.397 32.6022 19.666 27.9998 19.666C23.3975 19.666 19.6665 23.397 19.6665 27.9993C19.6665 32.6017 23.3975 36.3327 27.9998 36.3327Z"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M28 23V28L31.3333 29.6667"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </g>
      <defs>
        <filter
          id="filter0_dd_14_2500"
          x="0"
          y="0"
          width="50"
          height="50"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_14_2500"
          />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="8"
            operator="dilate"
            in="SourceAlpha"
            result="effect2_dropShadow_14_2500"
          />
          <feOffset />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"
          />
          <feBlend
            mode="normal"
            in2="effect1_dropShadow_14_2500"
            result="effect2_dropShadow_14_2500"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect2_dropShadow_14_2500"
            result="shape"
          />
        </filter>
        <clipPath id="clip0_14_2500">
          <rect
            width="50"
            height="50"
            fill="white"
            transform="translate(18 18)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ActivityHistoryIcon;
