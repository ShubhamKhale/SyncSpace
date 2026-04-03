"use client"

import DiagramFrame from "../components/flow/DiagramFrame"
import { Toaster } from "../components/flow/Toast/toaster"

export default function FlowPage() {
  return (
    <main className="font-mono text-black dark:text-white">
      <div className="flex flex-col min-h-screen">
        <div className="hidden h-16 items-center justify-between bg-green-300">
          <h1 className="">Header</h1>
        </div>
        <div
          style={{
            height: "calc(100vh)",
            width: "100vw",
          }}
        >
          <DiagramFrame />
          <Toaster />
        </div>
      </div>
    </main>
  )
}