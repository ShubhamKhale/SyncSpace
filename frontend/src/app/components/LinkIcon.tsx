"use client";
import React, { useState } from "react";
import { detectPlatform } from "@/app/lib/platformIcons";

const FALLBACK_COLORS = ["bg-indigo-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-violet-500", "bg-cyan-600"];

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Icon for an external link: the site's favicon (via Google's favicon
 * service — only the domain is sent), falling back to the known-platform
 * badge or the domain's first letter on a colour derived from the domain.
 */
export default function LinkIcon({ url, size = 32 }: { url: string; size?: number }) {
  const host = hostOf(url);
  const [failed, setFailed] = useState(false);

  if (host && !failed) {
    return (
      <div
        className="flex-shrink-0 flex items-center justify-center rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600"
        style={{ width: size, height: size }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- tiny external favicon; next/image would need remotePatterns for no benefit */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`}
          alt=""
          width={size * 0.55}
          height={size * 0.55}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  const platform = detectPlatform(url);
  let label = platform.icon;
  let color = platform.color;
  if (platform.value === "other") {
    label = (host[0] ?? "?").toUpperCase();
    let h = 0;
    for (let i = 0; i < host.length; i++) h = host.charCodeAt(i) + ((h << 5) - h);
    color = FALLBACK_COLORS[Math.abs(h) % FALLBACK_COLORS.length];
  }
  return (
    <div
      className={`flex-shrink-0 flex items-center justify-center rounded-md text-white text-xs font-bold ${color}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {label}
    </div>
  );
}
