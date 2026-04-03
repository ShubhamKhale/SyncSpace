import { IoMdClose } from "react-icons/io";
import { Workflow } from "lucide-react";

export const About = (props: { onClick: () => void }) => {
  return (
    <div className="bg-white dark:bg-black p-4 flex flex-col gap-4 w-full h-full">
      <div className="flex flex-row justify-between items-center">
        <div className="flex items-center gap-2">
          <Workflow size={20} className="text-blue-500" />
          <span className="font-semibold text-lg text-gray-900 dark:text-white">SyncFlow</span>
        </div>
        <div
          onClick={props.onClick}
          className="flex cursor-pointer flex-row gap-3 justify-center items-center border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
        >
          <IoMdClose className="text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        SyncFlow is SyncSpace&apos;s built-in diagram maker. Create flowcharts,
        architecture diagrams, and mind maps — all linked directly to your
        boards and tasks.
      </div>

      <div className="flex flex-col gap-2 text-sm">
        <p className="font-medium text-gray-700 dark:text-gray-300">Features</p>
        <ul className="space-y-1 text-gray-500 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Drag-and-drop shapes
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Editable edges with path algorithms
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Export as PNG, SVG, or JSON
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Undo / redo history
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
            Auto-saves to your browser
          </li>
        </ul>
      </div>

      <div className="mt-auto text-xs text-gray-400 dark:text-gray-600">
        SyncSpace &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};
