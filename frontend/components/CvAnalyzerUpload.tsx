"use client";

import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Upload,
  Briefcase,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  FileCheck2,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import AtsScoreCard from "./AtsScoreCard";
import KeywordsPanel from "./KeywordsPanel";
import SuggestionCard from "./SuggestionCard";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AnalysisResult {
  score: number;
  summary: string;
  breakdown: {
    keywords: number;
    formatting: number;
    grammar: number;
    impact: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: {
    category: "keywords" | "formatting" | "grammar" | "impact" | "structure";
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }[];
}

// ── Presets ───────────────────────────────────────────────────────────────────
const JOB_PRESETS = [
  {
    id: "react",
    title: "React Frontend Developer",
    description: `Buscamos un React Frontend Developer con más de 2 años de experiencia.
Requisitos indispensables:
- Experiencia sólida en React, TypeScript y Tailwind CSS.
- Gestión de estado con Redux o Context API.
- Integración de REST APIs y herramientas de control de versiones (Git).
- Valorable: Conocimientos en Next.js, GraphQL y Framer Motion para animaciones.`,
  },
  {
    id: "python",
    title: "Python Backend Engineer",
    description: `Estamos en búsqueda de un Ingeniero Backend Python.
Requisitos indispensables:
- Experiencia sólida en Python (más de 3 años).
- Desarrollo de APIs robustas usando Django o FastAPI.
- Manejo de bases de datos PostgreSQL y optimización de consultas SQL.
- Experiencia en contenedores Docker y despliegue en la nube.
- Deseable: Experiencia con Redis, arquitecturas de microservicios y pipelines de CI/CD.`,
  },
  {
    id: "qa",
    title: "QA Automation Specialist",
    description: `Buscamos un QA Automation Engineer con experiencia en pruebas web y móviles.
Requisitos:
- Diseño de scripts de automatización con Selenium o Cypress.
- Lenguajes de scripting: JavaScript, Python o Java.
- Pruebas de integración, de regresión y API testing con Postman.
- Conocimiento de integración continua (CI/CD) y metodologías ágiles.`,
  },
  {
    id: "data",
    title: "Data Analyst",
    description: `Buscamos un Analista de Datos con perfil analítico y orientado a resultados.
Requisitos:
- Experiencia en análisis de datos con Python o R.
- Dominio de SQL para extracción y transformación de datos.
- Visualización de datos con Power BI, Tableau o Looker.
- Conocimiento de estadística descriptiva e inferencial.
- Deseable: Machine Learning con scikit-learn y gestión de datos en cloud (AWS, GCP).`,
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const CvAnalyzerUpload = () => {
  const [jobText, setJobText] = useState(JOB_PRESETS[0].description);
  const [cvInputMode, setCvInputMode] = useState<"file" | "text">("file");
  const [cvPastedText, setCvPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileObj, setFileObj] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedFileName, setAnalyzedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSelectPreset = (id: string) => {
    const p = JOB_PRESETS.find((x) => x.id === id);
    if (p) setJobText(p.description);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf"))) {
      setFileName(file.name);
      setFileObj(file);
      setError(null);
    } else if (file) {
      setError("Solo se admiten archivos PDF.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileObj(file);
      setError(null);
    }
  };

  const removeFile = () => {
    setFileName(null);
    setFileObj(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Main analysis call ───────────────────────────────────────────────────────
  const runAnalysis = async () => {
    setError(null);

    const hasCv =
      cvInputMode === "file" ? !!fileObj : cvPastedText.trim().length >= 50;

    if (!hasCv) {
      setError(
        cvInputMode === "file"
          ? "Por favor sube un archivo PDF de tu CV."
          : "El texto del CV debe tener al menos 50 caracteres."
      );
      return;
    }

    if (jobText.trim().length < 20) {
      setError("La descripción de la vacante es demasiado corta.");
      return;
    }

    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("jobDescription", jobText);

      if (cvInputMode === "file" && fileObj) {
        formData.append("cvFile", fileObj);
      } else {
        formData.append("cvText", cvPastedText);
      }

      // Call the Next.js proxy route (same origin) which forwards to the Express backend
      const response = await fetch("/api/cv/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Error al analizar el CV.");
      }

      setResults(json.data as AnalysisResult);
      setAnalyzedFileName(
        cvInputMode === "file" ? fileName : "Texto pegado"
      );
    } catch (err: any) {
      setError(err.message || "Ocurrió un error inesperado. Inténtalo de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };


  const resetAnalysis = () => {
    setResults(null);
    setFileName(null);
    setFileObj(null);
    setCvPastedText("");
    setError(null);
    setAnalyzedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const canAnalyze =
    !isAnalyzing &&
    jobText.trim().length >= 20 &&
    (cvInputMode === "file" ? !!fileObj : cvPastedText.trim().length >= 50);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 w-full">
      {!results ? (
        <div className="flex flex-col gap-6">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm">
              <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
            {/* ── Job Description Panel ── */}
            <div className="card-border">
              <div className="card p-6 flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h3 className="text-white text-base font-bold flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-indigo-400" />
                    1. Oferta de empleo / Perfil requerido
                  </h3>
                  <p className="text-white/50 text-xs">
                    Pega la descripción de la vacante a la que quieres aplicar o
                    elige uno de nuestros ejemplos.
                  </p>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-2">
                  {JOB_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPreset(p.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                        jobText === p.description
                          ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
                          : "bg-dark-200 border-white/5 text-white/60 hover:border-indigo-400 hover:text-white"
                      )}
                    >
                      💡 {p.title}
                    </button>
                  ))}
                </div>

                <textarea
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  placeholder="Pega aquí la descripción detallada de la oferta..."
                  className="bg-dark-200 rounded-2xl p-4 text-white text-sm placeholder:text-light-600 border border-input focus:outline-none focus:border-indigo-400 transition-colors h-60 resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between">
                  <span className="text-white/30 text-xs">
                    {jobText.trim().length} caracteres
                  </span>
                  {jobText.trim().length < 20 && (
                    <span className="text-rose-400 text-xs">
                      Mínimo 20 caracteres
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── CV Upload / Paste Panel ── */}
            <div className="card-border">
              <div className="card p-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <h3 className="text-white text-base font-bold flex items-center gap-2">
                    <FileText className="h-4 w-4 text-fuchsia-400" />
                    2. Tu Currículum (CV)
                  </h3>
                  <p className="text-white/50 text-xs">
                    Sube tu CV en PDF o pega el texto directamente.
                  </p>
                </div>

                {/* Mode toggle */}
                <div className="flex bg-dark-200 rounded-xl p-1 gap-1">
                  <button
                    onClick={() => setCvInputMode("file")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      cvInputMode === "file"
                        ? "bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300"
                        : "text-white/40 hover:text-white/70"
                    )}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Subir PDF
                  </button>
                  <button
                    onClick={() => setCvInputMode("text")}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                      cvInputMode === "text"
                        ? "bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-300"
                        : "text-white/40 hover:text-white/70"
                    )}
                  >
                    <AlignLeft className="h-3.5 w-3.5" />
                    Pegar texto
                  </button>
                </div>

                {/* File upload zone */}
                {cvInputMode === "file" ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => {
                      if (!fileName) fileInputRef.current?.click();
                    }}
                    className={cn(
                      "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer min-h-[160px]",
                      isDragging
                        ? "border-fuchsia-500 bg-fuchsia-500/5"
                        : fileName
                        ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                        : "border-white/10 bg-dark-200 hover:border-fuchsia-500/30"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      id="file-input"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {fileName ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                          <FileCheck2 className="h-6 w-6" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-semibold text-sm max-w-[240px] truncate">
                            {fileName}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="text-xs text-rose-400 hover:text-rose-300 transition-colors mt-0.5"
                          >
                            Remover archivo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-dark-300 border border-white/5 text-white/40 flex items-center justify-center">
                          <Upload className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-white font-semibold text-sm">
                            Arrastra tu PDF aquí o{" "}
                            <span className="text-fuchsia-400">explora</span>
                          </span>
                          <span className="text-white/30 text-xs">
                            Solo PDF · Máximo 10MB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Text paste zone */
                  <div className="flex flex-col gap-2 flex-1">
                    <textarea
                      value={cvPastedText}
                      onChange={(e) => setCvPastedText(e.target.value)}
                      placeholder="Pega aquí el contenido de tu CV: nombre, experiencia laboral, habilidades, educación..."
                      className="bg-dark-200 rounded-2xl p-4 text-white text-sm placeholder:text-light-600 border border-input focus:outline-none focus:border-fuchsia-400 transition-colors h-44 resize-none leading-relaxed"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-white/30 text-xs">
                        {cvPastedText.trim().length} caracteres
                      </span>
                      {cvPastedText.trim().length > 0 &&
                        cvPastedText.trim().length < 50 && (
                          <span className="text-rose-400 text-xs">
                            Mínimo 50 caracteres
                          </span>
                        )}
                    </div>
                  </div>
                )}

                {/* Analyze CTA */}
                <button
                  onClick={runAnalysis}
                  disabled={!canAnalyze}
                  className={cn(
                    "w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-md cursor-pointer",
                    !canAnalyze
                      ? "bg-dark-300 border border-white/5 text-white/30 cursor-not-allowed"
                      : isAnalyzing
                      ? "bg-indigo-700/50 text-indigo-200 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] hover:scale-[1.01]"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analizando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analizar compatibilidad ATS
                    </>
                  )}
                </button>

                {isAnalyzing && (
                  <p className="text-center text-white/40 text-xs animate-pulse">
                    Gemini AI está leyendo tu CV y comparándolo con la oferta...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Results Section ────────────────────────────────────────────────── */
        <div className="flex flex-col gap-6 w-full">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-200 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">
                  Análisis completado por Gemini AI
                </span>
                <span className="text-white/40 text-[11px]">
                  Archivo: {analyzedFileName}
                </span>
              </div>
            </div>

            <button
              onClick={resetAnalysis}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-dark-300 hover:bg-dark-400 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Analizar otro CV
            </button>
          </div>

          {/* AI Summary card */}
          {results.summary && (
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
              <Sparkles className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
              <p className="text-indigo-200 text-sm leading-relaxed">
                {results.summary}
              </p>
            </div>
          )}

          {/* Score + breakdown */}
          <AtsScoreCard
            score={results.score}
            breakdown={results.breakdown}
          />

          {/* Keywords */}
          <KeywordsPanel
            matchedKeywords={results.matchedKeywords}
            missingKeywords={results.missingKeywords}
          />

          {/* Suggestions */}
          <SuggestionCard suggestions={results.suggestions} />
        </div>
      )}
    </div>
  );
};

export default CvAnalyzerUpload;
