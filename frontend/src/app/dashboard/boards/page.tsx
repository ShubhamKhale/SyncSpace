"use client";
import GridBoard from "@/app/components/GridBoard";
import GridIcon from "@/app/icons/GridIcon";
import ListIcon from "@/app/icons/ListIcon";
import PlusIcon from "@/app/icons/PlusIcon";
import SearchIcon from "@/app/icons/SearchBarIcon";
import React, { useState } from "react";

const Boards = () => {
  const boards = [
    {
      boardTitle: "Product Roadmap",
      boardDescription:
        "Plan, prioritize, and visualize product development goals.",
      boardImage:
        "https://images.unsplash.com/photo-1590103514966-5e2a11c13e21?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdCUyMHJvYWRtYXB8ZW58MHx8MHx8fDA%3D",
      boardMembersCount: 4,
      lastUpdated: 1747129001,
    },
    {
      boardTitle: "Marketing Campaign",
      boardDescription:
        "Coordinate tasks and assets for upcoming marketing initiatives.",
      boardImage:
        "https://plus.unsplash.com/premium_photo-1661486923449-5a8ab6b5f07c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8bWFya2V0aW5nJTIwY2FtcGFpZ258ZW58MHx8MHx8fDA%3D",
      boardMembersCount: 2,
      lastUpdated: 1747129055,
    },
    {
      boardTitle: "Website Redesign",
      boardDescription:
        "Track progress of new layouts, content, and user flows.",
      boardImage:
        "https://images.unsplash.com/photo-1530435460869-d13625c69bbf?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8V2Vic2l0ZSUyMFJlZGVzaWdufGVufDB8fDB8fHww",
      boardMembersCount: 5,
      lastUpdated: 1747129123,
    },
    {
      boardTitle: "Q3 Planning",
      boardDescription: "Set strategic goals and resource allocations for Q3.",
      boardImage:
        "https://media.istockphoto.com/id/1292141784/photo/q3-3rd-quarter-period-write-on-sticky-notes-isolated-on-office-desk-stock-market-concept.webp?a=1&b=1&s=612x612&w=0&k=20&c=MgRvP5v_BeVo7sBRzq3Zv36P0YOQpjFE5H7vI8npiwQ=",
      boardMembersCount: 3,
      lastUpdated: 1747129188,
    },
    {
      boardTitle: "User Research",
      boardDescription:
        "Analyze feedback and research to improve UX and features.",
      boardImage:
        "https://images.unsplash.com/photo-1518349619113-03114f06ac3a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VXNlciUyMFJlc2VhcmNofGVufDB8fDB8fHww",
      boardMembersCount: 2,
      lastUpdated: 1747129250,
    },
    {
      boardTitle: "Team Retrospective",
      boardDescription:
        "Reflect on wins, challenges, and improvements from the last sprint.",
      boardImage:
        "https://images.unsplash.com/photo-1646066490017-c935b1a1eb0f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8VGVhbSUyMFJldHJvc3BlY3RpdmV8ZW58MHx8MHx8fDA%3D",
      boardMembersCount: 8,
      lastUpdated: 1747129314,
    },
  ];

  // return (
  //   <div className="px-12 pt-4 bg-gray-100">
  //     <div className="">
  //       <div className=" flex items-center justify-between">
  //         <p className="font-semibold text-xl text-[var(--primary-text-color)]">
  //           My Boards
  //         </p>
  //         <button className="w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
  //           <PlusIcon width={20} height={20} className="mt-1" />
  //           <p>New Board</p>
  //         </button>
  //       </div>

  //       <div className="mt-6 flex items-center justify-between space-x-20">
  //         <div className="p-3 w-full flex items-center rounded-md border-2 border-[var(--sidebar-border-color)] text-[#9CA3AF]">
  //           <SearchIcon width={20} height={20} />
  //           <input
  //             placeholder="Search boards..."
  //             className="ml-4 text-lg text-[var(--primary-text-color)] placeholder:text-[#CCCCCC] outline-none"
  //           />
  //         </div>

  //         <div className="inline-flex items-center space-x-6">
  //           <p className="text-lg text-[var(--tertiary-text-color)]">View:</p>
  //           <div className="flex items-center space-x-4">
  //             <div className="p-3 bg-[#E5E7EB] rounded-md hover:cursor-pointer">
  //               <GridIcon width={20} height={20} />
  //             </div>
  //             <div className="p-3 hover:cursor-pointer">
  //               <ListIcon width={20} height={20} />
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>

  //     <div className="mt-6 pb-6 grid grid-cols-2 gap-5">
  //       {boards?.map((board, index) => (
  //         <GridBoard
  //           key={index}
  //           imageSrc={board?.boardImage}
  //           title={board?.boardTitle}
  //           lastUpdated={board?.lastUpdated}
  //           presenceCount={board?.boardMembersCount}
  //         />
  //       ))}
  //     </div>
  //   </div>
  // );

  const [isGridView, setIsGridView] = useState(true); 

  const handleToggleView = (view: "grid" | "list") => {
    setIsGridView(view === "grid");
  };

  return (
    <div className="h-screen px-12 pt-4 bg-gray-100 overflow-hidden flex flex-col">
      <div className="sticky top-0 z-10 bg-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-xl text-[var(--primary-text-color)]">
            My Boards
          </p>
          <button className="w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
            <PlusIcon width={20} height={20} className="mt-1" />
            <p>New Board</p>
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between space-x-20">
          <div className="p-3 w-full flex items-center rounded-md border-2 border-[var(--sidebar-border-color)] text-[#9CA3AF] bg-white">
            <SearchIcon width={20} height={20} />
            <input
              placeholder="Search boards..."
              className="ml-4 text-lg text-[var(--primary-text-color)] placeholder:text-[#CCCCCC] outline-none bg-transparent"
            />
          </div>

          <div className="inline-flex items-center space-x-6">
            <p className="text-lg text-[var(--tertiary-text-color)]">View:</p>
            <div className="flex items-center rounded-md border-2 border-[var(--sidebar-border-color)]">
              <div onClick={() => handleToggleView("grid")} className={`p-3 rounded-md hover:cursor-pointer transition-all duration-300 ${isGridView ? "bg-[#bbd9ff]" : ""}`}>
                <GridIcon width={20} height={20} fill={isGridView ? "#2563eb" : undefined}/>
              </div>

              <div onClick={() => handleToggleView("list")} className={`p-3 rounded-md hover:cursor-pointer transition-all duration-300 ${!isGridView ? "bg-[#bbd9ff]" : ""}`}>
                <ListIcon width={20} height={20} fill={!isGridView ? "#2563eb" : undefined}/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* board's view in grid mode  */}
      <div className="mt-6 pb-6 overflow-y-auto scrollbar-hide grid grid-cols-2 gap-6 flex-1 pr-2">
        {boards?.map((board, index) => (
          <GridBoard
            key={index}
            imageSrc={board?.boardImage}
            title={board?.boardTitle}
            lastUpdated={board?.lastUpdated}
            presenceCount={board?.boardMembersCount}
          />
        ))}
      </div>

      {/* board's view in list mode */}
      {/* <div className="mt-6 pb-6 overflow-y-auto scrollbar-hide flex flex-col gap-6 flex-1 pr-2">
        <div>
              
        </div>
      </div> */}




    </div>
  );
};

export default Boards;
