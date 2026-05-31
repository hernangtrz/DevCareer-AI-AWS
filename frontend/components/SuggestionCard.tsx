"use client";

import { CheckCircle2, ChevronRight, HelpCircle, FileText, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Suggestion {
  category: "formatting" | "impact" | "grammar" | "structure";
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
}

interface SuggestionCardProps {
  suggestions: Suggestion[];
}

const SuggestionCard = ({ suggestions }: SuggestionCardProps) => {
  const getSeverityBadge = (sev: Suggestion["severity"]) => {
    switch (sev) {
      case "high":
        return "bg-rose-500/10 border-rose-500/20 text-rose-400";
      case "medium":
        return "bg-amber-500/10 border-amber-500/20 text-amber-400";
      case "low":
        return "bg-sky-500/10 border-sky-500/20 text-sky-400";
    }
  };

  const getSeverityLabel = (sev: Suggestion["severity"]) => {
    switch (sev) {
      case "high":
        return "Prioridad Alta";
      case "medium":
        return "Recomendado";
      case "low":
        return "Sugerencia";
    }
  };

  const getCategoryIcon = (cat: Suggestion["category"]) => {
    switch (cat) {
      case "formatting":
        return <FileText className="h-4 w-4 text-sky-400" />;
      case "impact":
        return <ShieldCheck className="h-4 w-4 text-emerald-400" />;
      case "grammar":
        return <AlertTriangle className="h-4 w-4 text-rose-400" />;
      case "structure":
        return <HelpCircle className="h-4 w-4 text-amber-400" />;
    }
  };

  return (
    <div className="card-border">
      <div className="card p-5 flex flex-col gap-4">
        <h3 className="text-white text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-indigo-400" />
          Plan de acción y mejoras sugeridas
        </h3>
        <p className="text-white/50 text-[11px] leading-relaxed">
          Sigue estas recomendaciones de optimización paso a paso para incrementar el impacto de tu currículum frente al ATS y reclutadores.
        </p>

        <div className="flex flex-col gap-3 mt-2">
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-dark-200 border border-white/5 flex gap-3.5 items-start hover:border-white/10 transition-colors"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-dark-300 border border-white/10 flex items-center justify-center">
                {getCategoryIcon(s.category)}
              </span>

              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-xs">{s.title}</span>
                  <span className={cn("px-1.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider", getSeverityBadge(s.severity))}>
                    {getSeverityLabel(s.severity)}
                  </span>
                </div>
                <p className="text-white/45 text-[11px] leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;
