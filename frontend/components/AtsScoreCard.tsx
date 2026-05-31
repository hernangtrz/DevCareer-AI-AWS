"use client";

import { motion } from "framer-motion";
import { Award, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface AtsScoreCardProps {
  score: number;
  breakdown: {
    keywords: number;
    formatting: number;
    grammar: number;
    impact: number;
  };
}

const AtsScoreCard = ({ score, breakdown }: AtsScoreCardProps) => {
  // Determine color theme based on score
  const getScoreTheme = (val: number) => {
    if (val >= 80) return { text: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20" };
    if (val >= 60) return { text: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10", glow: "shadow-amber-500/20" };
    return { text: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10", glow: "shadow-rose-500/20" };
  };

  const theme = getScoreTheme(score);
  const strokeDashoffset = 282.7 - (282.7 * score) / 100;

  return (
    <div className="card-border">
      <div className="card p-6 flex flex-col md:flex-row gap-8 items-center">
        {/* Radial Progress Chart */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="72"
              cy="72"
              r="45"
              className="stroke-dark-300 fill-none"
              strokeWidth="10"
            />
            <motion.circle
              cx="72"
              cy="72"
              r="45"
              className={cn("fill-none transition-colors duration-500", 
                score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-amber-500" : "stroke-rose-500"
              )}
              strokeWidth="10"
              strokeDasharray="282.7"
              initial={{ strokeDashoffset: 282.7 }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <motion.span 
              className={cn("text-3xl font-extrabold tracking-tight", theme.text)}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {score}%
            </motion.span>
            <span className="text-[10px] text-white/40 uppercase font-semibold tracking-wider">
              Score ATS
            </span>
          </div>
        </div>

        {/* Breakdown details */}
        <div className="flex-1 flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1">
            <h3 className="text-white text-lg font-bold flex items-center gap-2">
              <Award className={cn("h-5 w-5", theme.text)} />
              Análisis de Compatibilidad
            </h3>
            <p className="text-white/50 text-xs">
              {score >= 80 
                ? "¡Excelente! Tu currículum tiene una alta probabilidad de superar los filtros automáticos ATS para esta oferta."
                : score >= 60
                ? "Buen intento, pero tu currículum necesita ajustes clave para destacar sobre otros candidatos en los filtros ATS."
                : "Crítico. Tu currículum no cumple con la compatibilidad mínima requerida por los filtros de esta oferta."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            {[
              { label: "Palabras clave", val: breakdown.keywords, color: "text-fuchsia-400" },
              { label: "Formato y legibilidad", val: breakdown.formatting, color: "text-sky-400" },
              { label: "Gramática y estilo", val: breakdown.grammar, color: "text-emerald-400" },
              { label: "Impacto y métricas", val: breakdown.impact, color: "text-amber-400" }
            ].map((item) => (
              <div key={item.label} className="p-3 bg-dark-200 rounded-xl border border-white/5 flex flex-col gap-1.5">
                <span className="text-[11px] text-white/50 font-medium">{item.label}</span>
                <div className="flex items-center justify-between">
                  <div className="h-1.5 bg-dark-300 rounded-full flex-1 mr-3 overflow-hidden">
                    <motion.div 
                      className={cn("h-full rounded-full", item.color.replace("text", "bg"))}
                      initial={{ width: 0 }}
                      animate={{ width: `${item.val}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <span className={cn("text-xs font-bold", item.color)}>{item.val}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtsScoreCard;
