"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Search,
  Sparkles,
  Target,
  Zap,
  Mic,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Filter,
  Layers,
  Copy,
  Check,
  X,
  FileText,
  Send,
  PlusCircle,
  SlidersHorizontal,
} from "lucide-react";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  logoBg: string;
  source: "LinkedIn" | "Indeed" | "Adzuna" | "Direct";
  location: string;
  remote: boolean;
  seniority: "Junior" | "Mid-Level" | "Senior" | "Lead";
  salaryMonthlyUSD: string;
  postedAgo: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  requiredFields: string[];
}

const MOCK_JOBS: JobOffer[] = [
  {
    id: "job-1",
    title: "Senior Fullstack Engineer (React & Node.js)",
    company: "Deel",
    logoBg: "from-blue-600 to-indigo-700",
    source: "LinkedIn",
    location: "Remoto (LatAm / EE.UU.)",
    remote: true,
    seniority: "Senior",
    salaryMonthlyUSD: "$5,000 - $7,000 USD",
    postedAgo: "Hace 2 horas",
    matchScore: 94,
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Git"],
    missingSkills: ["GraphQL", "AWS Lambda"],
    description: `Buscamos un Senior Fullstack Engineer para unirse a nuestro equipo global de pagos. Trabajarás en arquitecturas distribuidas de alta disponibilidad, desarrollo de interfaces con Next.js y servicios backend en Node.js/TypeScript.`,
    requiredFields: ["Nombre Completo", "Email", "LinkedIn", "Pretensión Salarial (USD)", "Nivel de Inglés"],
  },
  {
    id: "job-2",
    title: "Frontend Developer (Next.js & Tailwind)",
    company: "Vercel Partner",
    logoBg: "from-zinc-700 to-black",
    source: "Indeed",
    location: "Remoto (Global)",
    remote: true,
    seniority: "Mid-Level",
    salaryMonthlyUSD: "$3,800 - $5,200 USD",
    postedAgo: "Hace 5 horas",
    matchScore: 88,
    matchedSkills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "UI/UX Design"],
    missingSkills: ["Framer Motion", "Playwright E2E"],
    description: `Diseñarás e implementarás experiencias web ultra-rápidas para clientes enterprise en EE.UU. Se requiere atención al detalle, dominio de patrones de componentes y optimización de Core Web Vitals.`,
    requiredFields: ["Nombre Completo", "Email", "Portafolio / GitHub", "Pretensión Salarial (USD)"],
  },
  {
    id: "job-3",
    title: "Backend Engineer (Node.js & Microservices)",
    company: "Nubank",
    logoBg: "from-purple-700 to-indigo-900",
    source: "LinkedIn",
    location: "Remoto (Colombia / México / Brasil)",
    remote: true,
    seniority: "Mid-Level",
    salaryMonthlyUSD: "$3,500 - $4,800 USD",
    postedAgo: "Hace 1 día",
    matchScore: 82,
    matchedSkills: ["Node.js", "TypeScript", "SQL", "Docker", "Clean Architecture"],
    missingSkills: ["Kafka", "DynamoDB"],
    description: `Integrarás el squad de infraestructura financiera. Diseñarás APIs escalables con tolerancia a fallas, patrones de resiliencia y pruebas de carga continuas.`,
    requiredFields: ["Nombre Completo", "Email", "CV en PDF", "Años de Experiencia en Backend"],
  },
  {
    id: "job-4",
    title: "Python / AI Solutions Engineer",
    company: "Scale AI",
    logoBg: "from-amber-600 to-rose-700",
    source: "Adzuna",
    location: "Remoto (Global)",
    remote: true,
    seniority: "Senior",
    salaryMonthlyUSD: "$6,000 - $8,500 USD",
    postedAgo: "Hace 2 días",
    matchScore: 72,
    matchedSkills: ["Python", "REST APIs", "Git", "Docker"],
    missingSkills: ["LangChain", "PyTorch", "RAG Pipelines", "FastAPI"],
    description: `Implementación de agentes inteligentes y pipelines de evaluación LLM para clientes globales. Alta colaboración en inglés con equipos de San Francisco.`,
    requiredFields: ["Nombre Completo", "Email", "GitHub", "Nivel de Inglés (C1 requerido)", "Resumen de Proyectos de IA"],
  },
];

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedSeniority, setSelectedSeniority] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCustomOfferModal, setShowCustomOfferModal] = useState(false);
  const [applyMode, setApplyMode] = useState<"autofill" | "manual">("autofill");
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Custom offer paste
  const [customOfferText, setCustomOfferText] = useState("");

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.matchedSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === "recommended" && job.matchScore < 80) return false;
    if (selectedFilter === "frontend" && !job.title.toLowerCase().includes("frontend") && !job.title.toLowerCase().includes("fullstack")) return false;
    if (selectedFilter === "backend" && !job.title.toLowerCase().includes("backend") && !job.title.toLowerCase().includes("fullstack")) return false;

    if (selectedSeniority !== "all" && job.seniority !== selectedSeniority) return false;

    return true;
  });

  const handleOpenApply = (job: JobOffer) => {
    setSelectedJob(job);
    setGeneratedLetter("");
    setApplyMode("autofill");
    setShowApplyModal(true);
  };

  const handleGenerateCoverLetter = () => {
    if (!selectedJob) return;
    setGeneratingLetter(true);
    setTimeout(() => {
      setGeneratedLetter(
        `Estimado equipo de selección de ${selectedJob.company},\n\n` +
          `Les escribo con gran entusiasmo para postularme a la posición de ${selectedJob.title}. ` +
          `Con más de 3 años de experiencia en desarrollo de software, he liderado proyectos implementando arquitecturas modernas con ${selectedJob.matchedSkills.slice(0, 3).join(", ")}, ` +
          `logrando optimizaciones de rendimiento y entregas de alta calidad.\n\n` +
          `Me apasiona la cultura técnica de ${selectedJob.company} y estoy seguro de que mi perfil orientado a buenas prácticas y principios SOLID aportará valor inmediato a su equipo.\n\n` +
          `Quedo a su entera disposición para una entrevista.\n\n` +
          `Atentamente,\nHernán Gutiérrez`
      );
      setGeneratingLetter(false);
    }, 1200);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  const handleSimulateInterview = (job: JobOffer) => {
    // Redirige al formulario de entrevista pre-cargado
    router.push(`/interview`);
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* ── Top Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Smart Job Portal & 1-Click Match
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                  En Vivo
                </span>
              </div>
            </div>
          </div>
          <p className="text-zinc-400 text-sm max-w-2xl">
            Descubre ofertas tech de LinkedIn, Indeed y portales globales con Match Score inteligente, postulación con auto-relleno y simulación de entrevista en 1 clic.
          </p>
        </div>

        {/* Quick action: Paste Custom Offer */}
        <button
          onClick={() => setShowCustomOfferModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-indigo-600/10 w-fit"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Practicar con mi propia Oferta</span>
        </button>
      </div>

      {/* ── Metrics Bar ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Vacantes Activas</span>
          <span className="text-xl font-bold text-white">1,248</span>
          <span className="text-[11px] text-emerald-400 font-medium">100% Remotas en USD</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Tu Match Promedio</span>
          <span className="text-xl font-bold text-emerald-400">86%</span>
          <span className="text-[11px] text-zinc-400">Basado en tu CV y Retos</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Salario Promedio</span>
          <span className="text-xl font-bold text-indigo-300">$4,850</span>
          <span className="text-[11px] text-zinc-400">USD / mes (LatAm Remote)</span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col gap-1">
          <span className="text-zinc-500 text-[11px] font-semibold uppercase tracking-wider">Postulaciones Rápidas</span>
          <span className="text-xl font-bold text-purple-400">&lt; 30s</span>
          <span className="text-[11px] text-zinc-400">Con Auto-Relleno y Cover Letter</span>
        </div>
      </div>

      {/* ── Search & Filters Bar ── */}
      <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3 shadow-xl">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar por rol, tecnología o empresa (ej. React, Node.js, Nubank)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Seniority Selector */}
          <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 w-full md:w-auto">
            <span className="text-[10px] text-zinc-500 uppercase font-bold px-2">Nivel:</span>
            {["all", "Junior", "Mid-Level", "Senior"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedSeniority(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedSeniority === lvl ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {lvl === "all" ? "Todos" : lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-zinc-800/60">
          <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filtro rápido:
          </span>
          {[
            { id: "all", label: "Todas las Ofertas" },
            { id: "recommended", label: "⭐ Recomendadas (>80% Match)" },
            { id: "frontend", label: "Frontend & Fullstack" },
            { id: "backend", label: "Backend & Cloud" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedFilter === tab.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "bg-zinc-950/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Job Cards Feed ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-semibold text-zinc-400">
            Mostrando <span className="text-white font-bold">{filteredJobs.length}</span> ofertas encontradas
          </span>
          <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Actualizado en tiempo real
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-5 md:p-6 rounded-2xl bg-gradient-to-b from-[#181a20] to-[#0d0e12] border border-zinc-800/90 hover:border-indigo-500/40 transition-all shadow-xl hover:shadow-indigo-500/5 flex flex-col md:flex-row md:items-center justify-between gap-6 group"
            >
              {/* Left job info */}
              <div className="flex items-start gap-4 min-w-0 flex-1">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${job.logoBg} flex items-center justify-center text-white font-bold text-base shadow-md shrink-0`}
                >
                  {job.company[0]}
                </div>

                <div className="flex flex-col gap-2 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-zinc-300">{job.company}</span>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-medium border border-zinc-700">
                      {job.source}
                    </span>
                    <span className="text-zinc-600 text-xs">•</span>
                    <span className="text-zinc-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {job.postedAgo}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-zinc-300 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {job.salaryMonthlyUSD}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[11px] font-semibold border border-indigo-500/20">
                      {job.seniority}
                    </span>
                  </div>

                  {/* Skills Match pills */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold mr-1">Skills:</span>
                    {job.matchedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 text-[11px] font-medium border border-emerald-500/20"
                      >
                        ✓ {sk}
                      </span>
                    ))}
                    {job.missingSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-400 text-[11px] font-medium border border-zinc-700"
                      >
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right actions & Match badge */}
              <div className="flex md:flex-col items-center md:items-end justify-between gap-4 border-t md:border-t-0 border-zinc-800 pt-4 md:pt-0 shrink-0">
                {/* Match Score Badge */}
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">Compatibilidad</span>
                    <span
                      className={`text-lg font-black font-mono ${
                        job.matchScore >= 90
                          ? "text-emerald-400"
                          : job.matchScore >= 80
                          ? "text-indigo-300"
                          : "text-amber-400"
                      }`}
                    >
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      job.matchScore >= 90
                        ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                        : job.matchScore >= 80
                        ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                        : "bg-amber-500/20 border border-amber-500/40 text-amber-300"
                    }`}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleSimulateInterview(job)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    title="Crear sesión de voz para este puesto"
                  >
                    <Mic className="w-3.5 h-3.5 text-pink-400" />
                    <span className="hidden sm:inline">Simular</span> Entrevista
                  </button>

                  <button
                    onClick={() => handleOpenApply(job)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Postularme</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODAL: Postulación Inteligente (Auto-relleno & Cover Letter) ── */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedJob.logoBg} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {selectedJob.company[0]}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-400 font-semibold">{selectedJob.company}</span>
                  <h3 className="text-base font-bold text-white">{selectedJob.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setApplyMode("autofill")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  applyMode === "autofill"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Auto-Relleno desde tu CV (Recomendado)</span>
              </button>
              <button
                onClick={() => setApplyMode("manual")}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  applyMode === "manual"
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <span>✍️ Llenar Manualmente</span>
              </button>
            </div>

            {/* Auto-fill Alert & Missing fields */}
            {applyMode === "autofill" && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-amber-300">Campos faltantes detectados para esta vacante:</span>
                  <p className="text-zinc-300 text-[11px]">
                    Tu CV tiene el 85% de los datos listos. Esta empresa solicita adicionalmente:{" "}
                    <span className="text-amber-200 font-semibold">"Pretensión Salarial (USD)"</span> y{" "}
                    <span className="text-amber-200 font-semibold">"Nivel de Inglés"</span>.
                  </p>
                </div>
              </div>
            )}

            {/* Application Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Nombre Completo</label>
                <input
                  type="text"
                  defaultValue={applyMode === "autofill" ? "Hernán Gutiérrez" : ""}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue={applyMode === "autofill" ? "hernan@devcareer.ai" : ""}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">LinkedIn / Portafolio</label>
                <input
                  type="text"
                  defaultValue={applyMode === "autofill" ? "linkedin.com/in/hernangtrz" : ""}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-amber-300 flex items-center justify-between">
                  <span>Pretensión Salarial (USD) *</span>
                  <span className="text-[9px] text-amber-400 font-normal">Faltante</span>
                </label>
                <input
                  type="text"
                  placeholder="ej. $5,500 USD / mes"
                  className="bg-zinc-900 border border-amber-500/40 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* AI Cover Letter Generator */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-purple-950/20 border border-indigo-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Carta de Presentación Adaptada a {selectedJob.company}</span>
                </div>
                {!generatedLetter ? (
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingLetter}
                    className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    {generatingLetter ? "Redactando con IA..." : "✨ Generar con IA"}
                  </button>
                ) : (
                  <button
                    onClick={handleCopyLetter}
                    className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedLetter ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLetter ? "Copiado" : "Copiar"}</span>
                  </button>
                )}
              </div>

              {generatedLetter ? (
                <textarea
                  value={generatedLetter}
                  onChange={(e) => setGeneratedLetter(e.target.value)}
                  rows={6}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              ) : (
                <p className="text-zinc-500 text-xs leading-relaxed">
                  Haz clic en *"Generar con IA"* para que Gemini cruce tu perfil con los requisitos de {selectedJob.company} y redacte una carta persuasiva en segundos.
                </p>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  handleSimulateInterview(selectedJob);
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Simular entrevista de esta vacante</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    alert(`¡Datos y carta de presentación preparados! Redirigiendo a la oferta oficial de ${selectedJob.company} en ${selectedJob.source}...`);
                    setShowApplyModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                >
                  <span>Copiar Datos y Abrir en {selectedJob.source}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Practicar con Oferta Externa ── */}
      {showCustomOfferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Practicar con tu propia Oferta</h3>
                  <p className="text-xs text-zinc-400">Pega la descripción de cualquier oferta externa (LinkedIn, WhatsApp, web)</p>
                </div>
              </div>
              <button
                onClick={() => setShowCustomOfferModal(false)}
                className="p-1.5 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-zinc-300">Pega la descripción de la vacante:</label>
              <textarea
                value={customOfferText}
                onChange={(e) => setCustomOfferText(e.target.value)}
                placeholder="Pega aquí el texto completo del puesto (requerimientos, tecnologías, responsabilidades)..."
                rows={6}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-3.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Nuestra IA extraerá automáticamente el stack y configurará tu entrevista de voz.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCustomOfferModal(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowCustomOfferModal(false);
                  router.push("/interview");
                }}
                disabled={!customOfferText.trim()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 cursor-pointer disabled:opacity-40 flex items-center gap-2"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Generar Entrevista a Medida</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
