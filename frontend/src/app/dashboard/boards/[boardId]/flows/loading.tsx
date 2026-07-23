export default function FlowsLoading() {
  return (
    <div className="p-6 bg-[#F8F9FC] dark:bg-slate-900 min-h-full">
      <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 h-52 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
