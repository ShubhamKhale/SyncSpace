"use client";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Planning", value: 26 },
  { name: "Design", value: 17 },
  { name: "Development", value: 35 },
  { name: "Testing", value: 13 },
  { name: "Deployment", value: 9 },
];

const COLORS = ["#6366F1", "#22C55E", "#FACC15", "#EF4444", "#3B82F6"];

export default function TaskDistribution() {
  return (
    <div className="bg-white w-full h-68 space-y-3 p-4 rounded-lg shadow-md">
      <h2 className="text-sm font-semibold">Task Distribution by Category</h2>
      <div className="w-full h-[100%] py-3">
      <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          label
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}