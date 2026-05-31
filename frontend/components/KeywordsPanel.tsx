"use client";

import { CheckCircle, AlertCircle, PlusCircle, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeywordsPanelProps {
  matchedKeywords: string[];
  missingKeywords: string[];
}

const KeywordsPanel = ({ matchedKeywords, missingKeywords }: KeywordsPanelProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      {/* ─── Matched Keywords ─── */}
      <div className="card-border">
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              Palabras clave encontradas
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
              {matchedKeywords.length} Coincidencias
            </span>
          </div>
          <p className="text-white/50 text-[11px] leading-relaxed">
            Estos términos clave coinciden perfectamente con los requisitos de la oferta y mejoran tu relevancia.
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {matchedKeywords.map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold"
              >
                <CheckCircle className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Missing Keywords ─── */}
      <div className="card-border">
        <div className="card p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-400" />
              Palabras clave faltantes
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold">
              {missingKeywords.length} Faltantes
            </span>
          </div>
          <p className="text-white/50 text-[11px] leading-relaxed">
            Considera agregar estratégicamente estas palabras clave en tu experiencia o habilidades para mejorar tu score.
          </p>

          <div className="flex flex-wrap gap-2 mt-2">
            {missingKeywords.map((kw) => (
              <span
                key={kw}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-400/20 text-rose-300 text-xs font-semibold"
              >
                <PlusCircle className="h-3 w-3 text-rose-400 flex-shrink-0" />
                {kw}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordsPanel;
