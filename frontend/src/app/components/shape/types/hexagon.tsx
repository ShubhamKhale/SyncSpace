import { type ShapeProps } from '.';
import { generatePath } from './utils';

function Hexagon({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;

  const skew = w * 0.1;

  const hexagonPath = generatePath([
    [0, h / 2],
    [skew, 0],
    [w - skew, 0],
    [w, h / 2],
    [w - skew, h],
    [skew, h],
  ]);

  return <path d={hexagonPath} {...svgAttributes} />;
}

export default Hexagon;
