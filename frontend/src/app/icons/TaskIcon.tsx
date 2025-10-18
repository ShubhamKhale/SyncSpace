import React from "react";

interface CreateTaskIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const CreateTaskIcon: React.FC<CreateTaskIconProps> = ({
  width = 16,
  height = 17,
  className = "",
  fill = "white",
}) => {
  const viewbox = "0 0 16 17";
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={viewbox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_111_2742)">
        <path
          d="M9.89041 14.4567C9.91573 14.5198 9.95977 14.5737 10.0166 14.6111C10.0734 14.6485 10.1403 14.6676 10.2083 14.6658C10.2763 14.6641 10.3421 14.6416 10.397 14.6013C10.4518 14.5611 10.493 14.5051 10.5151 14.4407L14.8484 1.77405C14.8697 1.71498 14.8738 1.65106 14.8601 1.58976C14.8465 1.52846 14.8156 1.47232 14.7712 1.4279C14.7268 1.38349 14.6707 1.35265 14.6094 1.33898C14.5481 1.32531 14.4841 1.32938 14.4251 1.35072L1.75841 5.68405C1.69407 5.70612 1.63802 5.74733 1.59779 5.80217C1.55755 5.857 1.53505 5.92283 1.53331 5.99083C1.53157 6.05882 1.55067 6.12571 1.58805 6.18254C1.62542 6.23936 1.67928 6.28339 1.74241 6.30872L7.02907 8.42872C7.1962 8.49563 7.34804 8.59569 7.47545 8.72287C7.60286 8.85005 7.70319 9.00172 7.77041 9.16872L9.89041 14.4567Z"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M14.7699 1.43066L7.47656 8.72333"
          stroke={fill}
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_111_2742">
          <rect
            width="16"
            height="16"
            fill={fill}
            transform="translate(0.200195 -0.000976562)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default CreateTaskIcon;
