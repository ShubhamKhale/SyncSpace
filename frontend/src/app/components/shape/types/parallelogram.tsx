import { type ShapeProps } from '.';
import { generatePath } from './utils';

function Parallelogram({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;

  // this determines where to place the top-left and bottom-right points of the parallelogram
  const skew = w * 0.25;

  const parallelogramPath = generatePath([
    [0, h],
    [skew, 0],
    [w, 0],
    [w - skew, h],
  ]);

  return <path d={parallelogramPath} {...svgAttributes} />;
}

export default Parallelogram;
