import BaseNode from "./BaseNode";

export const RectangleNode = (props: any) => (
  <BaseNode {...props} shapeStyle={{ border: "1px solid #333", borderRadius: "2px" }} />
);

export const SquareNode = (props: any) => (
  <BaseNode {...props} shapeStyle={{ aspectRatio: "1 / 1", border: "1px solid #333" }} />
);

export const CircleNode = (props: any) => (
  <BaseNode {...props} shapeStyle={{ border: "1px solid #333", borderRadius: "50%" }} />
);

export const OvalNode = (props: any) => (
  <BaseNode {...props} shapeStyle={{ border: "1px solid #333", borderRadius: "50% / 30%" }} />
);

// export const DiamondNode = (props: any) => (
//   <BaseNode {...props} shapeStyle={{ border: "1px solid #333", transform: "rotate(45deg)", overflow: "hidden" }} />
// );

export const DiamondNode = (props: any) => (
  <BaseNode {...props} shape="diamond" />
);


export const TriangleNode = (props: any) => (
  <BaseNode
    {...props}
    shapeStyle={{
      width: 0,
      height: 0,
      borderLeft: "40px solid transparent",
      borderRight: "40px solid transparent",
      borderBottom: "70px solid #eee",
      background: "transparent",
    }}
  />
);

export const CylinderNode = (props: any) => (
  <BaseNode {...props} shapeStyle={{ border: "1px solid #333", borderRadius: "50% / 15%" }} />
);

export const StepNode = (props: any) => (
  <BaseNode {...props} shapeStyle={{ border: "1px solid #333", clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)" }} />
);
