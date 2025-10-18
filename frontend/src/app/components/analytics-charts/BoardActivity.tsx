"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Product Roadmap", edits: 40, comments: 30, shares: 10 },
  { name: "Marketing Campaign", edits: 35, comments: 25, shares: 8 },
  { name: "Website Redesign", edits: 20, comments: 15, shares: 6 },
  { name: "Q3 Planning", edits: 25, comments: 20, shares: 7 },
  { name: "User Research", edits: 30, comments: 28, shares: 9 },
];

export default function BoardActivity() {
  return (
    <div className="bg-white w-full h-68 space-y-3 p-4 rounded-lg shadow-md">
      <h2 className="text-sm font-semibold">Board Activity</h2>
      <div className="w-full h-[100%] py-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="edits" fill="#6366F1" />
            <Bar dataKey="comments" fill="#22C55E" />
            <Bar dataKey="shares" fill="#FACC15" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
