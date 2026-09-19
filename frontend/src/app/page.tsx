import Link from "next/link";
import { Layers, ArrowRight, Play, Sparkles } from "lucide-react";
import Navbar from "./components/Navbar";
import RealTimeCollaborativeIcon from "./icons/RealTimeCollaborativeIcon";
import FeatureCard from "./components/FeatureCard";
import PresenceAwarenessIcon from "./icons/PresenceAwarenessIcon";
import RoleBasedIcon from "./icons/RoleBasedAccess";
import VersionHistoryIcon from "./icons/VersionHistoryIcon";
import DragAndDropIcon from "./icons/DragAndDrop";
import RealTimeCommentsIcon from "./icons/RealTimeComments";

const AVATAR_COLORS = ["bg-amber-500", "bg-emerald-500", "bg-indigo-500", "bg-rose-500"];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-slate-900">
      <Navbar />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 right-0 w-[560px] h-[560px] rounded-full bg-indigo-300/30 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
              <Layers size={13} />
              Now with AI-generated diagrams
            </span>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-50 leading-tight">
              Where your team plans, builds, and{" "}
              <span className="text-indigo-500">draws it out</span>.
            </h1>

            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Kanban boards and flow diagrams in one workspace — with live cursors, presence, and AI that turns a prompt into a working architecture diagram in seconds.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition"
              >
                Start for free
                <ArrowRight size={16} />
              </Link>
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Play size={14} />
                Watch demo
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2">
                {AVATAR_COLORS.map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-[#F8F9FC] dark:border-slate-900 flex items-center justify-center text-white text-[10px] font-bold`}
                  >
                    {["JM", "RS", "MI", "AL"][i]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Trusted by <span className="font-semibold text-slate-700 dark:text-slate-300">2,400+</span> product teams
              </p>
            </div>
          </div>

          {/* Product preview card */}
          <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            </div>
            <div className="p-5 space-y-3">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Q3 Platform Migration</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Backlog</p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-2 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-200 mb-1.5">Audit legacy auth dependencies</p>
                    <span className="text-[10px] font-semibold text-red-600 dark:text-red-400">High</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">In Progress</p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-2 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-200 mb-1.5">Migrate service to new cluster</p>
                    <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Med</span>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-2.5 space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Done</p>
                  <div className="bg-white dark:bg-slate-800 rounded-md p-2 shadow-sm">
                    <p className="text-xs text-slate-700 dark:text-slate-200 mb-1.5">Provision staging cluster</p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Low</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">
            Everything you need to collaborate
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-base">
            One workspace for planning, drawing, and shipping — built for teams who think in both tasks and diagrams.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <FeatureCard
            title="Real-time Collaboration"
            description="See changes instantly as your team edits together. No refresh needed."
            icon={<RealTimeCollaborativeIcon width={20} height={20} />}
          />
          <FeatureCard
            title="Presence Awareness"
            description="Know who's online and see live cursors as team members work."
            icon={<PresenceAwarenessIcon width={20} height={20} />}
          />
          <FeatureCard
            title="Role-based Access"
            description="Control who can view, edit, or manage your boards with flexible permissions."
            icon={<RoleBasedIcon width={20} height={20} />}
          />
          <FeatureCard
            title="Version History"
            description="Track changes and restore previous versions with full history support."
            icon={<VersionHistoryIcon width={20} height={20} />}
          />
          <FeatureCard
            title="Drag & Drop"
            description="Intuitively organize your work with smooth drag-and-drop interfaces."
            icon={<DragAndDropIcon width={20} height={20} />}
          />
          <FeatureCard
            title="AI Diagram Generation"
            description="Describe an architecture in plain English and get a working, editable diagram."
            icon={<Sparkles size={20} className="text-indigo-500" />}
          />
        </div>
      </div>

      {/* CTA */}
      <div className="py-16 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-800 text-center px-6">
        <p className="text-slate-900 dark:text-slate-50 font-bold text-2xl">
          Ready to transform how your team works?
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-base max-w-md">
          Join teams using SyncSpace to plan, build, and diagram together.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm transition"
        >
          Get Started Free
          <ArrowRight size={16} />
        </Link>
        <p className="text-slate-400 dark:text-slate-500 text-xs">
          No credit card required · Free for teams up to 10
        </p>
      </div>
    </div>
  );
}
