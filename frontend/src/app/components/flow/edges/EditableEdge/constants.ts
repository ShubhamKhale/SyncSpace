export enum Algorithm {
  Linear = "linear",
  CatmullRom = "catmull-rom",
  BezierCatmullRom = "bezier-catmull-rom",
  Straight = "straight",
  Smart = "smart",
}

export const COLORS = {
  [Algorithm.Linear]: "#0375ff",
  [Algorithm.BezierCatmullRom]: "#68D391",
  [Algorithm.CatmullRom]: "#FF0072",
  [Algorithm.Straight]: "#FFA400",
  [Algorithm.Smart]: "#a78bfa",
};

export const DEFAULT_ALGORITHM = Algorithm.BezierCatmullRom;

export const BUNDLE_SPACING = 30; // px between bundled parallel edges
