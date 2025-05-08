import React from "react";

interface TrashIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const WarningIcon: React.FC<TrashIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill = "#B91C1C",
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
        d="M2 4H14"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M12.6663 4V13.3333C12.6663 14 11.9997 14.6667 11.333 14.6667H4.66634C3.99967 14.6667 3.33301 14 3.33301 13.3333V4"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M5.33301 3.99967V2.66634C5.33301 1.99967 5.99967 1.33301 6.66634 1.33301H9.33301C9.99967 1.33301 10.6663 1.99967 10.6663 2.66634V3.99967"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M6.66699 7.33301V11.333"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M9.33301 7.33301V11.333"
        stroke={fill}
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default WarningIcon;
