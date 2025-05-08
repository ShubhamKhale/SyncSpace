import React from "react";

interface RoleBasedIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const RoleBasedIcon: React.FC<RoleBasedIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#2563EB",
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
      <path d="M20 13.5004C20 18.5004 16.5 21.0005 12.34 22.4505C12.1222 22.5243 11.8855 22.5207 11.67 22.4405C7.5 21.0005 4 18.5004 4 13.5004V6.50045C4 6.23523 4.10536 5.98088 4.29289 5.79334C4.48043 5.60581 4.73478 5.50045 5 5.50045C7 5.50045 9.5 4.30045 11.24 2.78045C11.4519 2.59945 11.7214 2.5 12 2.5C12.2786 2.5 12.5481 2.59945 12.76 2.78045C14.51 4.31045 17 5.50045 19 5.50045C19.2652 5.50045 19.5196 5.60581 19.7071 5.79334C19.8946 5.98088 20 6.23523 20 6.50045V13.5004Z" stroke={fill} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
};

export default RoleBasedIcon;
