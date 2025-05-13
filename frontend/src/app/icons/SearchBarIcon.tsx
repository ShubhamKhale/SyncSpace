import React from "react";

interface SearchBarProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const SearchIcon: React.FC<SearchBarProps> = ({
  width = 16,
  height = 16,
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.88021 12.6667C10.8257 12.6667 13.2135 10.2789 13.2135 7.33333C13.2135 4.38781 10.8257 2 7.88021 2C4.93469 2 2.54688 4.38781 2.54688 7.33333C2.54688 10.2789 4.93469 12.6667 7.88021 12.6667Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5473 14.0005L11.6807 11.1338"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default SearchIcon;
