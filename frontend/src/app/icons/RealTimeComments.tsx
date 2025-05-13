import React from "react";

interface RealTimeCommentsIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const RealTimeCommentsIcon: React.FC<RealTimeCommentsIconProps> = ({
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
     <path d="M21 15.5C21 16.0304 20.7893 16.5391 20.4142 16.9142C20.0391 17.2893 19.5304 17.5 19 17.5H7L3 21.5V5.5C3 4.96957 3.21071 4.46086 3.58579 4.08579C3.96086 3.71071 4.46957 3.5 5 3.5H19C19.5304 3.5 20.0391 3.71071 20.4142 4.08579C20.7893 4.46086 21 4.96957 21 5.5V15.5Z" stroke={fill} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>

    </svg>
  );
};

export default RealTimeCommentsIcon;
