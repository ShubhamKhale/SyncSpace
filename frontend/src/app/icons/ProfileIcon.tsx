import React from "react";

interface ProfileIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}

const ProfileIcon: React.FC<ProfileIconProps> = ({
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
      <path
        d="M15.8337 17.5V15.8333C15.8337 14.9493 15.4825 14.1014 14.8573 13.4763C14.2322 12.8512 13.3844 12.5 12.5003 12.5H7.50033C6.61627 12.5 5.76842 12.8512 5.1433 13.4763C4.51818 14.1014 4.16699 14.9493 4.16699 15.8333V17.5"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.0003 9.16667C11.8413 9.16667 13.3337 7.67428 13.3337 5.83333C13.3337 3.99238 11.8413 2.5 10.0003 2.5C8.15938 2.5 6.66699 3.99238 6.66699 5.83333C6.66699 7.67428 8.15938 9.16667 10.0003 9.16667Z"
        stroke={fill}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ProfileIcon;
