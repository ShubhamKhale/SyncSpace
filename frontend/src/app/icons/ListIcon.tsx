import React from "react";

interface ListIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const ListIcon: React.FC<ListIconProps> = ({
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
      <circle cx="3" cy="5" r="1" fill={fill} />
      <rect x="6" y="4" width="11" height="2" rx="1" fill={fill} />

      <circle cx="3" cy="10" r="1" fill={fill} />
      <rect x="6" y="9" width="11" height="2" rx="1" fill={fill} />

      <circle cx="3" cy="15" r="1" fill={fill} />
      <rect x="6" y="14" width="11" height="2" rx="1" fill={fill} />
    </svg>
  );
};

export default ListIcon;
