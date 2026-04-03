"use client";
import GridBoard from "@/app/components/GridBoard";
import GridIcon from "@/app/icons/GridIcon";
import ListIcon from "@/app/icons/ListIcon";
import PlusIcon from "@/app/icons/PlusIcon";
import SearchIcon from "@/app/icons/SearchBarIcon";
import Link from "next/link";
import React, { useState } from "react";
import AddBoardModal from "@/app/dashboard/boards/AddBoardModal";
import ListBoard from "@/app/components/ListBoard";

const Boards = () => {
  const boards = [
    {
      boardId: "da8a8f7a-d362-4e73-8872-19854be1d5ef",
      boardTitle: "Product Roadmap",
      boardDescription:
        "Plan, prioritize, and visualize product development goals.",
      boardImage:
        "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
      boardMembersCount: 4,
      lastUpdated: 1747129001,
    },
    {
      boardId: "eff45e38-6c15-477d-90b6-17f954d5b1eb",
      boardTitle: "Marketing Campaign",
      boardDescription:
        "Coordinate tasks and assets for upcoming marketing initiatives.",
      boardImage:
        "https://plus.unsplash.com/premium_photo-1661486923449-5a8ab6b5f07c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFya2V0aW5nJTIwY2FtcGFpZ258ZW58MHx8MHx8fDA%3D",
      boardMembersCount: 2,
      lastUpdated: 1747129055,
    },
    {
      boardId: "c7f2a8b1-2c4d-4e5f-8a9b-1c2d3e4f5a6b",
      boardTitle: "Website Redesign",
      boardDescription:
        "Track progress of new layouts, content, and user flows.",
      boardImage:
        "https://images.unsplash.com/photo-1530435460869-d13625c69bbf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8V2Vic2l0ZSUyMFJlZGVzaWdufGVufDB8fDB8fHww",
      boardMembersCount: 5,
      lastUpdated: 1747129123,
    },
    {
      boardId: "a1b2c3d4-e5f6-7890-abcd-1234567890ef",
      boardTitle: "Q3 Planning",
      boardDescription: "Set strategic goals and resource allocations for Q3.",
      boardImage:
        "https://media.istockphoto.com/id/1292141784/photo/q3-3rd-quarter-period-write-on-sticky-notes-isolated-on-office-desk-stock-market-concept.webp?a=1&b=1&s=612x612&w=0&k=20&c=MgRvP5v_BeVo7sBRzq3Zv36P0YOQpjFE5H7vI8npiwQ=",
      boardMembersCount: 3,
      lastUpdated: 1747129188,
    },
    {
      boardId: "f9e8d7c6-b5a4-3210-9fed-cba987654321",
      boardTitle: "User Research",
      boardDescription:
        "Analyze feedback and research to improve UX and features.",
      boardImage:
        "https://images.unsplash.com/photo-1518349619113-03114f06ac3a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VXNlciUyMFJlc2VhcmNofGVufDB8fDB8fHww",
      boardMembersCount: 2,
      lastUpdated: 1747129250,
    },
    {
      boardId: "12345678-90ab-cdef-1234-567890abcdef",
      boardTitle: "Team Retrospective",
      boardDescription:
        "Reflect on wins, challenges, and improvements from the last sprint.",
      boardImage:
        "https://images.unsplash.com/photo-1646066490017-c935b1a1eb0f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VGVhbSUyMFJldHJvc3BlY3RpdmV8ZW58MHx8MHx8fDA%3D",
      boardMembersCount: 8,
      lastUpdated: 1747129314,
    },
  ];

  const [isGridView, setIsGridView] = useState(true);
  const [showAddBoard, setShowAddBoard] = useState(false);

  const handleToggleView = (view: "grid" | "list") => {
    setIsGridView(view === "grid");
  };

  return (
    <div className="h-screen px-4 md:px-8 lg:px-12 pt-4 bg-slate-100 dark:bg-slate-900 overflow-hidden flex flex-col">
      <div className="sticky top-0 z-10 bg-slate-100 dark:bg-slate-900 pb-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-xl text-[var(--primary-text-color)]">
            My Boards
          </p>
          <button
            onClick={() => setShowAddBoard(true)}
            className="w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-center"
          >
            <PlusIcon width={20} height={20} className="mt-1" />
            <p>New Board</p>
          </button>
          {showAddBoard && (
            <AddBoardModal onClose={() => setShowAddBoard(false)} />
          )}
        </div>

        <div className="mt-4 md:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="p-3 w-full sm:flex-1 flex items-center rounded-md border-2 border-[var(--sidebar-border-color)] text-[#9CA3AF] bg-white dark:bg-slate-800 dark:text-slate-400">
            <SearchIcon width={20} height={20} />
            <input
              placeholder="Search boards..."
              className="ml-4 text-lg text-[var(--primary-text-color)] placeholder:text-[#CCCCCC] outline-none bg-transparent"
            />
          </div>

          <div className="inline-flex items-center space-x-6">
            <p className="text-lg text-[var(--tertiary-text-color)]">View:</p>
            <div className="flex items-center rounded-md border-2 border-[var(--sidebar-border-color)] dark:border-slate-700">
              <div
                onClick={() => handleToggleView("grid")}
                className={`p-3 rounded-md hover:cursor-pointer transition-all duration-300 ${isGridView ? "bg-[#bbd9ff]" : ""}`}
              >
                <GridIcon
                  width={20}
                  height={20}
                  fill={isGridView ? "#2563eb" : undefined}
                />
              </div>

              <div
                onClick={() => handleToggleView("list")}
                className={`p-3 rounded-md hover:cursor-pointer transition-all duration-300 ${!isGridView ? "bg-[#bbd9ff]" : ""}`}
              >
                <ListIcon
                  width={20}
                  height={20}
                  fill={!isGridView ? "#2563eb" : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isGridView ? (
        /* board's view in grid mode */
        <div className="mt-6 pb-6 overflow-y-auto scrollbar-hide grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 flex-1 pr-2">
          {boards?.map((board, index) => (
            <Link
              key={board.boardId}
              href={`/dashboard/boards/${board.boardTitle.toLowerCase().replace(/\s+/g, "-")}`}
              className="cursor-pointer"
            >
              <GridBoard
                key={index}
                imageSrc={board?.boardImage}
                title={board?.boardTitle}
                lastUpdated={board?.lastUpdated}
                presenceCount={board?.boardMembersCount}
              />
            </Link>
          ))}
        </div>
      ) : (
        /* board's view in list mode */
        <div className="mt-6 pb-6 overflow-y-auto scrollbar-hide flex flex-col gap-3 flex-1 pr-2">
          {boards?.map((board) => (
            <Link
              key={board.boardId}
              href={`/dashboard/boards/${board.boardTitle.toLowerCase().replace(/\s+/g, "-")}`}
              className="cursor-pointer"
            >
              <ListBoard
                imageSrc={board?.boardImage}
                title={board?.boardTitle}
                description={board?.boardDescription}
                lastUpdated={board?.lastUpdated}
                presenceCount={board?.boardMembersCount}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Boards;
