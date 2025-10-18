"use client";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { phase: "Planning", alpha: 110, beta: 130, gamma: 90 },
  { phase: "Design", alpha: 98, beta: 110, gamma: 120 },
  { phase: "Development", alpha: 120, beta: 105, gamma: 100 },
  { phase: "Testing", alpha: 85, beta: 95, gamma: 80 },
  { phase: "Deployment", alpha: 65, beta: 75, gamma: 70 },
];

export default function TeamContribution() {
  return (
    <div className="bg-white w-full h-68 space-y-3 p-4 rounded-lg shadow-md">
      <h2 className="text-sm font-semibold">Team Contribution by Phase</h2>
      <div className="w-full h-[100%] py-3">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="phase" />
            <PolarRadiusAxis />
            <Tooltip />
            <Legend />
            <Radar
              name="Team Alpha"
              dataKey="alpha"
              stroke="#6366F1"
              fill="#6366F1"
              fillOpacity={0.6}
            />
            <Radar
              name="Team Beta"
              dataKey="beta"
              stroke="#22C55E"
              fill="#22C55E"
              fillOpacity={0.6}
            />
            <Radar
              name="Team Gamma"
              dataKey="gamma"
              stroke="#F97316"
              fill="#F97316"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
