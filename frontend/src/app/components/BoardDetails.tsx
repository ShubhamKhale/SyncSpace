"use client";

import React, { useState } from "react";
import { Layout, Calendar, Grid, Save } from "lucide-react";
import FilterIcon from "../icons/FilterIcon";
import SelectPopover from "./SelectPopover";

const BoardDetails: React.FC = () => {
  const [phaseFilter,       setPhaseFilter]       = useState("Phase");
  const [priorityFilter,    setPriorityFilter]    = useState("Priority");
  const [contributorFilter, setContributorFilter] = useState("Contributor");
  const [labelFilter,       setLabelFilter]       = useState("Label");

  return (
    <div className="p-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100">
            Product Launch Q4
          </h1>
          <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-slate-400 mt-1 gap-2">
            <div className="inline-flex items-center space-x-2">
              <FilterIcon />
              <p>Filters:</p>
            </div>
            <SelectPopover
              value={phaseFilter}
              onChange={setPhaseFilter}
              options={[
                { value: "Phase",       label: "Phase" },
                { value: "Planning",    label: "Planning" },
                { value: "Design",      label: "Design" },
                { value: "Development", label: "Development" },
              ]}
              triggerClassName="border border-gray-300 dark:border-slate-600 rounded-md text-sm px-2 py-1 text-gray-700 dark:text-slate-300"
              dropdownClassName="min-w-[120px]"
            />
            <SelectPopover
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: "Priority", label: "Priority" },
                { value: "High",     label: "High" },
                { value: "Medium",   label: "Medium" },
                { value: "Low",      label: "Low" },
              ]}
              triggerClassName="border border-gray-300 dark:border-slate-600 rounded-md text-sm px-2 py-1 text-gray-700 dark:text-slate-300"
              dropdownClassName="min-w-[110px]"
            />
            <SelectPopover
              value={contributorFilter}
              onChange={setContributorFilter}
              options={[
                { value: "Contributor", label: "Contributor" },
                { value: "Sarah",       label: "Sarah" },
                { value: "Alex",        label: "Alex" },
                { value: "Maria",       label: "Maria" },
              ]}
              triggerClassName="border border-gray-300 dark:border-slate-600 rounded-md text-sm px-2 py-1 text-gray-700 dark:text-slate-300"
              dropdownClassName="min-w-[130px]"
            />
            <SelectPopover
              value={labelFilter}
              onChange={setLabelFilter}
              options={[
                { value: "Label",   label: "Label" },
                { value: "UI",      label: "UI" },
                { value: "Backend", label: "Backend" },
                { value: "QA",      label: "QA" },
              ]}
              triggerClassName="border border-gray-300 dark:border-slate-600 rounded-md text-sm px-2 py-1 text-gray-700 dark:text-slate-300"
              dropdownClassName="min-w-[110px]"
            />
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-1 border border-gray-300 dark:border-slate-600 px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:cursor-pointer transition">
            <Layout size={16} />
            Kanban
          </button>
          <button className="flex items-center gap-1 border border-gray-300 dark:border-slate-600 px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:cursor-pointer transition">
            <Calendar size={16} />
            Timeline
          </button>
          <button className="flex items-center gap-1 border border-gray-300 dark:border-slate-600 px-3 py-1.5 rounded-md text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:cursor-pointer transition">
            <Grid size={16} />
            Matrix
          </button>
          <button className="flex items-center gap-1 text-blue-600 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-md text-sm hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:cursor-pointer transition">
            <Save size={16} />
            Save view
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardDetails;
