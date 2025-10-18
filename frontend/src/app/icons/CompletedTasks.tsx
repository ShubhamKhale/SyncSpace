import React from "react";

interface CompletedTasksIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const CompletedTasksIcon: React.FC<CompletedTasksIconProps> = ({
  width = 50,
  height = 50,
  className = "",
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
        d="M0.600586 6.59961C0.600586 3.2859 3.28688 0.599609 6.60059 0.599609H30.6006C33.9143 0.599609 36.6006 3.2859 36.6006 6.59961V30.5996C36.6006 33.9133 33.9143 36.5996 30.6006 36.5996H6.60059C3.28688 36.5996 0.600586 33.9133 0.600586 30.5996V6.59961Z"
        fill="#FAF5FF"
      />
      <path
        d="M26.7684 16.9332C27.149 18.8009 26.8778 20.7427 26 22.4347C25.1221 24.1266 23.6908 25.4666 21.9447 26.2309C20.1985 26.9953 18.2431 27.138 16.4045 26.6352C14.5659 26.1323 12.9552 25.0143 11.8411 23.4677C10.727 21.921 10.1768 20.0392 10.2823 18.136C10.3878 16.2328 11.1425 14.4233 12.4206 13.0092C13.6988 11.5951 15.4231 10.6619 17.306 10.3652C19.1889 10.0686 21.1166 10.4264 22.7676 11.379"
        stroke="#9333EA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.1006 17.766L18.6006 20.266L26.9339 11.9326"
        stroke="#9333EA"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default CompletedTasksIcon;
