"use client";
import dynamic from "next/dynamic";
import React from "react";

const GlobalTaskDetail = dynamic(() => import("@/app/components/GlobalTaskDetail"), {
  ssr: false,
});

export default function BoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      {children}
      <GlobalTaskDetail />
    </div>
  );
}
   