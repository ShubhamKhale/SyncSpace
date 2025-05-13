import React from "react";

interface NotificationsIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const NotificationsIcon: React.FC<NotificationsIconProps> = ({
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
      <path d="M5 6.66602C5 5.33993 5.52678 4.06816 6.46447 3.13048C7.40215 2.1928 8.67392 1.66602 10 1.66602C11.3261 1.66602 12.5979 2.1928 13.5355 3.13048C14.4732 4.06816 15 5.33993 15 6.66602C15 12.4993 17.5 14.166 17.5 14.166H2.5C2.5 14.166 5 12.4993 5 6.66602Z" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8.58301 17.5C8.72249 17.7537 8.92755 17.9653 9.17675 18.1127C9.42595 18.26 9.71016 18.3378 9.99967 18.3378C10.2892 18.3378 10.5734 18.26 10.8226 18.1127C11.0718 17.9653 11.2769 17.7537 11.4163 17.5" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default NotificationsIcon;
