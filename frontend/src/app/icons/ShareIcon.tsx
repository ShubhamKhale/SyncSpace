import React from "react";

interface ShareIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const ShareIcon: React.FC<ShareIconProps> = ({
  width = 16,
  height = 20,
  className = "",
  fill = "#FFFFFF",
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
      <path
        d="M3.99984 16.667C3.63317 16.667 3.31928 16.5364 3.05817 16.2753C2.79706 16.0142 2.6665 15.7003 2.6665 15.3337V8.66699C2.6665 8.30033 2.79706 7.98644 3.05817 7.72532C3.31928 7.46421 3.63317 7.33366 3.99984 7.33366H5.99984V8.66699H3.99984V15.3337H11.9998V8.66699H9.99984V7.33366H11.9998C12.3665 7.33366 12.6804 7.46421 12.9415 7.72532C13.2026 7.98644 13.3332 8.30033 13.3332 8.66699V15.3337C13.3332 15.7003 13.2026 16.0142 12.9415 16.2753C12.6804 16.5364 12.3665 16.667 11.9998 16.667H3.99984ZM7.33317 12.667V5.21699L6.2665 6.28366L5.33317 5.33366L7.99984 2.66699L10.6665 5.33366L9.73317 6.28366L8.6665 5.21699V12.667H7.33317Z"
        fill={fill}
      />
    </svg>
  );
};

export default ShareIcon;
