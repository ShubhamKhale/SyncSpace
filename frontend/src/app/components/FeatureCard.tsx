import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="px-6 py-6 space-y-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
      <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 dark:bg-indigo-500/15 rounded-lg text-indigo-600 dark:text-indigo-400">
        {icon}
      </div>
      <p className="text-slate-900 dark:text-slate-100 font-semibold text-base">{title}</p>
      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
};

export default FeatureCard;
