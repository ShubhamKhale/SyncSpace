import { create } from "zustand";

export type Task = {
  id: string;
  title: string;
  description: string;
  startDate: number;
  dueDate: number;
  priority: "Urgent" | "High" | "Normal" | "Low";
  tag: string;
  assigneeInitial: string;
  assigneeName: string;
};

export type TaskList = {
  title: string;
  tasks: Task[];
};

interface TaskStore {
  taskLists: TaskList[];
  setTaskLists: (lists: TaskList[]) => void;
  moveTask: (
    activeId: string,
    overId: string,
    fromList: string,
    toList: string
  ) => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  taskLists: [
    {
      title: "To Do",
      tasks: [
        {
          id: "e139d14f-2462-4749-9653-53b00e153e67",
          title: "Define app architecture",
          description: "Plan the structure and technologies to use.",
          startDate: 1747734996,
          dueDate: 1748182948,
          priority: "High",
          tag: "Planning",
          assigneeInitial: "A",
          assigneeName: "Avery",
        },
        {
          id: "b7f223c3-7bec-475d-9846-87b9b39f6feb",
          title: "Write user personas",
          description: "Create detailed user profiles for design.",
          startDate: 1747734996,
          dueDate: 1748280000,
          priority: "Normal",
          tag: "UX",
          assigneeInitial: "B",
          assigneeName: "Bob",
        },
      ],
    },
    {
      title: "In Progress",
      tasks: [
        {
          id: "4d2da4f1-24d0-4163-996b-329225aa7f17",
          title: "Set up project repo",
          description: "Initialize GitHub repo and CI workflow.",
          startDate: 1747734996,
          dueDate: 1748380000,
          priority: "Normal",
          tag: "DevOps",
          assigneeInitial: "S",
          assigneeName: "Sam",
        },
        {
          id: "669c0724-2791-455b-9b22-f8467f34322c",
          title: "Build login screen",
          description: "Implement login UI with validation.",
          startDate: 1747734996,
          dueDate: 1748480000,
          priority: "High",
          tag: "Frontend",
          assigneeInitial: "D",   
          assigneeName: "Dan",
        },
      ],
    },
  ],

  setTaskLists: (lists) => set({ taskLists: lists }),

  moveTask: (activeId, overId, fromList, toList) => {
    const lists = get().taskLists;
    const fromIndex = lists.findIndex((l) => l.title === fromList);
    const toIndex = lists.findIndex((l) => l.title === toList);

    if (fromIndex === -1 || toIndex === -1) return;

    const fromTasks = [...lists[fromIndex].tasks];
    const toTasks = [...lists[toIndex].tasks];

    const taskIndex = fromTasks.findIndex((t) => t.id === activeId); 
    if (taskIndex === -1) return;

    const [task] = fromTasks.splice(taskIndex, 1);

    const overIndex = toTasks.findIndex((t) => t.id === overId); 
    const insertIndex = overIndex === -1 ? toTasks.length : overIndex;

    toTasks.splice(insertIndex, 0, task);

    const updatedLists = [...lists];
    updatedLists[fromIndex] = { ...lists[fromIndex], tasks: fromTasks };
    updatedLists[toIndex] = { ...lists[toIndex], tasks: toTasks };

    set({ taskLists: updatedLists });
  },
}));
    