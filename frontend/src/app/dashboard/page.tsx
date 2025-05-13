import GridBoard from "../components/GridBoard";
import GridIcon from "../icons/GridIcon";
import ListIcon from "../icons/ListIcon";
import PlusIcon from "../icons/PlusIcon";
import SearchIcon from "../icons/SearchBarIcon";

export default function DashboardHome() {
  return (
    <div className="px-12 pt-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-xl text-[var(--primary-text-colo)]">
          My Boards
        </p>
        <button className="w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-4 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
          <PlusIcon width={20} height={20} className="mt-1" />
          <p>New Board</p>
        </button>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <div className="p-3 flex items-center rounded-md border-2 border-[var(--sidebar-border-color)] text-[#9CA3AF]">
          <SearchIcon width={20} height={20} />
          <input
            placeholder="Search boards..."
            className="ml-4 pr-20 text-lg placeholder:text-[#CCCCCC]"
          />
        </div>

        <div className="inline-flex items-center space-x-6">
          <p className="text-lg text-[var(--tertiary-text-color)]">View:</p>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#E5E7EB] rounded-md hover:cursor-pointer">
              <GridIcon width={20} height={20} />
            </div>
            <div className="p-3 hover:cursor-pointer">
              <ListIcon width={20} height={20} />
            </div>
          </div>
        </div>

      </div>

       <div className="mt-6 grid grid-cols-2">
          <GridBoard />
          <GridBoard />
        </div>
    </div>
  );
}
