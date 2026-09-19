import type { Components } from "react-markdown";

export const aiMarkdownComponents: Components = {
  p: ({ ...props }) => <p className="mb-2 last:mb-0" {...props} />,
  strong: ({ ...props }) => <strong className="font-semibold" {...props} />,
  ul: ({ ...props }) => <ul className="list-disc pl-5 mb-2 space-y-0.5" {...props} />,
  ol: ({ ...props }) => <ol className="list-decimal pl-5 mb-2 space-y-0.5" {...props} />,
  li: ({ ...props }) => <li {...props} />,
  a: ({ ...props }) => (
    <a
      className="text-indigo-600 dark:text-indigo-400 hover:underline break-all"
      target="_blank"
      rel="noreferrer"
      {...props}
    />
  ),
  h1: ({ ...props }) => <h3 className="text-sm font-semibold mt-1 mb-2" {...props} />,
  h2: ({ ...props }) => <h3 className="text-sm font-semibold mt-1 mb-2" {...props} />,
  h3: ({ ...props }) => <h3 className="text-sm font-semibold mt-1 mb-2" {...props} />,
  code: ({ ...props }) => (
    <code className="bg-slate-200 dark:bg-slate-600 rounded px-1 py-0.5 text-xs font-mono" {...props} />
  ),
  table: ({ ...props }) => (
    <div className="overflow-x-auto mb-2 rounded-lg border border-slate-200 dark:border-slate-600">
      <table className="w-full text-xs border-collapse" {...props} />
    </div>
  ),
  thead: ({ ...props }) => <thead className="bg-slate-200 dark:bg-slate-600" {...props} />,
  th: ({ ...props }) => (
    <th className="text-left font-semibold px-2.5 py-1.5 border-b border-slate-300 dark:border-slate-500" {...props} />
  ),
  td: ({ ...props }) => (
    <td className="px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-700 align-top" {...props} />
  ),
};
