export default function OnboardingLoading() {
  return (
    <div className="min-h-screen bg-[var(--primary-background-color)] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-center gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
              {i < 3 && <div className="w-16 h-0.5 bg-gray-200 animate-pulse" />}
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
          <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse mt-6" />
          <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}
