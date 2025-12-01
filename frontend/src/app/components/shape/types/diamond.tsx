import { type ShapeProps } from '.';
import { generatePath } from './utils';

function Diamond({ width = 50, height = 50, ...svgAttributes }: ShapeProps) {

  const w = Number(width) || 0;
  const h = Number(height) || 0;

  const diamondPath = generatePath([
    [0, h / 2],
    [w / 2, 0],
    [w, h / 2],
    [w / 2, h],
  ]);

  return <path d={diamondPath} {...svgAttributes} />;
}

export default Diamond;
