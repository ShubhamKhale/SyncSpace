import React from "react";

interface GithubIconProps {
  width?: number | string;
  height?: number | string;
  className?: string;
  fill?: string;
}


const GithubIcon: React.FC<GithubIconProps> = ({
  width = 50,
  height = 50,
  className = "",
  fill="none"
}) => {
  const viewbox = `0 0 ${width} ${height}`;
  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={viewbox}
      fill={fill}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width={width}
        height={height}
        transform="translate(0.6875)"
        fill="url(#pattern0_14_1750)"
      />
      <defs>
        <pattern
          id="pattern0_14_1750"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_14_1750" transform="scale(0.0333333)" />
        </pattern>
        <image
          id="image0_14_1750"
          width="30"
          height="30"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABr0lEQVR4nO2Vu0oDQRSGPxVUFCwUJF4RL621F0RRsDOoqLWNhZdokdbKt1CJF7QSBEWCFoJPYGMVKy3shIgx3mKiEpiFZZiZnd0EscgPQ9jN+c+35zBnBkr6h2oHIsAFkADSYiXEuxWgrZjAFmATyAI/HisHHAEdhUIngRcLoLxSQDgodE1U4Bfqrn41SKW5AqBuuHXlrYr29gG9QMwDFBNxA1Lbm23AquRVUjeGgUagQvyOiPeOqiX/ts3IqHZvN/7UI/mzopNaRTQtHPQJHlLkWDYZzhWGY4LpVMoTNwXfKsD9AcFy1QlTcMpjY/lRreJQ0SqtANcRTA1SnldT8J0CPBEQPC3luTcFxxXgazGXflQD3Eh5zkyGqGacLm1PHzGvV4ocUZMpf59mNPA3YAeYBTolX/55DtgD3hXeDNDk9cUHLsM8cKL4gHHJMwp8GM7wfduLPykMj0A9cCgSPwHrGt+GBvpsU62jGde1uGDp6dJci1O2UEdLwDfwAIxZ7OxyBXSRgAqL9roTmuTEJINUKis/RlvAlwX4E9gFQhRRIXFtVmr+L/Mx6yXxZ/oFDl37po6ZopsAAAAASUVORK5CYII="
        />
      </defs>
    </svg>
  );
};

export default GithubIcon;
