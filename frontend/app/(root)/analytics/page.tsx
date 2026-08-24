"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
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
  Mic,
  Code2,
  Globe,
  FileText,
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Star,
  Activity,
  Calendar,
  Clock,
} from "lucide-react";

// ── Radar chart data (Spider / Pentagon chart rendered in SVG) ──
const RADAR_AXES = [
  { label: "Comunicación Técnica", angle: -90, yourScore: 78, marketScore: 82 },
  { label: "Patrones GoF & SOLID", angle: -18, yourScore: 85, marketScore: 75 },
  { label: "Algoritmos & DS", angle: 54, yourScore: 62, marketScore: 80 },
  { label: "Inglés Profesional", angle: 126, yourScore: 71, marketScore: 78 },
  { label: "Arquitectura Cloud", angle: 198, yourScore: 58, marketScore: 72 },
];

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function radarPoints(scores: number[], cx: number, cy: number, maxR: number) {
  return RADAR_AXES.map((axis, i) => {
    const r = (scores[i] / 100) * maxR;
    const rad = ((axis.angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  })
    .map((p) => `${p.x},${p.y}`)
    .join(" ");
}

// ── Mini bar chart for weekly progress ──
const WEEKLY_DATA = [
  { day: "L", score: 44 },
  { day: "M", score: 58 },
  { day: "X", score: 52 },
  { day: "J", score: 71 },
  { day: "V", score: 68 },
  { day: "S", score: 80 },
  { day: "D", score: 74 },
];

// ── Recent activity feed ──
const ACTIVITY_FEED = [
  { icon: "🎙️", action: "Entrevista de voz completada", detail: "Frontend Senior en inglés · 84 pts", time: "Hace 2h", color: "text-indigo-300" },
  { icon: "⚔️", action: "Reto de código resuelto", detail: "Strategy Pattern + Observer · 91 pts", time: "Hace 4h", color: "text-emerald-300" },
  { icon: "📄", action: "CV analizado por IA", detail: "Score ATS: 93/100 · 2 mejoras sugeridas", time: "Ayer", color: "text-amber-300" },
  { icon: "🏗️", action: "Diseño de sistema evaluado", detail: "Push Notifications · SPOF detectado en DB", time: "Hace 2 días", color: "text-rose-300" },
];

// ── Blindspot findings from IA ──
const BLINDSPOTS = [
  {
    severity: "alta",
    finding: "Falta de métricas cuantificables en respuestas de comportamiento",
    detail: "En el 68% de tus respuestas sobre proyectos pasados describes qué hiciste, pero no mencionas impacto con números o porcentajes (ej. 'mejoré la velocidad' vs 'reduje el tiempo de carga en 42%').",
    action: "Practica con el método STAR + métricas antes de tu próxima entrevista.",
  },
  {
    severity: "media",
    finding: "Muletillas frecuentes en inglés (promedio 3.8/min)",
    detail: "Durante las sesiones en inglés se detectaron muletillas ('uhm', 'like', 'you know') a una frecuencia de 3.8 por minuto. La media de candidatos contratados es < 1 por minuto.",
    action: "Usa el simulador de voz con modo 'Inglés + feedback de fluency'.",
  },
  {
    severity: "baja",
    finding: "Algoritmos de grafos y árboles con bajo rendimiento",
    detail: "En retos que involucran BFS/DFS o estructuras de árbol tu tasa de resolución es del 38%, por debajo de tu promedio general (72%).",
    action: "Resuelve 2 retos de grafos semanales en el arena de código.",
  },
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "blindspots" | "history">("overview");
  const readinessScore = 74;
  const readinessLevel = readinessScore >= 80 ? "Senior Ready" : readinessScore >= 60 ? "Mid-Level Ready" : "Junior Ready";
  const readinessColor = readinessScore >= 80 ? "text-emerald-400" : readinessScore >= 60 ? "text-indigo-400" : "text-amber-400";
  const ringColor = readinessScore >= 80 ? "#10b981" : readinessScore >= 60 ? "#818cf8" : "#f59e0b";
  const ringOffset = 440 - (440 * readinessScore) / 100;

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Progreso & Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                Dashboard de Empleabilidad
              </span>
            </div>
          </div>
          <p className="text-zinc-400 text-xs md:text-sm max-w-2xl">
            Tu radiografía técnica completa: Índice de Empleabilidad, Radar de Competencias, Detector de Brechas y proyección salarial actualizada con cada actividad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>Última actualización: hoy, 18:42 h</span>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-950/80 border border-zinc-800 rounded-2xl w-fit">
        {[
          { id: "overview", label: "Vista General", icon: <BarChart3 className="w-3.5 h-3.5" /> },
          { id: "blindspots", label: "Brechas & Puntos Ciegos", icon: <Flame className="w-3.5 h-3.5" /> },
          { id: "history", label: "Historial de Actividad", icon: <Activity className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TAB 1: VISTA GENERAL                                      */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-8">
          {/* ── Top KPIs Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Entrevistas Completadas</span>
              <span className="text-2xl font-black text-white">14</span>
              <span className="text-[11px] text-emerald-400 font-semibold">↑ +3 esta semana</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Retos Resueltos</span>
              <span className="text-2xl font-black text-white">22</span>
              <span className="text-[11px] text-indigo-400 font-semibold">72% tasa de acierto</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Racha Actual</span>
              <span className="text-2xl font-black text-amber-400">🔥 7 días</span>
              <span className="text-[11px] text-zinc-400 font-medium">Récord personal: 12</span>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Horas de Práctica</span>
              <span className="text-2xl font-black text-white">38h</span>
              <span className="text-[11px] text-zinc-400 font-medium">Este mes</span>
            </div>
          </div>

          {/* ── Main Dashboard Grid ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── LEFT: Índice de Empleabilidad (Big Donut Ring) ── */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Índice de Empleabilidad
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                    Actualizado
                  </span>
                </div>

                {/* Big Donut Ring */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <svg className="-rotate-90" width="160" height="160" viewBox="0 0 160 160">
                      <circle cx="80" cy="80" r="70" fill="transparent" stroke="#27272a" strokeWidth="14" />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        fill="transparent"
                        stroke={ringColor}
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray="440"
                        strokeDashoffset={ringOffset}
                        style={{ transition: "stroke-dashoffset 1s ease" }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-4xl font-black font-mono ${readinessColor}`}>
                        {readinessScore}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-semibold">/ 100</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className={`text-sm font-black ${readinessColor}`}>{readinessLevel}</span>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      A 6 puntos de alcanzar nivel <span className="text-emerald-400 font-bold">Senior Ready (80+)</span>
                    </p>
                  </div>
                </div>

                {/* Score Breakdown Pillars */}
                <div className="flex flex-col gap-2.5 border-t border-zinc-800 pt-4">
                  {[
                    { label: "🎙️ Comunicación y Voz", value: 78, color: "bg-indigo-500" },
                    { label: "⚔️ Código & Patrones GoF", value: 85, color: "bg-emerald-500" },
                    { label: "🌍 Inglés Técnico CEFR", value: 71, color: "bg-amber-500" },
                    { label: "📄 Score ATS del CV", value: 93, color: "bg-cyan-500" },
                  ].map((pillar) => (
                    <div key={pillar.label} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-300 font-medium">{pillar.label}</span>
                        <span className="text-white font-bold font-mono">{pillar.value}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-zinc-800">
                        <div
                          className={`h-full rounded-full ${pillar.color}`}
                          style={{ width: `${pillar.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Salary projection */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-indigo-950/30 border border-emerald-500/20 flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">💰 Rango Salarial Proyectado</span>
                  <span className="text-lg font-black text-white">$3,800 - $5,400 USD/mes</span>
                  <span className="text-[11px] text-zinc-400">Remoto LatAm · Empresas Tech EE.UU.</span>
                </div>
              </div>
            </div>

            {/* ── CENTER: Radar de Competencias Técnicas (SVG Spider Chart) ── */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl flex flex-col gap-4 h-full">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Radar de Competencias
                  </h2>
                  <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" /> Tú
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-zinc-600 inline-block" /> Mercado
                    </span>
                  </div>
                </div>

                {/* SVG Radar Chart */}
                <div className="flex items-center justify-center flex-1">
                  <svg viewBox="0 0 260 240" className="w-full max-w-[280px]">
                    {/* Background rings */}
                    {[20, 40, 60, 80, 100].map((pct) => {
                      const r = (pct / 100) * 90;
                      const pts = RADAR_AXES.map((axis) => {
                        const rad = ((axis.angle - 90) * Math.PI) / 180;
                        return `${130 + r * Math.cos(rad)},${120 + r * Math.sin(rad)}`;
                      }).join(" ");
                      return (
                        <polygon
                          key={pct}
                          points={pts}
                          fill="none"
                          stroke="#27272a"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Axis lines */}
                    {RADAR_AXES.map((axis) => {
                      const rad = ((axis.angle - 90) * Math.PI) / 180;
                      const end = { x: 130 + 90 * Math.cos(rad), y: 120 + 90 * Math.sin(rad) };
                      return (
                        <line
                          key={axis.label}
                          x1="130"
                          y1="120"
                          x2={end.x}
                          y2={end.y}
                          stroke="#3f3f46"
                          strokeWidth="1"
                        />
                      );
                    })}

                    {/* Market benchmark polygon */}
                    <polygon
                      points={radarPoints(
                        RADAR_AXES.map((a) => a.marketScore),
                        130, 120, 90
                      )}
                      fill="#52525220"
                      stroke="#71717a"
                      strokeWidth="1.5"
                    />

                    {/* Your scores polygon */}
                    <polygon
                      points={radarPoints(
                        RADAR_AXES.map((a) => a.yourScore),
                        130, 120, 90
                      )}
                      fill="#6366f130"
                      stroke="#818cf8"
                      strokeWidth="2"
                    />

                    {/* Score dots */}
                    {RADAR_AXES.map((axis) => {
                      const r = (axis.yourScore / 100) * 90;
                      const rad = ((axis.angle - 90) * Math.PI) / 180;
                      return (
                        <circle
                          key={axis.label}
                          cx={130 + r * Math.cos(rad)}
                          cy={120 + r * Math.sin(rad)}
                          r="4"
                          fill="#818cf8"
                          stroke="#1e1b4b"
                          strokeWidth="1.5"
                        />
                      );
                    })}

                    {/* Axis labels */}
                    {RADAR_AXES.map((axis) => {
                      const r = 108;
                      const rad = ((axis.angle - 90) * Math.PI) / 180;
                      const x = 130 + r * Math.cos(rad);
                      const y = 120 + r * Math.sin(rad);
                      return (
                        <text
                          key={axis.label}
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="8.5"
                          fill="#a1a1aa"
                          fontWeight="600"
                        >
                          {axis.label.split(" ").map((word, wi) => (
                            <tspan key={wi} x={x} dy={wi === 0 ? "-0.5em" : "1.2em"}>
                              {word}
                            </tspan>
                          ))}
                        </text>
                      );
                    })}
                  </svg>
                </div>

                {/* Score Breakdown List */}
                <div className="flex flex-col gap-1.5 border-t border-zinc-800 pt-3">
                  {RADAR_AXES.map((axis) => (
                    <div key={axis.label} className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400">{axis.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-zinc-600 font-mono">{axis.marketScore}</span>
                        <span className="text-zinc-600">vs</span>
                        <span
                          className={`font-bold font-mono ${
                            axis.yourScore >= axis.marketScore ? "text-emerald-400" : "text-amber-400"
                          }`}
                        >
                          {axis.yourScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Weekly Progress Bar Chart + Actions ── */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              {/* Weekly Progress Bar Chart */}
              <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Progreso Esta Semana
                  </h2>
                  <span className="text-[11px] text-indigo-400 font-semibold">Promedio: 71 pts</span>
                </div>

                {/* Bar Chart */}
                <div className="flex items-end gap-2 h-24">
                  {WEEKLY_DATA.map((d, i) => (
                    <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
                      <span className="text-[10px] text-zinc-500 font-mono">{d.score}</span>
                      <div className="w-full rounded-t-lg bg-zinc-950 flex items-end" style={{ height: "72px" }}>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            i === WEEKLY_DATA.length - 2
                              ? "bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                              : i === WEEKLY_DATA.length - 1
                              ? "bg-zinc-700"
                              : "bg-zinc-800"
                          }`}
                          style={{ height: `${(d.score / 100) * 72}px` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 font-semibold">{d.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Achievements */}
              <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-xl flex flex-col gap-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Logros Recientes
                </h2>
                <div className="flex flex-col gap-2">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
                    <span className="text-lg">🏆</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-amber-300">Racha de 7 días activa</span>
                      <span className="text-[10px] text-zinc-400">Practica 3 días más para lograr tu récord</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5">
                    <span className="text-lg">⚔️</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-emerald-300">Maestro de Strategy Pattern</span>
                      <span className="text-[10px] text-zinc-400">5 retos con Strategy resueltos sin errores</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2.5">
                    <span className="text-lg">🌍</span>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-indigo-300">Primera entrevista en inglés</span>
                      <span className="text-[10px] text-zinc-400">Score: 71/100 · Nivel B2 confirmado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA: Next AI Recommendations */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/50 to-violet-950/30 border border-indigo-500/20 shadow-xl flex flex-col gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Recomendación de la IA para hoy</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Practica <strong className="text-white">2 retos de grafos BFS/DFS</strong> y una entrevista de voz de arquitectura cloud para subir tu índice +6 puntos y alcanzar <strong className="text-emerald-400">Senior Ready</strong>.
                </p>
                <Link
                  href="/interview"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <span>🎙️ Empezar Entrevista Recomendada</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TAB 2: BRECHAS & PUNTOS CIEGOS                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "blindspots" && (
        <div className="flex flex-col gap-6">
          {/* Blindspot Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 to-rose-950/20 border border-rose-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-500/10">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white">Detector de Brechas y Debilidades</h2>
                <p className="text-xs text-zinc-400">
                  Gemini analizó tus <strong className="text-white">14 entrevistas</strong> y <strong className="text-white">22 retos</strong> para identificar patrones recurrentes de error.
                </p>
              </div>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold">
              3 brechas detectadas
            </div>
          </div>

          {/* Blindspot Cards */}
          <div className="flex flex-col gap-5">
            {BLINDSPOTS.map((blindspot, i) => (
              <div
                key={i}
                className={`p-6 rounded-3xl border shadow-xl flex flex-col gap-4 ${
                  blindspot.severity === "alta"
                    ? "bg-gradient-to-b from-rose-950/30 to-zinc-900 border-rose-500/30"
                    : blindspot.severity === "media"
                    ? "bg-gradient-to-b from-amber-950/30 to-zinc-900 border-amber-500/30"
                    : "bg-gradient-to-b from-zinc-900/80 to-zinc-950 border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        blindspot.severity === "alta"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : blindspot.severity === "media"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                      }`}
                    >
                      {blindspot.severity === "alta" ? "⚠️ Prioridad Alta" : blindspot.severity === "media" ? "⚡ Prioridad Media" : "💡 Prioridad Baja"}
                    </span>
                    <h3 className="text-sm font-bold text-white">{blindspot.finding}</h3>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed border-l-2 border-zinc-700 pl-4">
                  {blindspot.detail}
                </p>

                <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex items-center gap-2.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-zinc-300">
                    <strong className="text-white">Plan de acción IA:</strong> {blindspot.action}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/*  TAB 3: HISTORIAL DE ACTIVIDAD                             */}
      {/* ══════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div className="flex flex-col gap-5">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider px-1">
            Actividad Reciente (Últimos 7 días)
          </h2>

          <div className="flex flex-col gap-3">
            {ACTIVITY_FEED.map((item, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between gap-4 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold ${item.color}`}>{item.action}</span>
                    <span className="text-[11px] text-zinc-400">{item.detail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {item.time}
                  </span>
                  <ChevronRight className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center py-6">
            <button className="px-5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer transition-colors">
              Cargar más actividad
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
