import React from "react";

interface BoardIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const BoardIcon: React.FC<BoardIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#6B7280",
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
      <path d="M16.667 16.6667C17.109 16.6667 17.5329 16.4911 17.8455 16.1785C18.1581 15.866 18.3337 15.442 18.3337 15V6.66667C18.3337 6.22464 18.1581 5.80072 17.8455 5.48816C17.5329 5.17559 17.109 5 16.667 5H10.0837C9.80492 5.00273 9.52995 4.93551 9.28391 4.80448C9.03787 4.67346 8.82863 4.48281 8.67533 4.25L8.00033 3.25C7.84857 3.01956 7.64197 2.8304 7.39907 2.6995C7.15618 2.56859 6.88458 2.50005 6.60866 2.5H3.33366C2.89163 2.5 2.46771 2.67559 2.15515 2.98816C1.84259 3.30072 1.66699 3.72464 1.66699 4.16667V15C1.66699 15.442 1.84259 15.866 2.15515 16.1785C2.46771 16.4911 2.89163 16.6667 3.33366 16.6667H16.667Z" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default BoardIcon;
