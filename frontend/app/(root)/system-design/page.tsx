"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Sparkles,
  Layers,
  ShieldCheck,
  Database,
  Network,
  Zap,
  Globe,
  Server,
  HardDrive,
  Radio,
  Play,
  RotateCcw,
  Undo2,
  Redo2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Gauge,
  Plus,
  Trash2,
  Activity,
  Sliders,
  ChevronRight,
  Info,
  Maximize2,
  ArrowRight,
} from "lucide-react";

interface NodeItem {
  id: string;
  name: string;
  category: "network" | "compute" | "storage" | "queue";
  iconName: string;
  x: number;
  y: number;
  status: "healthy" | "warning" | "overloaded";
  instances: number;
  latencyMs: number;
  costUSD: number;
}

const PRESET_SCENARIOS = [
  {
    id: "notifications",
    title: "Push Notifications (100k req/s)",
    description: "Sistema distribuido de alertas masivas con Kafka y Redis",
    nodes: [
      { id: "client", name: "Mobile & Web Clients", category: "network", iconName: "globe", x: 60, y: 160, status: "healthy", instances: 1, latencyMs: 2, costUSD: 0 },
      { id: "alb", name: "AWS ALB (Load Balancer)", category: "network", iconName: "network", x: 260, y: 160, status: "healthy", instances: 2, latencyMs: 8, costUSD: 45 },
      { id: "api", name: "Notification API (Node.js)", category: "compute", iconName: "server", x: 480, y: 100, status: "healthy", instances: 4, latencyMs: 18, costUSD: 160 },
      { id: "auth", name: "Auth Service (Go)", category: "compute", iconName: "server", x: 480, y: 240, status: "healthy", instances: 2, latencyMs: 12, costUSD: 80 },
      { id: "kafka", name: "Apache Kafka Cluster", category: "queue", iconName: "radio", x: 700, y: 100, status: "healthy", instances: 3, latencyMs: 5, costUSD: 140 },
      { id: "redis", name: "Redis In-Memory Cache", category: "storage", iconName: "zap", x: 700, y: 240, status: "healthy", instances: 2, latencyMs: 3, costUSD: 65 },
      { id: "db", name: "PostgreSQL (Primary DB)", category: "storage", iconName: "database", x: 910, y: 170, status: "warning", instances: 1, latencyMs: 42, costUSD: 110 },
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce Checkout & Pagos",
    description: "Arquitectura resiliente con Circuit Breaker y réplicas de lectura",
    nodes: [
      { id: "client", name: "Clientes Web / Mobile", category: "network", iconName: "globe", x: 60, y: 160, status: "healthy", instances: 1, latencyMs: 2, costUSD: 0 },
      { id: "cdn", name: "Cloudflare CDN & WAF", category: "network", iconName: "network", x: 250, y: 160, status: "healthy", instances: 1, latencyMs: 5, costUSD: 30 },
      { id: "gateway", name: "API Gateway (Traefik)", category: "compute", iconName: "server", x: 460, y: 160, status: "healthy", instances: 3, latencyMs: 14, costUSD: 95 },
      { id: "order_svc", name: "Order Service (NestJS)", category: "compute", iconName: "server", x: 680, y: 90, status: "healthy", instances: 3, latencyMs: 22, costUSD: 120 },
      { id: "payment_svc", name: "Payment Worker (Go)", category: "compute", iconName: "server", x: 680, y: 230, status: "healthy", instances: 2, latencyMs: 35, costUSD: 85 },
      { id: "dynamo", name: "Amazon DynamoDB", category: "storage", iconName: "database", x: 900, y: 160, status: "healthy", instances: 1, latencyMs: 6, costUSD: 180 },
    ],
  },
];

export default function SystemDesignPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>("notifications");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTrafficLevel, setSimTrafficLevel] = useState<"normal" | "stress" | "blackfriday">("normal");
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [activeTab, setActiveTab] = useState<"audit" | "metrics" | "patterns">("audit");

  const currentScenario = PRESET_SCENARIOS.find((s) => s.id === selectedScenario) || PRESET_SCENARIOS[0];
  const [nodes, setNodes] = useState<NodeItem[]>(currentScenario.nodes as any);

  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenario(scenarioId);
    const scen = PRESET_SCENARIOS.find((s) => s.id === scenarioId) || PRESET_SCENARIOS[0];
    setNodes(scen.nodes as any);
    setSelectedNode(null);
    setIsSimulating(false);
  };

  const handleToggleSimulation = () => {
    setIsSimulating(!isSimulating);
  };

  const totalCost = nodes.reduce((acc, curr) => acc + curr.costUSD, 0);

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
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
                  Pizarra Cloud & IA
                </span>
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-xs md:text-sm max-w-2xl">
            Diseña arquitecturas de software distribuidas en la nube, simula millones de peticiones por segundo y recibe auditorías de puntos únicos de falla (SPOF) y costos con IA.
          </p>
        </div>

        {/* Top Controls: Scenarios & Stress Test Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
            <span className="text-[10px] text-zinc-500 font-bold uppercase px-2">Escenario:</span>
            {PRESET_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => handleScenarioChange(scen.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedScenario === scen.id
                    ? "bg-amber-500/20 border border-amber-500/40 text-amber-300 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {scen.title.split(" (")[0]}
              </button>
            ))}
          </div>

          <button
            onClick={handleToggleSimulation}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
              isSimulating
                ? "bg-emerald-500 text-zinc-950 shadow-emerald-500/25 animate-pulse"
                : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 text-zinc-950 shadow-amber-500/20 hover:scale-[1.02]"
            }`}
          >
            {isSimulating ? (
              <>
                <Activity className="w-4 h-4" />
                <span>Simulando Carga (En Vivo)</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Iniciar Simulación de Tráfico</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Realtime Architecture Metrics Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Tráfico Inyectado</span>
            <span className="text-lg font-black font-mono text-white">
              {isSimulating ? "85,400 RPS" : "12,000 RPS"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Latencia P99</span>
            <span
              className={`text-lg font-black font-mono ${
                isSimulating ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {isSimulating ? "42 ms" : "18 ms"}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Disponibilidad SLA</span>
            <span className="text-lg font-black font-mono text-emerald-400">99.95% (3 Nueves)</span>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-zinc-500 text-[10px] font-bold uppercase">Costo Estimado AWS</span>
            <span className="text-lg font-black font-mono text-amber-300">${totalCost} USD/mes</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* ── Main Canvas & Inspector Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ── Left & Center: Interactive Architecture Canvas (8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Canvas Toolbar */}
          <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-4">
            {/* Component Palette quick shortcuts */}
            <div className="flex items-center gap-2 overflow-x-auto text-xs py-1">
              <span className="text-[10px] text-zinc-500 uppercase font-bold px-1 shrink-0">Añadir Nodo:</span>
              <button
                onClick={() => alert("Nodo Load Balancer agregado a la pizarra")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Network className="w-3.5 h-3.5 text-blue-400" /> Load Balancer
              </button>
              <button
                onClick={() => alert("Nodo Microservicio agregado a la pizarra")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Server className="w-3.5 h-3.5 text-emerald-400" /> Microservicio
              </button>
              <button
                onClick={() => alert("Nodo Redis Cache agregado a la pizarra")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Redis Cache
              </button>
              <button
                onClick={() => alert("Nodo Kafka Queue agregado a la pizarra")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Radio className="w-3.5 h-3.5 text-purple-400" /> Message Queue
              </button>
              <button
                onClick={() => alert("Nodo Base de Datos agregado a la pizarra")}
                className="px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Database className="w-3.5 h-3.5 text-cyan-400" /> Postgres DB
              </button>
            </div>

            {/* Undo / Redo Buttons (Command Pattern UI) */}
            <div className="flex items-center gap-1 border-l border-zinc-800 pl-3 shrink-0">
              <button
                onClick={() => alert("Acción deshecha (Undo - Command Pattern)")}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                title="Deshacer (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => alert("Acción rehecha (Redo - Command Pattern)")}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                title="Rehacer (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Canvas Board */}
          <div className="relative w-full h-[480px] rounded-3xl bg-[#090a0d] border border-zinc-800/90 overflow-hidden shadow-2xl select-none group">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

            {/* Simulated Connecting SVG Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                  <stop offset="50%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.4" />
                </linearGradient>
              </defs>

              {/* Connections between nodes in Notifications preset */}
              {selectedScenario === "notifications" && (
                <>
                  {/* Client -> ALB */}
                  <line x1="160" y1="185" x2="260" y2="185" stroke="#3f3f46" strokeWidth="2" strokeDasharray="4 4" />
                  {/* ALB -> API */}
                  <path d="M 370 185 L 420 185 L 420 125 L 480 125" fill="none" stroke="#3f3f46" strokeWidth="2" />
                  {/* ALB -> Auth */}
                  <path d="M 370 185 L 420 185 L 420 265 L 480 265" fill="none" stroke="#3f3f46" strokeWidth="2" />
                  {/* API -> Kafka */}
                  <line x1="590" y1="125" x2="700" y2="125" stroke="#3f3f46" strokeWidth="2" />
                  {/* Auth -> Redis */}
                  <line x1="590" y1="265" x2="700" y2="265" stroke="#3f3f46" strokeWidth="2" />
                  {/* Kafka -> DB */}
                  <path d="M 810 125 L 860 125 L 860 195 L 910 195" fill="none" stroke="#3f3f46" strokeWidth="2" />
                  {/* Redis -> DB */}
                  <path d="M 810 265 L 860 265 L 860 195 L 910 195" fill="none" stroke="#3f3f46" strokeWidth="2" />

                  {/* Animated Flow Particles when simulating */}
                  {isSimulating && (
                    <>
                      <circle cx="210" cy="185" r="4" fill="#10b981" className="animate-ping" />
                      <circle cx="645" cy="125" r="4" fill="#f59e0b" className="animate-ping" />
                      <circle cx="645" cy="265" r="4" fill="#6366f1" className="animate-ping" />
                    </>
                  )}
                </>
              )}
            </svg>

            {/* Render Architecture Nodes */}
            {nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-32 p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 shadow-xl backdrop-blur-md ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 scale-105 z-20 shadow-amber-500/20"
                      : node.status === "warning"
                      ? "bg-zinc-900/90 border-amber-500/60 hover:border-amber-400 z-10"
                      : "bg-zinc-900/90 border-zinc-700/80 hover:border-indigo-400/60 z-10"
                  }`}
                >
                  {/* Node Header & Icon */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`p-1.5 rounded-lg text-white ${
                        node.category === "network"
                          ? "bg-blue-600"
                          : node.category === "compute"
                          ? "bg-emerald-600"
                          : node.category === "queue"
                          ? "bg-purple-600"
                          : "bg-cyan-600"
                      }`}
                    >
                      {node.category === "network" && <Network className="w-3.5 h-3.5" />}
                      {node.category === "compute" && <Server className="w-3.5 h-3.5" />}
                      {node.category === "queue" && <Radio className="w-3.5 h-3.5" />}
                      {node.category === "storage" && <Database className="w-3.5 h-3.5" />}
                    </div>

                    {/* Status Dot */}
                    <span
                      className={`w-2 h-2 rounded-full ${
                        node.status === "healthy"
                          ? "bg-emerald-400 shadow-[0_0_8px_#10b981]"
                          : "bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse"
                      }`}
                    />
                  </div>

                  {/* Node Title */}
                  <span className="text-[11px] font-bold text-white truncate leading-tight mt-0.5">
                    {node.name}
                  </span>

                  {/* Node Metrics */}
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono border-t border-zinc-800 pt-1">
                    <span>{node.instances}x inst.</span>
                    <span className="text-zinc-300 font-semibold">{node.latencyMs}ms</span>
                  </div>
                </div>
              );
            })}

            {/* Bottom canvas helper badge */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2 backdrop-blur-sm pointer-events-none">
              <Info className="w-3.5 h-3.5 text-amber-400" />
              <span>Haz clic sobre cualquier componente para inspeccionar parámetros y réplicas.</span>
            </div>
          </div>
        </div>

        {/* ── Right Column: AI Architecture Inspector & Audit (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Node Inspector Drawer */}
          {selectedNode ? (
            <div className="p-5 rounded-3xl bg-zinc-900/90 border border-amber-500/40 shadow-2xl flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{selectedNode.name}</h3>
                    <span className="text-[10px] text-zinc-400 font-mono">ID: #{selectedNode.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Instancias Activas</span>
                  <span className="text-sm font-bold text-white font-mono mt-0.5">{selectedNode.instances} réplicas</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Latencia Media</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">{selectedNode.latencyMs} ms</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Costo Mensual</span>
                  <span className="text-sm font-bold text-amber-300 font-mono mt-0.5">${selectedNode.costUSD} USD</span>
                </div>
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase">Estado de Salud</span>
                  <span className="text-sm font-bold text-white capitalize mt-0.5">{selectedNode.status}</span>
                </div>
              </div>

              {selectedNode.id === "db" && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col gap-1">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" /> Punto Único de Falla (SPOF)
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-tight">
                    Esta base de datos no cuenta con Read Replicas configuradas. Si la instancia falla, las consultas de lectura quedarán bloqueadas.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
              <Sliders className="w-4 h-4 text-zinc-600" />
              <span>Selecciona un nodo para ver configuración y costos</span>
            </div>
          )}

          {/* AI Audit & Architecture Recommendations */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Auditoría de Arquitectura con IA</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-bold">
                Gemini Flash
              </span>
            </div>

            {/* Audit Findings */}
            <div className="flex flex-col gap-3">
              {/* Finding 1: SPOF */}
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>SPOF: Base de Datos sin Redundancia</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  PostgreSQL opera como única instancia master. Se recomienda habilitar Multi-AZ y 2 réplicas de lectura.
                </p>
              </div>

              {/* Finding 2: Cache Pattern */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Patrón Cache-Aside Implementado</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Redis absorbe el 84% de las lecturas repetitivas, manteniendo la latencia general en 18ms.
                </p>
              </div>

              {/* Finding 3: Event-Driven Queue */}
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Desacoplamiento con Kafka</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  El cluster de Kafka absorbe picos de 100k notificaciones/segundo sin sobrecargar el servicio consumidor.
                </p>
              </div>
            </div>

            {/* Quick Practice Action */}
            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
              <Link
                href="/interview"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
              >
                <span>🎙️ Practicar Entrevista de System Design</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
