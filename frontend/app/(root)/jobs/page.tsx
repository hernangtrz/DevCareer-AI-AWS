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
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
  Layers,
  Copy,
  Check,
  X,
  FileText,
  Send,
  ArrowRight,
  TrendingUp,
  Bookmark,
  RefreshCw,
  Globe,
  SlidersHorizontal,
} from "lucide-react";

interface JobOffer {
  id: string;
  title: string;
  company: string;
  companyInitials: string;
  logoGradient: string;
  platform: "Greenhouse" | "Lever" | "LinkedIn" | "Wellfound";
  platformBg: string;
  location: string;
  remote: boolean;
  seniority: "Junior" | "Mid-Level" | "Senior" | "Staff";
  salaryMonthlyUSD: string;
  postedAgo: string;
  matchScore: number;
  matchLevel: "Excelente" | "Alto" | "Bueno";
  matchedSkills: string[];
  missingSkills: string[];
  externalUrl: string;
  requiredFields: string[];
}

const CONNECTED_PLATFORMS = [
  { id: "greenhouse", name: "Greenhouse", type: "Job Board ATS", icon: "🟢", count: 18, active: true },
  { id: "lever", name: "Lever", type: "Job Board ATS", icon: "⚡", count: 14, active: true },
  { id: "linkedin", name: "LinkedIn", type: "Red Profesional", icon: "💼", count: 22, active: true },
  { id: "wellfound", name: "Wellfound", type: "Startups & Tech", icon: "🚀", count: 8, active: true },
];

const MOCK_JOBS: JobOffer[] = [
  {
    id: "job-1",
    title: "Senior Fullstack Engineer (React & Node.js)",
    company: "Deel",
    companyInitials: "DL",
    logoGradient: "from-blue-600 to-indigo-700",
    platform: "Greenhouse",
    platformBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    location: "Remoto (LatAm / EE.UU.)",
    remote: true,
    seniority: "Senior",
    salaryMonthlyUSD: "$5,500 - $7,200 USD",
    postedAgo: "Hace 4 minutos",
    matchScore: 98,
    matchLevel: "Excelente",
    matchedSkills: ["React", "TypeScript", "Node.js", "PostgreSQL", "REST APIs", "Git"],
    missingSkills: ["AWS Lambda"],
    externalUrl: "https://boards.greenhouse.io/deel",
    requiredFields: ["Nombre Completo", "Email", "LinkedIn", "Pretensión Salarial (USD)", "Nivel de Inglés"],
  },
  {
    id: "job-2",
    title: "Staff Software Engineer (UI Platform)",
    company: "Vercel Partner",
    companyInitials: "VP",
    logoGradient: "from-zinc-800 to-black",
    platform: "Lever",
    platformBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
    location: "Remoto (Global)",
    remote: true,
    seniority: "Staff",
    salaryMonthlyUSD: "$6,500 - $8,800 USD",
    postedAgo: "Hace 15 minutos",
    matchScore: 95,
    matchLevel: "Excelente",
    matchedSkills: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Design Systems"],
    missingSkills: ["Turborepo", "Web Workers"],
    externalUrl: "https://jobs.lever.co/vercel",
    requiredFields: ["Nombre Completo", "Email", "GitHub", "Portafolio"],
  },
  {
    id: "job-3",
    title: "Backend Engineer (Microservices & Go)",
    company: "Nubank",
    companyInitials: "NU",
    logoGradient: "from-purple-700 to-indigo-900",
    platform: "LinkedIn",
    platformBg: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    location: "Remoto (Colombia / México / Brasil)",
    remote: true,
    seniority: "Mid-Level",
    salaryMonthlyUSD: "$4,000 - $5,500 USD",
    postedAgo: "Hace 1 hora",
    matchScore: 89,
    matchLevel: "Alto",
    matchedSkills: ["Node.js", "TypeScript", "SQL", "Docker", "Clean Architecture"],
    missingSkills: ["Kafka", "DynamoDB"],
    externalUrl: "https://linkedin.com/jobs/view/nubank",
    requiredFields: ["Nombre Completo", "Email", "CV en PDF"],
  },
  {
    id: "job-4",
    title: "AI Solutions Engineer (Python & Agents)",
    company: "Scale AI",
    companyInitials: "SA",
    logoGradient: "from-amber-600 to-rose-700",
    platform: "Wellfound",
    platformBg: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    location: "Remoto (EE.UU. / LatAm)",
    remote: true,
    seniority: "Senior",
    salaryMonthlyUSD: "$6,000 - $8,500 USD",
    postedAgo: "Hace 3 horas",
    matchScore: 84,
    matchLevel: "Alto",
    matchedSkills: ["Python", "REST APIs", "Git", "Docker"],
    missingSkills: ["LangChain", "PyTorch", "RAG Pipelines"],
    externalUrl: "https://wellfound.com/company/scaleai",
    requiredFields: ["Nombre Completo", "Email", "GitHub", "Nivel de Inglés C1"],
  },
];

export default function JobsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedSeniority, setSelectedSeniority] = useState<string>("all");
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCustomOfferModal, setShowCustomOfferModal] = useState(false);
  const [customOfferText, setCustomOfferText] = useState("");

  // Cover letter state
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [copiedLetter, setCopiedLetter] = useState(false);

  const toggleSaveJob = (id: string) => {
    setSavedJobs((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.matchedSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedPlatform !== "all" && job.platform.toLowerCase() !== selectedPlatform.toLowerCase()) return false;
    if (selectedSeniority !== "all" && job.seniority !== selectedSeniority) return false;

    return true;
  });

  const handleOpenAiApply = (job: JobOffer) => {
    setSelectedJob(job);
    setGeneratedLetter("");
    setShowApplyModal(true);
  };

  const handleManualApply = (job: JobOffer) => {
    // Redirige directamente al sitio oficial de la oferta externa
    window.open(job.externalUrl, "_blank", "noopener,noreferrer");
  };

  const handleGenerateCoverLetter = () => {
    if (!selectedJob) return;
    setGeneratingLetter(true);
    setTimeout(() => {
      setGeneratedLetter(
        `Estimado equipo de selección de ${selectedJob.company},\n\n` +
          `Les escribo con gran entusiasmo para postularme a la posición de ${selectedJob.title}. ` +
          `Con más de 3 años de experiencia en desarrollo de software, he liderado proyectos implementando arquitecturas modernas con ${selectedJob.matchedSkills.slice(0, 3).join(", ")}, ` +
          `garantizando alta disponibilidad, código limpio y apego a principios SOLID.\n\n` +
          `Me apasiona la cultura técnica de ${selectedJob.company} y estoy convencido de que mis habilidades aportarán valor inmediato a su equipo.\n\n` +
          `Quedo a su entera disposición para una entrevista.\n\n` +
          `Atentamente,\nHernán Gutiérrez`
      );
      setGeneratingLetter(false);
    }, 1000);
  };

  const handleCopyLetter = () => {
    navigator.clipboard.writeText(generatedLetter);
    setCopiedLetter(true);
    setTimeout(() => setCopiedLetter(false), 2000);
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* ── Top Header Banner (Inspired by Modern Job Matching AI) ── */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>AI AGENT MATCHER ACTIVO</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            ¡Bienvenido de vuelta, Hernán! 👋
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl">
            Encontramos <span className="text-emerald-400 font-bold">62 ofertas de empleo</span> altamente compatibles con tu perfil de CV y nivel técnico.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCustomOfferModal(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Practicar con mi propia Oferta</span>
          </button>
          <Link
            href="/analytics"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Ver Métricas</span>
          </Link>
        </div>
      </div>

      {/* ── Connected Job Platforms (Greenhouse, Lever, LinkedIn, Wellfound) ── */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
            Portales de Empleo Conectados
          </h2>
          <span className="text-[11px] text-zinc-500">Actualización en tiempo real</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CONNECTED_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatform === platform.id;
            return (
              <button
                key={platform.id}
                onClick={() => setSelectedPlatform(isSelected ? "all" : platform.id)}
                className={`relative p-4 rounded-2xl border transition-all text-left cursor-pointer flex items-center justify-between group ${
                  isSelected
                    ? "bg-emerald-500/10 border-emerald-500/40 shadow-lg shadow-emerald-500/10"
                    : "bg-zinc-900/70 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-lg shadow-inner">
                    {platform.icon}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {platform.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-medium">{platform.count} ofertas activas</span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? "bg-emerald-500 text-zinc-950" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  ✓
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Layout: 2 Columns (Job Feed Left + Profile Widgets Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Job Matches Feed (8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* Search & Filter Header */}
          <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex flex-col gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Buscar vacante por rol, tecnología o empresa (ej. React, Python, Nubank)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded-xl p-1 shrink-0">
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
          </div>

          {/* Job Feed List */}
          <div className="flex items-center justify-between px-1">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Top Job Matches</span>
              <span className="text-xs font-normal text-zinc-500">({filteredJobs.length} resultados)</span>
            </h2>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedPlatform("all");
                setSelectedSeniority("all");
              }}
              className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reiniciar filtros
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {filteredJobs.map((job) => {
              const isSaved = savedJobs.includes(job.id);
              return (
                <div
                  key={job.id}
                  className="p-5 md:p-6 rounded-3xl bg-gradient-to-b from-[#181a20] to-[#0c0d10] border border-zinc-800/90 hover:border-indigo-500/40 transition-all shadow-xl flex flex-col gap-4 group"
                >
                  {/* Top card row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${job.logoGradient} flex items-center justify-center text-white font-black text-sm shadow-md shrink-0`}
                      >
                        {job.companyInitials}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-zinc-200">{job.company}</span>
                          <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold border ${job.platformBg}`}>
                            {job.platform}
                          </span>
                          <span className="text-zinc-600 text-xs">•</span>
                          <span className="text-zinc-500 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {job.postedAgo}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate mt-0.5">
                          {job.title}
                        </h3>
                      </div>
                    </div>

                    {/* Match Score Pill */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-base font-extrabold font-mono text-emerald-400">
                        {job.matchScore}% Match
                      </span>
                      <span className="text-[10px] text-emerald-300/70 font-semibold">
                        {job.matchLevel} afinidad
                      </span>
                    </div>
                  </div>

                  {/* Mid details */}
                  <div className="flex items-center gap-4 text-xs text-zinc-400 flex-wrap">
                    <span className="flex items-center gap-1.5 text-zinc-200 font-semibold">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      {job.salaryMonthlyUSD}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {job.location}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 text-[10px] font-bold border border-indigo-500/20">
                      {job.seniority}
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                        className="px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-400 text-[11px] font-medium border border-zinc-700"
                      >
                        + {sk}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800/80">
                    <button
                      onClick={() => router.push("/interview")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors cursor-pointer"
                    >
                      <Mic className="w-4 h-4" />
                      <span>Simular entrevista para esta oferta</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          isSaved
                            ? "bg-indigo-600/20 border-indigo-500/40 text-indigo-300"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                        title="Guardar oferta"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>

                      {/* Botón de Postulación Manual -> Redirige al sitio oficial */}
                      <button
                        onClick={() => handleManualApply(job)}
                        className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Abrir formulario oficial en sitio de la empresa"
                      >
                        <span>Ir al sitio oficial</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Botón de Postulación con IA -> Abre modal con auto-relleno y carta */}
                      <button
                        onClick={() => handleOpenAiApply(job)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Postularme con IA</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right Column: Profile Completeness & Widgets (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-5">
          {/* Profile Completeness Widget (Matching JobBuddy UX) */}
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Estado de tu Perfil
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Listo para aplicar
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850">
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    className="text-zinc-800"
                    strokeWidth="7"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="7"
                    strokeDasharray="188"
                    strokeDashoffset="10"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-white font-extrabold text-sm">95%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Perfil Optimizado 🎉</span>
                <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                  Tu CV y stack están listos para postularte con un solo clic.
                </p>
              </div>
            </div>

            {/* Checklist of elements */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Información Básica & Contacto</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Resumen Profesional con Verbos de Acción</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Experiencia Laboral Cuantificada</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Stack Tecnológico Validado</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>CV en Formato ATS Verificado</span>
              </div>
            </div>

            <Link
              href="/cv"
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Mejorar Perfil en CV Hub</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Daily AI Match Widget */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-indigo-950/30 to-zinc-900 border border-indigo-500/20 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Postulaciones Rápidas de Hoy</span>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-400">5 / 5 libres</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed">
              Tu plan PRO te permite generar cartas de presentación y auto-rellenar postulaciones sin límite diario.
            </p>
          </div>
        </div>
      </div>

      {/* ── MODAL: Postulación con IA (Auto-Relleno y Cover Letter) ── */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${selectedJob.logoGradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                >
                  {selectedJob.companyInitials}
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

            {/* Auto-fill Info Alert */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="font-bold text-emerald-300">Datos auto-completados desde tu CV:</span>
                <p className="text-zinc-300 text-[11px]">
                  Tus datos personales y perfil profesional están preparados. Al confirmar, podrás copiar tu carta de presentación e ir directamente a la plataforma de {selectedJob.platform}.
                </p>
              </div>
            </div>

            {/* Application Fields Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Nombre Completo</label>
                <input
                  type="text"
                  defaultValue="Hernán Gutiérrez"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Correo Electrónico</label>
                <input
                  type="email"
                  defaultValue="hernan@devcareer.ai"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">LinkedIn / Portafolio</label>
                <input
                  type="text"
                  defaultValue="linkedin.com/in/hernangtrz"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Pretensión Salarial (USD)</label>
                <input
                  type="text"
                  defaultValue="$5,800 USD / mes"
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* AI Cover Letter Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-zinc-900 border border-indigo-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Carta de Presentación para {selectedJob.company}</span>
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
                    <span>{copiedLetter ? "Copiado" : "Copiar Carta"}</span>
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
                  Haz clic en *"Generar con IA"* para que Gemini redacte una carta persuasiva adaptada al stack de {selectedJob.company}.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowApplyModal(false);
                  router.push("/interview");
                }}
                className="inline-flex items-center gap-2 text-xs font-semibold text-pink-400 hover:text-pink-300 cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Simular entrevista primero</span>
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
                    handleManualApply(selectedJob);
                    setShowApplyModal(false);
                  }}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center gap-2"
                >
                  <span>Copiar Carta y Abrir en {selectedJob.platform}</span>
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
                  <p className="text-xs text-zinc-400">Pega la descripción de cualquier oferta externa</p>
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
