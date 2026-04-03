export const PLATFORM_ICONS = [
  { value: "other",        label: "Other / Custom",  icon: "?",  color: "bg-slate-600",   patterns: [] as string[] },
  { value: "github",       label: "GitHub",           icon: "GH", color: "bg-gray-800",    patterns: ["github.com"] },
  { value: "figma",        label: "Figma",            icon: "Fi", color: "bg-black",        patterns: ["figma.com"] },
  { value: "notion",       label: "Notion",           icon: "N",  color: "bg-neutral-900",  patterns: ["notion.so", "notion.com"] },
  { value: "googledocs",   label: "Google Docs",      icon: "GD", color: "bg-blue-500",    patterns: ["docs.google.com"] },
  { value: "googlesheets", label: "Google Sheets",    icon: "GS", color: "bg-green-600",   patterns: ["sheets.google.com"] },
  { value: "googleslides", label: "Google Slides",    icon: "SL", color: "bg-yellow-500",  patterns: ["slides.google.com"] },
  { value: "googledrive",  label: "Google Drive",     icon: "Dr", color: "bg-green-500",   patterns: ["drive.google.com"] },
  { value: "jira",         label: "Jira",             icon: "Ji", color: "bg-blue-700",    patterns: ["atlassian.net", "jira.com"] },
  { value: "confluence",   label: "Confluence",       icon: "Cf", color: "bg-blue-600",    patterns: ["confluence.atlassian"] },
  { value: "slack",        label: "Slack",            icon: "Sl", color: "bg-purple-700",  patterns: ["slack.com"] },
  { value: "linear",       label: "Linear",           icon: "Li", color: "bg-violet-600",  patterns: ["linear.app"] },
  { value: "trello",       label: "Trello",           icon: "Tr", color: "bg-blue-400",    patterns: ["trello.com"] },
  { value: "miro",         label: "Miro",             icon: "Mi", color: "bg-yellow-400",  patterns: ["miro.com"] },
  { value: "loom",         label: "Loom",             icon: "Lo", color: "bg-purple-500",  patterns: ["loom.com"] },
  { value: "dropbox",      label: "Dropbox",          icon: "Db", color: "bg-sky-500",     patterns: ["dropbox.com"] },
  { value: "airtable",     label: "Airtable",         icon: "At", color: "bg-yellow-500",  patterns: ["airtable.com"] },
  { value: "zoom",         label: "Zoom",             icon: "Zo", color: "bg-blue-600",    patterns: ["zoom.us"] },
];

export type Platform = typeof PLATFORM_ICONS[number];

export function detectPlatform(url: string): Platform {
  const lower = url.toLowerCase();
  return (
    PLATFORM_ICONS.find((p) => p.patterns.some((pat) => lower.includes(pat))) ??
    PLATFORM_ICONS[0]
  );
}

export function platformByIcon(icon: string): Platform {
  return PLATFORM_ICONS.find((p) => p.icon === icon) ?? PLATFORM_ICONS[0];
}
