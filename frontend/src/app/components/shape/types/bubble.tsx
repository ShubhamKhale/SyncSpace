import { type ShapeProps } from '.';

function Bubble({ width = 80, height = 60, ...svgAttributes }: ShapeProps) {
  const w = Number(width) || 0;
  const h = Number(height) || 0;

  // Original SVG reference dimensions
  const viewBoxWidth = 256;
  const viewBoxHeight = 256;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      xmlns="http://www.w3.org/2000/svg"
      {...svgAttributes}
    >
      <path
        d="
          M215.949 53.629
          C234.289 71.201 245.576 94.964 246.286 120.442
          C246.557 143.473 239.113 165.386 223.999 183
          C202.084 208.507 171.922 221.239 139.949 225
          C134.354 225.32 128.763 225.32 123.168 225
          C116.379 225.017 109.613 224.526 102.949 223
          C97.613 222.747 95.207 224.933 91.949 228
          C78.645 241.027 59.469 247.331 40.949 247
          C45.661 231.645 53.949 219.371 53.949 209
          C53.949 205.566 51.865 203.933 48.949 202
          C22.555 183.65 4.061 155.247 0.367 120.754
          C-2.128 94.081 4.524 70.446 20.926 49.184
          C42.518 23.282 72.443 9.274 105.676 5.684
          C143.109 3.014 177.871 13.926 205.949 39
          Z
        "
      />
    </svg>
  );
}

export default Bubble;
