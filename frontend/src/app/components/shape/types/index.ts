// import { SVGAttributes } from 'react';

// import Circle from './circle';
// import RoundRectangle from './round-rectangle';
// import Rectangle from './rectangle';
// import Hexagon from './hexagon';
// import Diamond from './diamond';
// import ArrowRectangle from './arrow-rectangle';
// import Cylinder from './cylinder';
// import Triangle from './triangle';
// import Parallelogram from './parallelogram';
// // here we register all the shapes that are available
// // you can add your own here
// export const ShapeComponents = {
//   circle: Circle,
//   'round-rectangle': RoundRectangle,
//   rectangle: Rectangle,
//   hexagon: Hexagon,
//   diamond: Diamond,
//   'arrow-rectangle': ArrowRectangle,
//   cylinder: Cylinder,
//   triangle: Triangle,
//   parallelogram: Parallelogram,
// };

// export type ShapeType = keyof typeof ShapeComponents;

// export type ShapeProps = {
//   width: number;
//   height: number;
// } & SVGAttributes<SVGElement>;

// export type ShapeComponentProps = Partial<ShapeProps> & { type: ShapeType };

import type { SVGAttributes } from "react";
import type { ComponentType } from "react";

import Circle from "./circle";
import RoundRectangle from "./round-rectangle";
import Rectangle from "./rectangle";
import Hexagon from "./hexagon";
import Diamond from "./diamond";
import ArrowRectangle from "./arrow-rectangle";
import Cylinder from "./cylinder";
import Triangle from "./triangle";
import Parallelogram from "./parallelogram";

// -------------------------------------------------------------
// Shape registry
// -------------------------------------------------------------
export const ShapeComponents = {
  circle: Circle,
  "round-rectangle": RoundRectangle,
  rectangle: Rectangle,
  hexagon: Hexagon,
  diamond: Diamond,
  "arrow-rectangle": ArrowRectangle,
  cylinder: Cylinder,
  triangle: Triangle,
  parallelogram: Parallelogram,
};



export type ShapeType = keyof typeof ShapeComponents;

export type ShapeProps = {
  width: number;
  height: number;
} & SVGAttributes<SVGElement>;

export type ShapeComponentProps = Partial<ShapeProps> & {
  type: ShapeType;
};

// -------------------------------------------------------------
// Shapes alias
// -------------------------------------------------------------
export const shapes = ShapeComponents;

// -------------------------------------------------------------
// nodeTypes (React Flow) WITHOUT JSX
// Works even in .ts
// -------------------------------------------------------------
export const nodeTypes: Record<string, ComponentType<any>> =
  Object.fromEntries(
    Object.entries(ShapeComponents).map(([key, Component]) => [
      key,
      Component as ComponentType<any>,
    ])
  );

