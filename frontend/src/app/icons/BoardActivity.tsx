import React from "react";

interface BoardActivityIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const BoardActivityIcon: React.FC<BoardActivityIconProps> = ({
  width = 16,
  height = 16,
  className = "",
  fill = "#9CA3AF",
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
      <g clipPath="url(#clip0_377_122)">
        <path
          d="M14.6666 7.99967H13.0133C12.7219 7.99905 12.4384 8.09388 12.206 8.26965C11.9736 8.44543 11.8052 8.69247 11.7266 8.97301L10.1599 14.5463C10.1498 14.581 10.1288 14.6114 10.0999 14.633C10.0711 14.6546 10.036 14.6663 9.99992 14.6663C9.96386 14.6663 9.92877 14.6546 9.89992 14.633C9.87107 14.6114 9.85002 14.581 9.83992 14.5463L6.15992 1.45301C6.14982 1.41839 6.12877 1.38798 6.09992 1.36634C6.07107 1.3447 6.03598 1.33301 5.99992 1.33301C5.96386 1.33301 5.92877 1.3447 5.89992 1.36634C5.87107 1.38798 5.85002 1.41839 5.83992 1.45301L4.27325 7.02634C4.19489 7.30578 4.02751 7.55202 3.79649 7.72768C3.56548 7.90335 3.28346 7.99884 2.99325 7.99967H1.33325"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_377_122">
          <rect width="16" height="16" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default BoardActivityIcon;
