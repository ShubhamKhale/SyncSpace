import React from "react";
import { Algorithm } from "../edges/EditableEdge/constants";
import { AnalyticsOutline } from "react-ionicons";
import { TbLetterL, TbVectorSpline } from "react-icons/tb";
import { TfiVector } from "react-icons/tfi";
import { RxBorderDotted } from "react-icons/rx";
import { IoRemoveOutline } from "react-icons/io5";
import { X } from "lucide-react";
import { useDiagram } from "@/app/hooks/useDiagram";

const colors = [
  "#CF4C2C",
  "#EA9C41",
  "#EBC347",
  "#438D57",
  "#3F8AE2",
  "#803DEC",
  "#a5a4a5",
];

export enum Animation {
  AnimatedDotted = "animatedDotted",
  Dotted = "dotted",
  Solid = "solid",
}

enum AnimationDirection {
  Normal = "normal",
  Reverse = "reverse",
}

type EdgeToolbarProps = {
  takeSnapshot: () => void;
  useDiagram: ReturnType<typeof useDiagram>;
};

function EdgeToolbar(props: EdgeToolbarProps) {
  const diagram = props.useDiagram;
  const editingEdgeId = diagram.editingEdgeId;
  const edge = diagram.getEdge(`${editingEdgeId}`);
  const activeShape = edge?.data?.algorithm || Algorithm.BezierCatmullRom;
  const activeColor = edge?.style?.stroke || "#a5a4a5";
  const activeAnimation = edge?.data?.animation || Animation.Solid;
  const activeAnimationDirection = edge?.data?.animationDirection || "normal";
  const activeShowMovingBall = edge?.data?.showMovingBall || false;
  const activeArrowStyle = (edge?.data?.arrowStyle as string) || "end";
  const edgeTitle = edge?.data?.title || "";

  const onColorChange = (color: string) => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId ? { ...e, style: { ...e.style, stroke: color } } : e
      )
    );
  };

  const onShapeChange = (shape: Algorithm) => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId ? { ...e, data: { ...e.data, algorithm: shape } } : e
      )
    );
  };

  const setAnimatedDotted = () => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId
          ? {
              ...e,
              animated: true,
              style: {
                ...e.style,
                strokeDashArray: 1000,
                strokeDashOffset: 1000,
                animation: "dashdraw 0.4s linear infinite",
              },
              data: { ...e.data, animation: Animation.AnimatedDotted },
            }
          : e
      )
    );
  };

  const setDotted = () => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId
          ? {
              ...e,
              animated: true,
              style: { ...e.style, animation: `dashdraw 0s linear infinite` },
              data: { ...e.data, animation: Animation.Dotted },
            }
          : e
      )
    );
  };

  const setSolid = () => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId
          ? {
              ...e,
              animated: false,
              style: { ...e.style },
              data: { ...e.data, animation: Animation.Solid },
            }
          : e
      )
    );
  };

  const changeAnimationDirection = (direction: "normal" | "reverse") => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId
          ? {
              ...e,
              style: { ...e.style, animationDirection: direction },
              data: { ...e.data, animationDirection: direction },
            }
          : e
      )
    );
  };

  const onMovingBallChange = (isMoving: boolean) => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId
          ? { ...e, data: { ...e.data, showMovingBall: isMoving } }
          : e
      )
    );
  };

  const onUpdateEdgeTitle = (title: string) => {
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId ? { ...e, data: { ...e.data, title } } : e
      )
    );
  };

  const onArrowStyleChange = (arrowStyle: string) => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId ? { ...e, data: { ...e.data, arrowStyle } } : e
      )
    );
  };

  const CONDITION_COLORS = {
    yes: "#22c55e",
    no: "#ef4444",
    error: "#f97316",
    success: "#14b8a6",
  } as const;

  const CONDITION_ICONS = {
    yes: "✓", no: "✗", error: "⚠", success: "✓",
  } as const;

  const activeCondition = (edge?.data?.conditionType as string | null) ?? null;

  const onConditionChange = (type: "yes" | "no" | "error" | "success" | null) => {
    props.takeSnapshot();
    diagram.setEdges((edges) =>
      edges.map((e) =>
        e.id === editingEdgeId
          ? {
              ...e,
              style: {
                ...e.style,
                stroke: type ? CONDITION_COLORS[type] : undefined,
              },
              data: { ...e.data, conditionType: type },
            }
          : e
      )
    );
  };

  const btnBase = "flex items-center justify-center p-1.5 rounded-lg transition-colors cursor-pointer";
  const btnActive = "bg-blue-600 text-white";
  const btnInactive = "text-gray-400 hover:bg-gray-700 hover:text-gray-200";

  return (
    <div className="nodrag flex items-center gap-1 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-2xl shadow-2xl px-3 py-2 text-gray-100">

      {/* COLOR SWATCHES */}
      <div className="flex items-center gap-1.5 pr-1">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onColorChange(color)}
            title={color}
            style={{ background: color }}
            className={`w-4 h-4 rounded-full transition-all cursor-pointer ${
              color === activeColor
                ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900 scale-125"
                : "opacity-70 hover:opacity-100 hover:scale-110"
            }`}
          />
        ))}
      </div>

      <div className="w-px h-5 bg-gray-600 mx-0.5" />

      {/* PATH STYLE */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onShapeChange(Algorithm.BezierCatmullRom)}
          title="Curved"
          className={`${btnBase} ${Algorithm.BezierCatmullRom === activeShape ? btnActive : btnInactive}`}
        >
          <TbVectorSpline size={16} />
        </button>
        <button
          onClick={() => onShapeChange(Algorithm.CatmullRom)}
          title="Smooth"
          className={`${btnBase} ${Algorithm.CatmullRom === activeShape ? btnActive : btnInactive}`}
        >
          <TfiVector size={14} />
        </button>
        <button
          onClick={() => onShapeChange(Algorithm.Linear)}
          title="Angled"
          className={`${btnBase} ${Algorithm.Linear === activeShape ? btnActive : btnInactive}`}
        >
          <AnalyticsOutline width="16px" height="16px" cssClasses="text-inherit" />
        </button>
        <button
          onClick={() => onShapeChange(Algorithm.Straight)}
          title="Orthogonal"
          className={`${btnBase} ${Algorithm.Straight === activeShape ? btnActive : btnInactive}`}
        >
          <TbLetterL size={16} />
        </button>
        <button
          onClick={() => onShapeChange(Algorithm.Smart)}
          title="Smart routing (auto-avoids nodes)"
          className={`${btnBase} px-2 text-xs font-semibold ${Algorithm.Smart === activeShape ? btnActive : btnInactive}`}
        >
          ✦
        </button>
      </div>

      <div className="w-px h-5 bg-gray-600 mx-0.5" />

      {/* LINE STYLE */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={setSolid}
          title="Solid line"
          className={`${btnBase} ${activeAnimation === Animation.Solid ? btnActive : btnInactive}`}
        >
          <IoRemoveOutline size={18} />
        </button>
        <button
          onClick={setDotted}
          title="Dashed line"
          className={`${btnBase} ${activeAnimation === Animation.Dotted ? btnActive : btnInactive}`}
        >
          <RxBorderDotted size={18} />
        </button>
        <button
          onClick={setAnimatedDotted}
          title="Animated line"
          className={`${btnBase} ${activeAnimation === Animation.AnimatedDotted ? btnActive : btnInactive}`}
        >
          <MovingDotsIcon />
        </button>
      </div>

      <div className="w-px h-5 bg-gray-600 mx-0.5" />

      {/* ARROW DIRECTION */}
      <div className="flex items-center gap-0.5">
        {[
          { value: "end",   label: "→", title: "Arrow at end" },
          { value: "start", label: "←", title: "Arrow at start" },
          { value: "both",  label: "↔", title: "Both ends" },
          { value: "none",  label: "—", title: "No arrows" },
        ].map(({ value, label, title }) => (
          <button
            key={value}
            title={title}
            onClick={() => onArrowStyleChange(value)}
            className={`w-7 h-7 rounded-lg text-sm font-bold flex items-center justify-center transition-colors cursor-pointer ${
              activeArrowStyle === value ? btnActive : btnInactive
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-600 mx-0.5" />

      {/* MOVING BALL */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={() => onMovingBallChange(!activeShowMovingBall)}
          title={activeShowMovingBall ? "Hide moving ball" : "Show moving ball"}
          className={`${btnBase} gap-1 px-2 text-xs font-medium ${activeShowMovingBall ? btnActive : btnInactive}`}
        >
          <span className="text-base leading-none">◉</span>
        </button>
        {activeShowMovingBall && (
          <>
            <button
              onClick={() => changeAnimationDirection("normal")}
              title="Forward direction"
              className={`${btnBase} text-sm font-bold ${activeAnimationDirection === AnimationDirection.Normal ? btnActive : btnInactive}`}
            >
              →
            </button>
            <button
              onClick={() => changeAnimationDirection("reverse")}
              title="Reverse direction"
              className={`${btnBase} text-sm font-bold ${activeAnimationDirection === AnimationDirection.Reverse ? btnActive : btnInactive}`}
            >
              ←
            </button>
          </>
        )}
      </div>

      <div className="w-px h-5 bg-gray-600 mx-0.5" />

      {/* LABEL INPUT */}
      <input
        type="text"
        value={edgeTitle as string}
        onChange={(e) => onUpdateEdgeTitle(e.target.value)}
        placeholder="Add label…"
        className="bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-xs text-gray-100 w-24 outline-none focus:border-blue-500 placeholder-gray-500 transition-colors"
      />

      <div className="w-px h-5 bg-gray-600 mx-0.5" />

      {/* CONDITION LABELS */}
      <div className="flex items-center gap-0.5">
        {(["yes", "no", "error", "success"] as const).map((type) => {
          const isActive = activeCondition === type;
          return (
            <button
              key={type}
              onClick={() => onConditionChange(isActive ? null : type)}
              title={`${type.charAt(0).toUpperCase() + type.slice(1)} condition`}
              style={{
                color: CONDITION_COLORS[type],
                borderColor: isActive ? CONDITION_COLORS[type] : "transparent",
              }}
              className={`${btnBase} border text-xs font-semibold px-1.5 gap-0.5 ${isActive ? "bg-gray-700" : btnInactive}`}
            >
              <span>{CONDITION_ICONS[type]}</span>
              <span className="capitalize">{type}</span>
            </button>
          );
        })}
      </div>

      {/* CLOSE */}
      <button
        onClick={() => diagram.setEditingEdgeId(null)}
        title="Close (double-click away)"
        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-200 hover:bg-gray-700 transition-colors cursor-pointer ml-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}

function MovingDotsIcon() {
  return (
    <svg width="18" height="10" viewBox="0 0 60 10" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="5" r="4" fill="currentColor">
        <animate attributeName="cx" values="5;35;5" dur="1.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="5" cy="5" r="4" fill="currentColor">
        <animate attributeName="cx" values="5;35;5" dur="1.8s" begin="0.45s" repeatCount="indefinite" />
      </circle>
      <circle cx="5" cy="5" r="4" fill="currentColor">
        <animate attributeName="cx" values="5;35;5" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

export default EdgeToolbar;
