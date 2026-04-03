"use client"

export default function SettingsPage() {


  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen pt-4 px-4 md:px-6 pb-6">
      <p className="text-[var(--primary-text-color)] font-semibold text-xl">
        Settings
      </p>

      <div className="rounded-lg mt-4 px-4 pb-6 bg-white dark:bg-slate-800 shadow max-w-3xl">
        <div className="py-4 px-3 space-y-2 border-b border-b-[var(--sidebar-option-background-color)]">
          <p className="font-medium text-base text-[var(--primary-text-color)]">
            Notifications
          </p>
          <p className="text-xs text-[var(--tertiary-text-color)]">
            Manage your notificaton preferences.
          </p>
        </div>

        <div className="mt-3 px-3 flex items-start space-x-3">
          <div className="mt-1 flex items-center hover:cursor-pointer text-sm text-[var(--quaternary-text-color)]">
            <input type="checkbox" className="h-4 w-4 hover:cursor-pointer" />
          </div>
          <div>
            <p className="font-medium text-base text-[var(--primary-text-color)]">
              Comments 
            </p>
            <p className="text-xs mt-1 text-[var(--tertiary-text-color)]">
              Get notified when someone comments on your boards.
            </p>
          </div>
        </div>

        <div className="mt-3 px-3 flex items-start space-x-3">
          <div className="mt-1 flex items-center hover:cursor-pointer text-sm text-[var(--quaternary-text-color)]">
            <input type="checkbox" className="h-4 w-4 hover:cursor-pointer" />
          </div>
          <div>
            <p className="font-medium text-base text-[var(--primary-text-color)]">
              Invites
            </p>
            <p className="text-xs mt-1 text-[var(--tertiary-text-color)]">
              Get notified when you are invited to a board.
            </p>
          </div>
        </div>

        <div className="mt-3 px-3 flex items-start space-x-3">
          <div className="mt-1 flex items-center hover:cursor-pointer text-sm text-[var(--quaternary-text-color)]">
            <input type="checkbox" className="h-4 w-4 hover:cursor-pointer" />
          </div>
          <div>
            <p className="font-medium text-base text-[var(--primary-text-color)]">
              Product Updates 
            </p>
            <p className="text-xs mt-1 text-[var(--tertiary-text-color)]">
              Get notified about new features and updates.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button className=" mt-5 w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-6 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
            <p>Save Preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
}
