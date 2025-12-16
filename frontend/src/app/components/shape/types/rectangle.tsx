import { type ShapeProps } from ".";

function Rectangle({ width = 180, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;


  return <rect x={0} y={0} width={w} height={h} {...svgAttributes} />;
}

export default Rectangle;
