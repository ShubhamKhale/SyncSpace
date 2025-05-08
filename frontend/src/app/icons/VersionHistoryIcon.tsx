import React from "react";

interface VersionHistoryIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const VersionHistoryIcon: React.FC<VersionHistoryIconProps> = ({
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
      <path
        d="M3 12.5C3 14.28 3.52784 16.0201 4.51677 17.5001C5.50571 18.9802 6.91131 20.1337 8.55585 20.8149C10.2004 21.4961 12.01 21.6743 13.7558 21.3271C15.5016 20.9798 17.1053 20.1226 18.364 18.864C19.6226 17.6053 20.4798 16.0016 20.8271 14.2558C21.1743 12.51 20.9961 10.7004 20.3149 9.05585C19.6337 7.41131 18.4802 6.00571 17.0001 5.01677C15.5201 4.02784 13.78 3.5 12 3.5C9.48395 3.50947 7.06897 4.49122 5.26 6.24L3 8.5"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M3 3.5V8.5H8"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12 7.5V12.5L16 14.5"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default VersionHistoryIcon;
