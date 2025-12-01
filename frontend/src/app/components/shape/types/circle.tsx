import { type ShapeProps } from ".";

function Circle({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

   const w = Number(width) || 0;
  const h = Number(height) || 0;
  
  return (
    <ellipse
      cx={w / 2}
      cy={h / 2}
      rx={w / 2}
      ry={h / 2}
      {...svgAttributes}
    />
  );
}

export default Circle;
