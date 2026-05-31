"use client";

import { cn } from "@/lib/utils";
import { CheckCircle } from "lucide-react";

interface CvTemplateCardProps {
  id: string;
  name: string;
  description: string;
  accentColor: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
  preview: React.ReactNode;
}

const CvTemplateCard = ({
  id,
  name,
  description,
  accentColor,
  isSelected,
  onSelect,
  preview,
}: CvTemplateCardProps) => {
  return (
    <button
      onClick={() => onSelect(id)}
      className={cn(
        "relative group flex flex-col gap-3 p-4 rounded-2xl border-2 transition-all text-left cursor-pointer",
        isSelected
          ? "border-indigo-500 bg-indigo-500/10 shadow-[0_0_20px_rgba(99,102,241,0.25)]"
          : "border-white/10 bg-dark-200 hover:border-indigo-500/40 hover:bg-dark-200/80"
      )}
    >
      {/* Template visual preview */}
      <div className="relative w-full aspect-[3/4] rounded-xl overflow-hidden bg-white/5 flex items-stretch">
        {preview}
        {isSelected && (
          <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-indigo-400 drop-shadow-lg" />
          </div>
        )}
      </div>

      {/* Accent bar */}
      <div
        className="w-full h-1 rounded-full opacity-80"
        style={{ background: accentColor }}
      />

      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            "font-semibold text-sm",
            isSelected ? "text-indigo-300" : "text-white"
          )}
        >
          {name}
        </span>
        <span className="text-white/40 text-xs">{description}</span>
      </div>
    </button>
  );
};

export default CvTemplateCard;
