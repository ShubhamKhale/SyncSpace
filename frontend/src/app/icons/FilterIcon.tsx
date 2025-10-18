import React from "react";

interface FilterIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const FilterIcon: React.FC<FilterIconProps> = ({
  width = 16,
  height = 17,
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
      <g clipPath="url(#clip0_377_195)">
        <path
          d="M6.66659 14.1331C6.66653 14.257 6.701 14.3785 6.76612 14.4839C6.83124 14.5893 6.92443 14.6744 7.03526 14.7298L8.36859 15.3965C8.47025 15.4473 8.58322 15.4712 8.69675 15.4661C8.81029 15.461 8.92062 15.4269 9.01728 15.3671C9.11393 15.3073 9.1937 15.2238 9.249 15.1245C9.30431 15.0252 9.33331 14.9135 9.33326 14.7998V10.1331C9.33341 9.80273 9.45623 9.48414 9.67792 9.23914L14.4933 3.91314C14.5796 3.81751 14.6363 3.69893 14.6567 3.57173C14.677 3.44453 14.66 3.31416 14.6079 3.19639C14.5557 3.07862 14.4705 2.97849 14.3626 2.90811C14.2547 2.83773 14.1287 2.80011 13.9999 2.7998H1.99992C1.87099 2.79985 1.74484 2.83728 1.63676 2.90756C1.52867 2.97784 1.44328 3.07796 1.39093 3.19578C1.33858 3.3136 1.32151 3.44408 1.34181 3.5714C1.3621 3.69872 1.41887 3.81743 1.50526 3.91314L6.32192 9.23914C6.54361 9.48414 6.66644 9.80273 6.66659 10.1331V14.1331Z"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_377_195">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 0.799805)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default FilterIcon;
