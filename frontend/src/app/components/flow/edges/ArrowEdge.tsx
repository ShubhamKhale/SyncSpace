// import { memo } from "react";
// import { BaseEdge, EdgeProps, getStraightPath } from "@xyflow/react";

// const ArrowEdge = ({
//   id,
//   sourceX,
//   sourceY,
//   targetX,
//   targetY,
//   style,
// }: EdgeProps) => {
//   // getStraightPath returns:
//   // [path, labelX, labelY, offsetX, offsetY]
//   const [edgePath] = getStraightPath({
//     sourceX,
//     sourceY,
//     targetX,
//     targetY,
//   });

//   return (
//     <>
//       {/* Use BaseEdge to draw the main line */}
//       <BaseEdge
//         id={id}
//         path={edgePath}
//         style={style}
//         markerEnd={`url(#${id}-arrowhead)`} // reference marker
//       />

//       {/* Define the marker once per edge */}
//       <svg width="0" height="0">
//         <defs>
//           <marker
//             id={`${id}-arrowhead`}
//             viewBox="0 0 10 10"
//             refX="10"
//             refY="5"
//             markerUnits="strokeWidth"
//             markerWidth="8"
//             markerHeight="8"
//             orient="auto-start-reverse"
//           >
//             <path d="M 0 0 L 10 5 L 0 10 z" fill={style?.stroke || "#fff"} />
//           </marker>
//         </defs>
//       </svg>
//     </>
//   );
// };

// export default memo(ArrowEdge);

import { memo } from "react";
import { BaseEdge, EdgeProps, getStraightPath } from "@xyflow/react";

const ArrowEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
}: EdgeProps) => {
  // getStraightPath returns [path, labelX, labelY, offsetX, offsetY]
  const [edgePath] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  }); // guaranteed source -> target direction [web:2]

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={style}
      markerEnd="url(#arrowhead)" 
    />
  );
};

export default memo(ArrowEdge);
