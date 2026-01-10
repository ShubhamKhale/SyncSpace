import React from "react";

interface PanIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
  bgColor?: string;
}

const PanIcon: React.FC<PanIconProps> = ({
  width = 24,
  height = 24,
  className = "",
  fill = "#A1A1AA",
  bgColor = "rgba(255,255,255,0.1)",
}) => {
  const viewBox = "0 0 26 26";

  return (
    <svg
      width={width}
      height={height}
      viewBox={viewBox}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect x="0" y="0" width="26" height="26" fill={bgColor} />

      {/* Hand */}
      <g transform="scale(0.9) translate(1.5 1.5)">
        <path
          d="M9.5 22c-.7 0-1.3-.25-1.8-.75l-4.4-6.4c-.2-.3-.3-.6-.3-1 0-.4.15-.75.45-1.05l.7-.7c.25-.25.55-.4.9-.45.35-.05.7.05 1 .25l2.1 1.45V4.5c0-.4.15-.75.45-1.05C8.85 3.15 9.2 3 9.6 3s.75.15 1.05.45c.3.3.45.65.45 1.05V12h1V6.5c0-.4.15-.75.45-1.05.3-.3.65-.45 1.05-.45s.75.15 1.05.45c.3.3.45.65.45 1.05V12h1V7.5c0-.4.15-.75.45-1.05.3-.3.65-.45 1.05-.45s.75.15 1.05.45c.3.3.45.65.45 1.05V15c0 1.9-.65 3.5-1.95 4.8C15.8 21.35 14.2 22 12.3 22H9.5z"
          fill={fill}
        />
      </g>
    </svg>
  );
};

export default PanIcon;
