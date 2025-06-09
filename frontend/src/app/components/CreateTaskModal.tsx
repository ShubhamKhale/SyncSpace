import { Dialog } from '@headlessui/react';
import { Paperclip, Link, Send } from 'lucide-react';
import { useCreateTaskModal } from '../store/useCreateTaskModal';

export default function CreateTaskModal() {
  
    const { isCreateTaskModalOpen, onCloseCreateTaskModal } = useCreateTaskModal();
    
  return (    
    <div>   
      <Dialog open={isCreateTaskModalOpen} onClose={onCloseCreateTaskModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-lg font-semibold mb-2">Create New Task</Dialog.Title>

            <div className="flex items-center gap-2 mb-4">
              <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm">Task</span>
              <button className="text-sm text-gray-500 underline hover:cursor-pointer">+ Add Tag</button>
            </div>
         
            <input
              type="text"
              placeholder="Task title"
              className="w-full border-b border-gray-300 py-2 text-sm focus:outline-none mb-4"
            />

            <div className="flex items-center space-x-4 text-gray-600 mb-2">
              <button className="hover:text-black font-bold hover:cursor-pointer">B</button>
              <button className="italic hover:text-black hover:cursor-pointer">I</button>
              <button className="underline hover:text-black hover:cursor-pointer">U</button>
              <button className="hover:text-black hover:cursor-pointer">😊</button>
            </div>   

            <textarea
              placeholder="Task description... (Use formatting tools above)"
              className="w-full h-24 border border-gray-200 p-2 rounded text-sm resize-none mb-4"
            />

            <div className="flex items-center justify-between border-t pt-4">
              <div className="flex gap-4 text-gray-500">
                <button className="flex items-center gap-1 hover:text-black hover:cursor-pointer">
                  <Paperclip className="w-4 h-4" /> Add File
                </button>
                <button className="flex items-center gap-1 hover:text-black hover:cursor-pointer">
                  <Link className="w-4 h-4" /> Add Link
                </button>
              </div>

              <button
                onClick={onCloseCreateTaskModal}
                className="bg-[#2563EB] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-600 hover:cursor-pointer"
              >
                Create Task <Send className="w-4 h-4" />
              </button>
            </div>   
          </Dialog.Panel>   
        </div>
      </Dialog>
    </div>
  );
}
