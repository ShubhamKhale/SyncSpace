"use client";

import Image from "next/image";
import Navbar from "./components/Navbar";
import RealTimeCollaborativeIcon from "./icons/RealTimeCollaborativeIcon";
import FeatureCard from "./components/FeatureCard";
import PresenceAwarenessIcon from "./icons/PresenceAwarenessIcon";
import RoleBasedIcon from "./icons/RoleBasedAccess";
import VersionHistoryIcon from "./icons/VersionHistoryIcon";
import DragAndDropIcon from "./icons/DragAndDrop";
import RealTimeCommentsIcon from "./icons/RealTimeComments";

export default function Home() {
  return (
    <div className="h-screen bg-gradient-to-r from-[#2563EB]  to-[#4338CA]">
      <Navbar />
      <div className="mt-3 px-6 py-4 text-white flex items-center justify-between">
        <div className="space-y-8">
          <p className="font-bold text-5xl pr-48">
            Collaborate in real-time with your team
          </p>
          <p className="pr-28 text-lg text-[#DBEAFE]">
            SyncSpace is the modern whiteboard platform that bringe team
            together. Plan, create, and collaborate seamlessly --- all in one
            powerful workspace.
          </p>
          <div className="pl-3 flex items-center space-x-6">
            <div className="px-6 py-3 hover:cursor-pointer rounded-lg border-2 bg-white text-[#2563EB] hover:text-white hover:bg-[#2563EB]">
              Get Started Free
            </div>
            <div className="px-6 py-3 hover:cursor-pointer rounded-lg border-2 border-white text-white hover:text-[#2563EB] hover:bg-white">
              See How It Works
            </div>
          </div>
        </div>

        <Image
          width={700}
          height={700}
          className="rounded-xl"
          src="https://res.cloudinary.com/dkgee8xdn/image/upload/v1757089240/team-discussion.png"
          alt="img"
        />
      </div>
      <div className="px-6 py-4 bg-[#DBEAFE] text-black">
        <div className="mt-8 space-y-3">
          <p className="font-bold text-2xl text-center text-[#111827]">
            Everything you need to collaborate
          </p>
          <p className="text-[#4B5563] text-lg text-center">
            Powerful features that make team collaboration seamless and
            efficient
          </p>
        </div>
        <div className="my-12 grid grid-cols-3 gap-3 gap-y-6">
          <FeatureCard
            title="Real-time Collaboration"
            description="See changes instantly as your team edits together. No refresh needed."
            icon={
              <RealTimeCollaborativeIcon className="relative left-3 top-3" />
            }
          />
          <FeatureCard
            title="Presence Awareness"
            description="Know who's online and see live cursor as team members work."
            icon={<PresenceAwarenessIcon className="relative left-3 top-3" />}
          />
          <FeatureCard
            title="Role-based Access"
            description="Control who can view, edit, or manager your boards with flexible permissions"
            icon={<RoleBasedIcon className="relative left-3 top-3" />}
          />
          <FeatureCard
            title="Version History"
            description="Track changes and restore previous versions with full history support."
            icon={<VersionHistoryIcon className="relative left-3 top-3" />}
          />
          <FeatureCard
            title="Drag & Drope"
            description="Intuitively organize your work with smooth drag-and-drop interfaces."
            icon={<DragAndDropIcon className="relative left-3 top-3" />}
          />
          <FeatureCard
            title="Real-time Comments"
            description="Discuss and collaborate directly within your boards using threaded comments."
            icon={<RealTimeCommentsIcon className="relative left-3 top-3" />}
          />
        </div>
      </div>
      <div className="py-12 space-y-5 flex flex-col bg-white items-center justify-center">
        <p className="text-[#111827] font-bold text-2xl">
          Ready to transform how your team works?
        </p>
        <p className="text-lg text-[#4B5563]">
          Join thousands of teams using SyncSpace to work better together.
        </p>
        <button className="bg-[#2563EB] text-white px-6 py-3 rounded-lg font-medium text-sm">
          Get Started Free
        </button>
        <p className="text-[#6B7280] text-xs">
          No credit card required . Free 14-day trial
        </p>
      </div>
    </div>
  );
}
