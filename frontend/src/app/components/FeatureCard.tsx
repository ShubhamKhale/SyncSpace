// components/FeatureCard.tsx
import React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}


const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon }) => {
  return (
    <div className="px-8 py-6 space-y-2 bg-white border-2 border-[#E5E7EB] rounded-2xl max-w-sm">
      <div className="flex items-center justify-center w-12 h-12 bg-[#DBEAFE] rounded-lg">
        {icon}
      </div>
      <p className="text-[#111827] font-semibold text-lg">{title}</p>
      <p className="text-[#4B5563] text-sm">{description}</p>
    </div>
  );
};

export default FeatureCard;
