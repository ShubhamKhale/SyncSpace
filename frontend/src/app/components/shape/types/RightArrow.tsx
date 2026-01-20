import { type ShapeProps } from '.';

function RightArrow({ width = 50, height = 70, ...svgAttributes }: ShapeProps) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...svgAttributes}
    >
      <polygon
        points="
          10,20
          60,20
          60,5
          95,50
          60,95
          60,80
          10,80
        "
      />
    </svg>
  );
}

export default RightArrow;