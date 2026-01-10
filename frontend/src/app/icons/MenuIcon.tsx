import React from "react";

interface MenuIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const MenuIcon: React.FC<MenuIconProps> = ({
  width = 20,
  height = 24,
  className = "",
  fill = "none",
}) => {
  const viewbox = `0 0 ${width} ${height}`;
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={viewbox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.5 17V15.3333H17.5V17H2.5ZM2.5 12.8333V11.1667H17.5V12.8333H2.5ZM2.5 8.66667V7H17.5V8.66667H2.5Z" fill="#A1A1AA"/>

    </svg>
  );
};

export default MenuIcon;
