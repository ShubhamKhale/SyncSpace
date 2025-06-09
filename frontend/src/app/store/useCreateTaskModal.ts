import {create} from "zustand";

interface CreateTaskModal {
    isCreateTaskModalOpen: boolean;
    onOpenCreateTaskModal: () => void;
    onCloseCreateTaskModal: () => void;   
}

export const useCreateTaskModal = create<CreateTaskModal>((set) => ({
    isCreateTaskModalOpen: false,
    onOpenCreateTaskModal: () =>
        { 
            console.log("Open Create Task Modal")
            set({isCreateTaskModalOpen: true})
    },   
    onCloseCreateTaskModal: () =>    
        { 
            console.log("Close Create Task Modal")
            set({isCreateTaskModalOpen: false})
    }
}))    