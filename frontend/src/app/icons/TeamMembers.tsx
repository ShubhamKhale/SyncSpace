import React from "react";

interface TeamMembersIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
}

const TeamMembersIcon: React.FC<TeamMembersIconProps> = ({
  width = 50,
  height = 50,
  className = "",
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
        d="M0.400391 6.59961C0.400391 3.2859 3.08668 0.599609 6.40039 0.599609H30.4004C33.7141 0.599609 36.4004 3.2859 36.4004 6.59961V30.5996C36.4004 33.9133 33.7141 36.5996 30.4004 36.5996H6.40039C3.08668 36.5996 0.400391 33.9133 0.400391 30.5996V6.59961Z"
        fill="#F0FDF4"
      />
      <path
        d="M21.7341 26.0996V24.4329C21.7341 23.5489 21.3829 22.701 20.7577 22.0759C20.1326 21.4508 19.2848 21.0996 18.4007 21.0996H13.4007C12.5167 21.0996 11.6688 21.4508 11.0437 22.0759C10.4186 22.701 10.0674 23.5489 10.0674 24.4329V26.0996"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.7334 11.2061C22.4482 11.3914 23.0812 11.8088 23.5331 12.3928C23.985 12.9768 24.2302 13.6943 24.2302 14.4327C24.2302 15.1711 23.985 15.8887 23.5331 16.4727C23.0812 17.0567 22.4482 17.4741 21.7334 17.6594"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.7334 26.0997V24.433C26.7328 23.6944 26.487 22.977 26.0345 22.3933C25.582 21.8096 24.9485 21.3926 24.2334 21.208"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.9007 17.7663C17.7417 17.7663 19.234 16.2739 19.234 14.4329C19.234 12.592 17.7417 11.0996 15.9007 11.0996C14.0598 11.0996 12.5674 12.592 12.5674 14.4329C12.5674 16.2739 14.0598 17.7663 15.9007 17.7663Z"
        stroke="#16A34A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default TeamMembersIcon;
