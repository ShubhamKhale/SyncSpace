"use client"
import { useState } from "react";

export default function SettingsPage() {

  const [username, setUsername] = useState("");
  const [useremail, setUseremail] = useState("");

  return (
    <div className="bg-gray-100 h-screen pt-5 pl-6 pr-8 pb-8">
      <p className="text-[var(--primary-text-color)] font-semibold text-xl">
        Settings
      </p>

      <div className="rounded-lg mt-5 pl-3 pb-8 mr-40 bg-white shadow">
        <div className="py-4 px-3 space-y-2 border-b border-b-[var(--sidebar-option-background-color)]">
          <p className="font-medium text-base text-[var(--primary-text-color)]">
            Account Settings
          </p>
          <p className="text-xs text-[var(--tertiary-text-color)]">
            Update your account information and preferences.
          </p>
        </div>
        <div className="py-4 px-3 space-y-2">
          <p className="font-medium text-base text-[var(--primary-text-color)]">
            Name
          </p>
          <input
            className="p-3 text-xs text-[var(--tertiary-text-color)]"
            type="text"
            placeholder="John Smith"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="py-4 px-3 space-y-2">
          <p className="font-medium text-base text-[var(--primary-text-color)]">
            Email
          </p>
          <input
            className="p-3 text-xs text-[var(--tertiary-text-color)]"
            type="email"
            placeholder="john@example.com"
            value={useremail}
            onChange={(e) => setUseremail(e.target.value)}
          />
        </div>

        <div className="flex justify-end pr-8">
          <button className=" mt-5 w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-6 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
            <p>Save Changes</p>
          </button>
        </div>
      </div>

      <div className="rounded-lg mt-5 pl-3 pb-8 mr-40 bg-white shadow">
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

        <div className="flex justify-end pr-8">
          <button className=" mt-5 w-fit flex items-center justify-center space-x-3 rounded-md hover:cursor-pointer  px-6 py-2 bg-[var(--primary-button-background-color)] text-white text-center">
            <p>Save Preferences</p>
          </button>
        </div>
      </div>
    </div>
  );
}
