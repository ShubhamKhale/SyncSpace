import { type ShapeProps } from '.';
import { generatePath } from './utils';

function ArrowRectangle({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

   const w = Number(width) || 0;
  const h = Number(height) || 0;

  const skew = w * 0.1;

  const arrowRectanglePath = generatePath([
    [0, 0],
    [w - skew, 0],
    [w, h / 2],
    [w - skew, h],
    [0, h],
  ]);

  return <path d={arrowRectanglePath} {...svgAttributes} />;
}

export default ArrowRectangle;
