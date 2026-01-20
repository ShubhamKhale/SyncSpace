import { type ShapeProps } from '.';

function SharpStar({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {
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
          50,5
          61,38
          95,38
          67,59
          78,92
          50,72
          22,92
          33,59
          5,38
          39,38
        "
      />
    </svg>
  );
}

export default SharpStar;
