"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, Sparkles, Target, Zap, FileText, Mic, CheckCircle2 } from "lucide-react";

export default function JobsPage() {
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
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    Smart Job Portal & 1-Click Match
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    Portal de Empleo & IA
                  </span>
                </div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              Feed unificado de ofertas laborales con AI Match Score (%), auto-rellenado de postulaciones desde tu CV y simulación de entrevista a la medida de la vacante.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800/80 w-full" />

      {/* Main Teaser & Workflow View */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#064e3b]/20 via-zinc-950 to-zinc-950 border border-zinc-800/80 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center gap-8">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98108_1px,transparent_1px),linear-gradient(to_bottom,#10b98108_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-xl">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
            <Target className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Postulación Inteligente y Match de Ofertas
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Conecta tu perfil con vacantes reales de LinkedIn, Indeed y portales tech. Aplica en segundos con autofill inteligente y entrena antes de la llamada real.
          </p>
        </div>

        {/* Workflow Steps Preview */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Zap className="w-4 h-4" /> 1. Match Score (%)
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Cálculo de afinidad entre tus habilidades y los requerimientos de la oferta.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <FileText className="w-4 h-4" /> 2. Autofill & Faltantes
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Auto-completa el formulario con tu CV y alerta sobre datos faltantes requeridos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
              <Sparkles className="w-4 h-4" /> 3. Cover Letter IA
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Genera o pule respuestas y cartas de presentación adaptadas a la empresa.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
              <Mic className="w-4 h-4" /> 4. Simular Entrevista
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              1-Click para iniciar una entrevista de voz con el stack exacto de la vacante.
            </p>
          </div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" /> Módulo listo para su construcción y conexión con APIs
        </div>
      </div>
    </div>
  );
}
