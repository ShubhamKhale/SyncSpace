import { type ShapeProps } from '.';

function RoundRect({ width = 80, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;

  const minSide = Math.min(w, h);
  const rounding = Number.isFinite(minSide) ? Math.min(12, 0.2 * minSide) : 0;
  return (
    <rect
      x={0}
      y={0}
      rx={rounding}
      width={w}
      height={h}
      {...svgAttributes}
    />
  );
}

export default RoundRect;
