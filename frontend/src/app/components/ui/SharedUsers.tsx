// "use client";

// import { useEffect, useRef, useState } from "react";

// type SharedUser = {
//   id: string;
//   name: string;
// };

// const MAX_VISIBLE = 2;

// const getInitials = (name: string) =>
//   name
//     .split(" ")
//     .map((n) => n[0])
//     .join("")
//     .toUpperCase();

// export const SharedUsers = ({ users }: { users: SharedUser[] }) => {
//   const [selectedUser, setSelectedUser] = useState<SharedUser | null>(null);
//   const [showAll, setShowAll] = useState(false);

//   const containerRef = useRef<HTMLDivElement>(null);

//   const visibleUsers = users.slice(0, MAX_VISIBLE);
//   const remaining = users.length - MAX_VISIBLE;

//   useEffect(() => {
//     const handlePointerDown = (event: PointerEvent) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(event.target as Node)
//       ) {
//         setSelectedUser(null);
//         setShowAll(false);
//       }
//     };

//     // CAPTURE PHASE (important for React Flow)
//     document.addEventListener("pointerdown", handlePointerDown, true);

//     return () => {
//       document.removeEventListener("pointerdown", handlePointerDown, true);
//     };
//   }, []);

//   return (
//     <div ref={containerRef} className="relative flex items-center">
//       {/* Avatars */}
//       <div className="flex items-center -space-x-2">
//         {visibleUsers.map((user, index) => (
//           <button
//             key={user.id}
//             onClick={() => {
//               setSelectedUser(user);
//               setShowAll(false);
//             }}
//             className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white
//               ${index === 0 ? "bg-purple-500" : "bg-green-500"}
//               hover:ring-2 hover:ring-blue-400 hover:cursor-pointer`}
//           >
//             {getInitials(user.name)}
//           </button>
//         ))}

//         {remaining > 0 && (
//           <button
//             onClick={() => {
//               setShowAll(true);
//               setSelectedUser(null);
//             }}
//             className="w-8 h-8 rounded-full bg-zinc-700 text-white text-xs flex items-center justify-center hover:ring-2 hover:ring-blue-400 hover:cursor-pointer"
//           >
//             +{remaining}
//           </button>
//         )}
//       </div>

//       {/* Popover */}
//       {(selectedUser || showAll) && (
//         <div className="absolute top-10 right-0 z-50 bg-[#18181B] text-white rounded-lg shadow-lg p-3 min-w-[180px]">
//           {selectedUser && (
//             <div>
//               <p className="text-sm font-semibold">{selectedUser.name}</p>
//               <p className="text-xs text-zinc-400">Shared user</p>
//             </div>
//           )}

//           {showAll && (
//             <div className="space-y-2">
//               <p className="text-xs text-zinc-400 mb-1">Shared with</p>
//               {users.map((user) => (
//                 <div key={user.id} className="flex items-center gap-2 text-sm">
//                   <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
//                     {getInitials(user.name)}
//                   </div>
//                   {user.name}
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };


"use client";

import { useEffect, useRef, useState } from "react";

type SharedUser = {
  id: string;
  name: string;
};

const MAX_VISIBLE = 2;

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

export const SharedUsers = ({ users }: { users: SharedUser[] }) => {
  const [selectedUser, setSelectedUser] = useState<SharedUser | null>(null);
  const [showAll, setShowAll] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const remaining = users.length - MAX_VISIBLE;

  const isOpen = Boolean(selectedUser || showAll);

  // ✅ Outside click (capture phase → works with React Flow)
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setSelectedUser(null);
        setShowAll(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", handlePointerDown, true);
  }, []);

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Avatars */}
      <div className="flex items-center -space-x-2">
        {visibleUsers.map((user, index) => (
          <button
            key={user.id}
            onClick={() => {
              setSelectedUser(user);
              setShowAll(false);
            }}
            className={`
              w-8 h-8 rounded-full flex items-center justify-center
              text-xs font-semibold text-white
              ${index === 0 ? "bg-purple-500" : "bg-green-500"}
              hover:ring-2 hover:ring-blue-400 hover:cursor-pointer
              transition-transform duration-150 hover:scale-105
            `}
          >
            {getInitials(user.name)}
          </button>
        ))}

        {remaining > 0 && (
          <button
            onClick={() => {
              setShowAll(true);
              setSelectedUser(null);
            }}
            className="
              w-8 h-8 rounded-full bg-zinc-700 text-white text-xs
              flex items-center justify-center
              hover:ring-2 hover:ring-blue-400 hover:cursor-pointer
              transition-transform duration-150 hover:scale-105
            "
          >
            +{remaining}
          </button>
        )}
      </div>

      {/* Popover */}
      {isOpen && (
        <div
          className={`
            absolute top-10 right-0 z-50
            bg-[#18181B] text-white
            rounded-lg shadow-lg p-3 min-w-[180px]
            transform transition-all duration-150 ease-out
            motion-reduce:transition-none
            opacity-100 scale-100 translate-y-0
          `}
        >
          {selectedUser && (
            <div>
              <p className="text-sm font-semibold">{selectedUser.name}</p>
              <p className="text-xs text-zinc-400">Shared user</p>
            </div>
          )}

          {showAll && (
            <div className="space-y-2">
              <p className="text-xs text-zinc-400 mb-1">Shared with</p>
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-2 text-sm hover:cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs">
                    {getInitials(user.name)}
                  </div>
                  {user.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
