import TaskListCard from "@/app/components/TaskListCard";
import PlusIcon from "@/app/icons/PlusIcon";
import React from "react";

const page = () => {
  return (
    <div className="bg-[var(--tertiary-background-color)] min-h-screen">
      <div className="flex items-center justify-between bg-white pl-8 pr-16 py-6 border-b border-b-[var(--sidebar-border-color)]">
        <p className="text-xl font-semibold text-[var(--sixth-text-color)]">
          Product Roadmap
        </p>
        <button className="w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
          <PlusIcon width={24} height={24} className="mt-1" />
          <p>Add Task</p>
        </button>
      </div>
      <div className="px-8 py-8 grid grid-cols-3 gap-6 ">
        <TaskListCard
          title="To Do"
          tasks={[
            {
              title: "Define app architecture",
              description: "Plan the structure and technologies to use.",
              dueDate: 1748182948,
              priority: "High",
              tag: "Planning",
              assigneeInitial: "A",
            },
            {
              title: "Write user personas",
              description: "Create detailed user profiles for design.",
              dueDate: 1748280000,
              priority: "Normal",
              tag: "UX",
              assigneeInitial: "B",
            },
          ]}
        />

        <TaskListCard
          title="In Progress"
          tasks={[
            {
              title: "Set up project repo",
              description: "Initialize GitHub repo and CI workflow.",
              dueDate: 1748380000,
              priority: "Normal",
              tag: "DevOps",
              assigneeInitial: "S",
            },
            {
              title: "Build login screen",
              description: "Implement login UI with validation.",
              dueDate: 1748480000,
              priority: "High",
              tag: "Frontend",
              assigneeInitial: "D",
            },
            {
              title: "Integrate Firebase Auth",
              description: "Connect frontend with Firebase login.",
              dueDate: 1748580000,
              priority: "High",
              tag: "Backend",
              assigneeInitial: "E",
            },
          ]}
        />

        <TaskListCard
          title="Review"
          tasks={[
            {
              title: "Review signup API",
              description: "Ensure validation and error handling are in place.",
              dueDate: 1748680000,
              priority: "Normal",
              tag: "Code Review",
              assigneeInitial: "F",
            },
            {
              title: "Review token refresh logic",
              description: "Check for memory leaks or missed edge cases.",
              dueDate: 1748780000,
              priority: "High",
              tag: "Backend",
              assigneeInitial: "G",
            },
          ]}
        />

        <TaskListCard
          title="Blocked"
          tasks={[
            {
              title: "Connect analytics SDK",
              description: "Waiting for API key from vendor.",
              dueDate: 1748880000,
              priority: "Normal",
              tag: "Integration",
              assigneeInitial: "H",
            },
          ]}
        />

        <TaskListCard
          title="In QA"
          tasks={[
            {
              title: "Test logout functionality",
              description: "Verify session clearing and redirect.",
              dueDate: 1748980000,
              priority: "Normal",
              tag: "QA",
              assigneeInitial: "I",
            },
            {
              title: "Regression test: Signup",
              description: "Ensure all signup flows work post refactor.",
              dueDate: 1749080000,
              priority: "Urgent",
              tag: "QA",
              assigneeInitial: "J",
            },
          ]}
        />

        <TaskListCard
          title="Complete"
          tasks={[
            {
              title: "Add favicon",
              description: "Update public assets and manifest.json.",
              dueDate: 1749180000,
              priority: "Low",
              tag: "UI",
              assigneeInitial: "K",
            },
            {
              title: "Fix CSS glitches on mobile",
              description: "Patch UI bugs in Safari mobile view.",
              dueDate: 1749280000,
              priority: "Normal",
              tag: "Frontend",
              assigneeInitial: "L",
            },
            {
              title: "Merge homepage layout",
              description: "Homepage grid and hero section finalized.",
              dueDate: 1749380000,
              priority: "High",
              tag: "Frontend",
              assigneeInitial: "M",
            },
          ]}
        />

        <TaskListCard
          title="Closed"
          tasks={[
            {
              title: "Deprecate old login method",
              description: "OAuth-only login enforced post-migration.",
              dueDate: 1749480000,
              priority: "Normal",
              tag: "Security",
              assigneeInitial: "N",
            },
            {
              title: "Disable feature flags in dev",
              description: "Removed legacy test toggles.",
              dueDate: 1749580000,
              priority: "Low",
              tag: "Cleanup",
              assigneeInitial: "O",
            },
          ]}
        />

        <TaskListCard
          title="On Hold"
          tasks={[
            {
              title: "Redesign profile page",
              description: "Pending decision from design team.",
              dueDate: 1749680000,
              priority: "Low",
              tag: "Design",
              assigneeInitial: "P",
            },
            {
              title: "Update terms and conditions",
              description: "Blocked due to legal team backlog.",
              dueDate: 1749780000,
              priority: "Normal",
              tag: "Legal",
              assigneeInitial: "Q",
            },
          ]}
        />

        <TaskListCard
          title="Cancelled"
          tasks={[
            {
              title: "Implement dark mode toggle",
              description: "Removed from MVP scope.",
              dueDate: 1749880000,
              priority: "Low",
              tag: "UI",
              assigneeInitial: "R",
            },
          ]}
        />

        <TaskListCard
          title="Backlog"
          tasks={[
            {
              title: "Multi-language support",
              description: "Initial planning for i18n and locale files.",
              dueDate: 1749980000,
              priority: "Normal",
              tag: "Feature Request",
              assigneeInitial: "K",
            },
            {
              title: "Add chatbot for support",
              description: "To be implemented post MVP launch.",
              dueDate: 1750080000,
              priority: "Low",
              tag: "Future",
              assigneeInitial: "S",
            },
            {
              title: "User analytics dashboard",
              description: "Planned for analytics phase.",
              dueDate: 1750180000,
              priority: "Normal",
              tag: "Dashboard",
              assigneeInitial: "T",
            },
          ]}
        />
      </div>   
    </div>
  );
};

export default page;
