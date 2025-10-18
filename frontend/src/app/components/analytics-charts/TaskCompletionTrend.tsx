"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Jan", created: 20, completed: 15 },
  { name: "Feb", created: 25, completed: 20 },
  { name: "Mar", created: 32, completed: 28 },
  { name: "Apr", created: 30, completed: 25 },
  { name: "May", created: 28, completed: 24 },
  { name: "Jun", created: 35, completed: 30 },
  { name: "Jul", created: 38, completed: 36 },
];

export default function TaskCompletionTrend() {
  return (
    <div className="bg-white w-full h-68 space-y-3 p-4 rounded-lg shadow-md">
      <h2 className="text-sm font-semibold">Task Completion Trend</h2>
      <div className="w-full h-[100%] py-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="created" stroke="#6366F1" />
            <Line type="monotone" dataKey="completed" stroke="#22C55E" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
