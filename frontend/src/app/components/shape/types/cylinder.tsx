import { type ShapeProps } from '.';

function Cylinder({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;

  const bend = h * 0.125;

  return (
    <path
      d={`M0,${bend}  L 0,${h - bend} A ${
        w / 2
      } ${bend} 0 1 0 ${w} ${h - bend} L ${w},${bend} A ${
        w / 2
      } ${bend} 0 1 1 0 ${bend} A ${
        w / 2
      } ${bend} 0 1 1 ${w} ${bend} A ${
        w / 2
      } ${bend} 0 1 1 0 ${bend} z`}
      {...svgAttributes}
    />
  );
}

export default Cylinder;
