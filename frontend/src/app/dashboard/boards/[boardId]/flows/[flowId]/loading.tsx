export default function FlowEditorLoading() {
  return (
    <div className="flex flex-col h-screen w-screen bg-gray-950 animate-pulse">
      {/* Toolbar skeleton */}
      <div className="h-14 w-full bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-3 flex-shrink-0">
        <div className="h-6 w-6 rounded bg-gray-700" />
        <div className="h-4 w-32 rounded bg-gray-700" />
        <div className="flex-1" />
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-7 w-16 rounded bg-gray-700" />
        ))}
        <div className="flex-1" />
        <div className="h-7 w-24 rounded bg-gray-700" />
        <div className="h-7 w-20 rounded bg-gray-700" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar skeleton */}
        <div className="w-14 bg-gray-900 border-r border-gray-800 flex flex-col items-center gap-3 py-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-10 w-10 rounded-lg bg-gray-700" />
          ))}
        </div>

        {/* Canvas skeleton */}
        <div className="flex-1 bg-gray-950 relative overflow-hidden">
          {/* Dot grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#6b7280" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Fake nodes */}
          <div className="absolute top-1/3 left-1/3 w-32 h-16 rounded-lg bg-gray-800 border border-gray-700" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-gray-800 border border-gray-700" />
          <div className="absolute top-1/4 left-1/2 w-28 h-14 rounded-lg bg-gray-800 border border-gray-700" />
        </div>
      </div>
    </div>
  );
}
