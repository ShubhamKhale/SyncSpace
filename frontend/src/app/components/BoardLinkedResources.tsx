"use client";

import React, { useEffect, useState } from "react";
import { FileText, Pencil } from "lucide-react";
import ExternalLinkIcon from "../icons/ExternalLinkIcon";
import { useLinkedResourcesStore } from "@/app/store/useLinkedResourcesStore";
import { LinkedResourcesSkeleton } from "./Skeleton";
import EditLinkedResourcesModal from "./EditLinkedResourcesModal";

const BoardLinkedResources: React.FC<{ boardId?: string }> = ({ boardId }) => {
  const { loading, documentationLinks, links, fetchResources, saveLinkedResources } =
    useLinkedResourcesStore();

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    if (boardId) fetchResources(boardId);
  }, [boardId, fetchResources]);

  if (loading) return <LinkedResourcesSkeleton />;

  return (
    <div className="w-full h-full flex flex-col border-l border-slate-300 dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 overflow-y-auto scrollbar-hide">
      <div className="px-4 py-5 space-y-6">

        {/* ── Board Documentation ─────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Board Documentation
            </p>
            <button
              onClick={() => setShowModal(true)}
              title="Edit linked resources"
              className="text-slate-400 hover:text-slate-600 hover:cursor-pointer transition"
            >
              <Pencil size={14} />
            </button>
          </div>

          <ul className="space-y-2 text-sm">
            {documentationLinks.map((doc, idx) => (
              <li key={idx} className="flex items-start space-x-2 rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 rounded-md border border-blue-200">
                  <FileText size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{doc.title}</p>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                  >
                    {doc.url}
                  </a>
                  {doc.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{doc.description}</p>
                  )}
                </div>
              </li>
            ))}

            {documentationLinks.length === 0 && (
              <p className="text-xs text-slate-400 italic px-2">No documentation links yet.</p>
            )}
          </ul>
        </section>

        {/* Divider */}
        <div className="border-t border-slate-300 dark:border-slate-700" />

        {/* ── Linked Resources ────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
              Linked Resources
            </p>
          </div>

          <ul className="space-y-1">
            {links.map((link, idx) => (
              <li key={idx} className="flex items-center justify-between rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-2 transition">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-md text-white text-xs font-bold ${link.color}`}>
                    {link.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{link.title}</p>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 truncate block max-w-[100px] md:max-w-[140px]"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>
                <a href={link.url} target="_blank" rel="noreferrer" className="shrink-0 hover:cursor-pointer ml-2">
                  <ExternalLinkIcon className="text-slate-400 hover:text-blue-600 transition" />
                </a>
              </li>
            ))}

            {links.length === 0 && (
              <p className="text-xs text-slate-400 italic px-2">No resource links yet.</p>
            )}
          </ul>
        </section>

      </div>

      {/* Edit Modal */}
      {showModal && (
        <EditLinkedResourcesModal
          initialDocs={documentationLinks}
          initialLinks={links}
          isSaving={isSaving}
          onSave={async (docs, updatedLinks) => {
            setIsSaving(true);
            await saveLinkedResources(docs, updatedLinks);
            setIsSaving(false);
            setShowModal(false);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default BoardLinkedResources;
