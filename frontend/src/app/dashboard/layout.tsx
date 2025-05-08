// app/dashboard/layout.tsx
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[250px_1fr] h-screen">
      <aside className="bg-gray-100 p-4">
        <h2 className="text-lg font-semibold mb-4">Navigation</h2>
        <ul className="space-y-2">
          <li><Link href="/dashboard">Home</Link></li>
          <li><Link href="/dashboard/profile">Profile</Link></li>
          <li><Link href="/dashboard/settings">Settings</Link></li>
        </ul>
      </aside>
      <main className="p-6 bg-white overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
