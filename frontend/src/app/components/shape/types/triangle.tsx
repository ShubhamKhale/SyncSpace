import { type ShapeProps } from '.';
import { generatePath } from './utils';

function Triangle({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;

  const trianglePath = generatePath([
    [0, h],
    [w / 2, 0],
    [w, h],
  ]);

  return <path d={trianglePath} {...svgAttributes} />;
}

export default Triangle;
