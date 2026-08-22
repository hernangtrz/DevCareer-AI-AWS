"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Cpu, Sparkles, Layers, ShieldCheck, Database, Network, Zap } from "lucide-react";

export default function SystemDesignPage() {
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
              <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                    System Design Simulator
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                    Módulo de Arquitectura
                  </span>
                </div>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              Pizarra interactiva para diseñar arquitecturas de software cloud y evaluar cuellos de botella, tolerancia a fallos y estimación de costos con IA.
            </p>
          </div>
        </div>
      </div>

      <div className="h-px bg-zinc-800/80 w-full" />

      {/* Main Canvas / Feature Teaser Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#1c1917]/40 via-zinc-950 to-zinc-950 border border-zinc-800/80 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center gap-8">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b08_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b08_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center gap-4 max-w-xl">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Network className="w-8 h-8" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Pizarra Interactiva de Arquitectura Cloud
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Arrastra componentes distribuidos (Load Balancers, Microservicios, Redis Cache, DynamoDB, Queues) y simula millones de peticiones por segundo con diagnóstico de IA en tiempo real.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <Layers className="w-4 h-4" /> Canvas Interactivo
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Modelado con Composite & Command Pattern (Undo/Redo en vivo).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" /> Detección de SPOF
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Auditoría de puntos únicos de falla y tolerancia a caídas en la nube.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <Database className="w-4 h-4" /> Teorema CAP
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Validación de consistencia vs disponibilidad en bases de datos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-pink-400 font-semibold text-xs">
              <Zap className="w-4 h-4" /> Simulación de Carga
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Inyección de tráfico sintético para medir cuellos de botella con Gemini.
            </p>
          </div>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
          <Sparkles className="w-4 h-4" /> Módulo listo para su construcción y conexión de componentes
        </div>
      </div>
    </div>
  );
}
