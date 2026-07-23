"use client";
import React, { useRef, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { Copy, Check } from "lucide-react";
import "./jsonViewer.css";

interface JsonViewerProps {
  jsonString: string;
  toggleRightSidebar: () => void;
}

function highlight(json: string): string {
  return json
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = "json-number";
        if (/^"/.test(match)) {
          cls = /:$/.test(match) ? "json-key" : "json-string";
        } else if (/true|false/.test(match)) {
          cls = "json-bool";
        } else if (/null/.test(match)) {
          cls = "json-null";
        }
        return `<span class="${cls}">${match}</span>`;
      }
    );
}

const JsonViewer: React.FC<JsonViewerProps> = ({ jsonString, toggleRightSidebar }) => {
  const [copied, setCopied] = useState(false);
  const observedDiv = useRef<HTMLDivElement>(null);

  let prettyJson: string;
  try {
    prettyJson = JSON.stringify(JSON.parse(jsonString), null, 2);
  } catch {
    prettyJson = "Invalid JSON string";
  }

  const copyAll = async () => {
    await navigator.clipboard.writeText(prettyJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div ref={observedDiv} className="w-full h-full flex flex-col json-viewer overflow-hidden bg-[#1e1e1e]">
      {/* Toolbar */}
      <div className="flex flex-row h-12 justify-between items-center px-4 border-b border-[#333] flex-shrink-0">
        <span className="text-[#9DA5B4] text-xs font-mono">diagram.json</span>
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-[#9DA5B4] hover:text-white text-xs px-2 py-1 bg-[#2d2d2d] hover:bg-[#383838] rounded transition"
            onClick={copyAll}
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            onClick={toggleRightSidebar}
            className="text-[#9DA5B4] hover:text-white p-1 rounded hover:bg-[#383838] transition"
          >
            <IoMdClose size={16} />
          </button>
        </div>
      </div>

      {/* JSON content */}
      <div className="flex-1 overflow-auto">
        <pre
          className="text-xs font-mono p-4 leading-relaxed whitespace-pre"
          dangerouslySetInnerHTML={{ __html: highlight(prettyJson) }}
        />
      </div>
    </div>
  );
};

export default JsonViewer;
