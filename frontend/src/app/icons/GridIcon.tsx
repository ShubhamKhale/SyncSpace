import React from "react";

interface GridIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const GridIcon: React.FC<GridIconProps> = ({
  width = 20,
  height = 20,
  className = "",
  fill = "#4B5563",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="2" y="2" width="6" height="6" stroke={fill} strokeWidth="1.5" />
      <rect x="12" y="2" width="6" height="6" stroke={fill} strokeWidth="1.5" />
      <rect x="2" y="12" width="6" height="6" stroke={fill} strokeWidth="1.5" />
      <rect x="12" y="12" width="6" height="6" stroke={fill} strokeWidth="1.5" />
    </svg>
  );
};

export default GridIcon;
