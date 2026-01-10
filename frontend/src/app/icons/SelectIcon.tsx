import React from "react";

interface SelectIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
  bgColor?: string;
}

const SelectIcon: React.FC<SelectIconProps> = ({
  width = 24,
  height = 24,
  className = "",
  fill = "#A1A1AA",
  bgColor = "rgba(255,255,255,0.1)",
}) => {
  const viewBox = "0 0 26 26";

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect x="0" y="0" width="26" height="26" fill={bgColor} />

      {/* Arrow (centered) */}
      <g transform="translate(-2 -2)">
        <path
          d="M17.675 22.75L15.5375 17.4625L10.25 15.325V14.275L23.75 9.25L18.725 22.75H17.675ZM18.1625 19.975L21.2 11.8L13.025 14.8375L16.7 16.3L18.1625 19.975Z"
          fill={fill}
        />
      </g>
    </svg>
  );
};

export default SelectIcon;
