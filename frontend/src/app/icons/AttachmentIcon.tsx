import React from "react";

interface AttachmentIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const AttachmentIcon: React.FC<AttachmentIconProps> = ({
  width = 16,
  height = 16,
  className = "",
  fill = "#6B7280",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_109_2037)">
        <path
          d="M13.2824 6.44564L7.92156 11.8065C7.26481 12.4632 6.37408 12.8322 5.44531 12.8322C4.51653 12.8322 3.6258 12.4632 2.96906 11.8065C2.31231 11.1497 1.94336 10.259 1.94336 9.33022C1.94336 8.40145 2.31231 7.51072 2.96906 6.85397L7.96822 1.85481C8.40605 1.4162 9.00018 1.16949 9.61991 1.16895C10.2396 1.1684 10.8342 1.41406 11.2728 1.85189C11.7114 2.28972 11.9581 2.88385 11.9587 3.50358C11.9592 4.12331 11.7136 4.71787 11.2757 5.15647L6.26489 10.1556C6.04597 10.3746 5.74906 10.4975 5.43947 10.4975C5.12988 10.4975 4.83297 10.3746 4.61406 10.1556C4.39514 9.93673 4.27216 9.63981 4.27216 9.33022C4.27216 9.02063 4.39514 8.72372 4.61406 8.50481L9.56656 3.55814"
          stroke={fill}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>   
      <defs>
        <clipPath id="clip0_109_2037">
          <rect
            width="14"
            height="14"
            fill="white"
            transform="translate(0.775391)"
          />
        </clipPath>
      </defs>
    </svg>
  );
};

export default AttachmentIcon;
