"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  Sparkles,
  TrendingUp,
  Target,
  Flame,
  Award,
  Zap,
  CheckCircle2,
  DollarSign,
  Layers,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Progreso, Estadísticas & Readiness
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                    Dashboard de Empleabilidad
                  </span>
                </div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              Métricas consolidadas de tu rendimiento en entrevistas de voz, dominio de patrones de diseño, nivel de inglés CEFR y puntos ciegos detectados por IA.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800/80 w-full" />

      {/* Main Preview Container */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#181635]/40 via-zinc-950 to-zinc-950 border border-zinc-800/80 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center gap-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6366f108_1px,transparent_1px),linear-gradient(to_bottom,#6366f108_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-xl">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Developer Readiness Index & Analytics
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Consolidará tus resultados en todas las áreas de la plataforma para proyectar tu nivel de preparación y estimar tu rango salarial objetivo.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl text-left">
          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <Target className="w-4 h-4" /> Readiness Index (0-100)
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Algoritmo de empleabilidad que pondera voz, código, inglés y CV.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Layers className="w-4 h-4" /> Radar de Habilidades
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Spider chart comparando tu perfil contra candidatos contratados en EE.UU.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Flame className="w-4 h-4" /> Detector de Puntos Ciegos
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              La IA identifica patrones de error recurrentes en tus respuestas.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <DollarSign className="w-4 h-4" /> Estimador Salarial
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Proyección de rango salarial mensual (USD) según tu nivel técnico.
            </p>
          </div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Módulo listo en el menú de navegación para su futura construcción
        </div>
      </div>
    </div>
  );
}
