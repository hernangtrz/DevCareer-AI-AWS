"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Upload,
  Briefcase,
  FileText,
  Loader2,
  RefreshCw,
  Sparkles,
  Check,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import AtsScoreCard from "./AtsScoreCard";
import KeywordsPanel from "./KeywordsPanel";
import SuggestionCard from "./SuggestionCard";

// Presets
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
    analysis: {
      score: 84,
      breakdown: { keywords: 88, formatting: 92, grammar: 85, impact: 70 },
      matchedKeywords: ["React", "TypeScript", "Tailwind CSS", "Git", "REST APIs"],
      missingKeywords: ["Next.js", "Framer Motion", "GraphQL", "Redux"],
      suggestions: [
        {
          category: "formatting" as const,
          title: "Agrega experiencia con Next.js",
          description: "La oferta especifica Next.js como framework altamente valorado. Agrega algún proyecto o mención a tu CV.",
          severity: "high" as const,
        },
        {
          category: "impact" as const,
          title: "Incluye métricas de rendimiento en frontend",
          description: "Menciona cómo optimizaste cargas web o mejoras en Core Web Vitals en tus proyectos pasados.",
          severity: "medium" as const,
        },
        {
          category: "structure" as const,
          title: "Falta enlace a portafolio web",
          description: "Los reclutadores de Frontend aprecian ver un link directo a tus proyectos desplegados.",
          severity: "low" as const,
        },
      ],
    },
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
    analysis: {
      score: 62,
      breakdown: { keywords: 58, formatting: 75, grammar: 80, impact: 52 },
      matchedKeywords: ["Python", "SQL", "Git", "Docker"],
      missingKeywords: ["Django", "FastAPI", "Redis", "PostgreSQL", "CI/CD"],
      suggestions: [
        {
          category: "grammar" as const,
          title: "Menciona Django o FastAPI de forma explícita",
          description: "Tu currículum describe backend general pero no menciona frameworks web modernos clave en la oferta.",
          severity: "high" as const,
        },
        {
          category: "impact" as const,
          title: "Detalla bases de datos relacionales",
          description: "La vacante requiere experiencia fuerte en optimización de consultas SQL y PostgreSQL. Detalla esto en tus experiencias laborales.",
          severity: "high" as const,
        },
        {
          category: "structure" as const,
          title: "Falta mención de CI/CD",
          description: "Añade alguna mención a pipelines automatizados (ej: Github Actions, GitLab CI/CD) que hayas configurado.",
          severity: "medium" as const,
        },
      ],
    },
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
    analysis: {
      score: 41,
      breakdown: { keywords: 35, formatting: 60, grammar: 75, impact: 30 },
      matchedKeywords: ["Manual Testing", "SQL", "Git"],
      missingKeywords: ["Selenium", "Cypress", "Python", "API Testing", "Postman", "CI/CD"],
      suggestions: [
        {
          category: "structure" as const,
          title: "Falta automatización en tu perfil",
          description: "Tu currículum actual denota un perfil puramente de QA Manual. Destaca scripts creados con Selenium o Cypress.",
          severity: "high" as const,
        },
        {
          category: "grammar" as const,
          title: "Añade lenguajes de scripting",
          description: "Se requiere experiencia escribiendo scripts en JavaScript o Python. Agrégalos a la sección de Habilidades.",
          severity: "high" as const,
        },
        {
          category: "impact" as const,
          title: "Describe pruebas de API",
          description: "Añade experiencia haciendo pruebas de integración o API utilizando herramientas como Postman.",
          severity: "medium" as const,
        },
      ],
    },
  },
];

const CvAnalyzerUpload = () => {
  const [jobText, setJobText] = useState(JOB_PRESETS[0].description);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [results, setResults] = useState<typeof JOB_PRESETS[0]["analysis"] | null>(null);

  const handleSelectPreset = (id: string) => {
    const p = JOB_PRESETS.find((x) => x.id === id);
    if (p) setJobText(p.description);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".pdf") || file.name.endsWith(".docx"))) {
      setFileName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const runAnalysis = () => {
    if (!fileName) return;

    setIsAnalyzing(true);
    // Simulate API analysis
    setTimeout(() => {
      // Find matching preset based on keywords in jobText or fall back to preset
      const preset = JOB_PRESETS.find((p) =>
        jobText.toLowerCase().includes(p.id) ||
        p.description.toLowerCase().includes(p.id)
      ) || JOB_PRESETS[0];

      setResults(preset.analysis);
      setIsAnalyzing(false);
    }, 2500);
  };

  const resetAnalysis = () => {
    setResults(null);
    setFileName(null);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {!results ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
          {/* Job description input panel */}
          <div className="card-border">
            <div className="card p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <Briefcase className="h-4.5 w-4.5 text-indigo-400" />
                  1. Oferta de empleo / Perfil requerido
                </h3>
                <p className="text-white/50 text-xs">
                  Pega la descripción de la vacante a la que quieres aplicar o elige uno de nuestros ejemplos.
                </p>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {JOB_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPreset(p.id)}
                    className="px-3 py-1.5 rounded-xl bg-dark-200 border border-white/5 text-white/70 hover:border-indigo-400 hover:text-white transition-all text-xs font-semibold cursor-pointer"
                  >
                    💡 {p.title}
                  </button>
                ))}
              </div>

              <textarea
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
                placeholder="Pega aquí la descripción detallada de la oferta..."
                className="bg-dark-200 rounded-2xl p-4 text-white text-sm placeholder:text-light-600 border border-input focus:outline-none focus:border-indigo-400 transition-colors h-64 resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* CV upload panel */}
          <div className="card-border">
            <div className="card p-6 flex flex-col gap-6 justify-between h-full">
              <div className="flex flex-col gap-1">
                <h3 className="text-white text-base font-bold flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-fuchsia-400" />
                  2. Sube tu Currículum (CV)
                </h3>
                <p className="text-white/50 text-xs">
                  Formatos soportados: PDF, DOCX. Peso máximo 10MB.
                </p>
              </div>

              {/* Drag zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
                  isDragging
                    ? "border-fuchsia-500 bg-fuchsia-500/5"
                    : fileName
                    ? "border-emerald-500/40 bg-emerald-500/[0.02]"
                    : "border-white/10 bg-dark-200 hover:border-indigo-500/30"
                )}
                onClick={() => {
                  if (!fileName) document.getElementById("file-input")?.click();
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx"
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
                          setFileName(null);
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
                        Arrastra tu archivo aquí o <span className="text-indigo-400">explora</span>
                      </span>
                      <span className="text-white/30 text-xs">
                        Tu archivo será analizado localmente por seguridad
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                onClick={runAnalysis}
                disabled={!fileName || isAnalyzing}
                className={cn(
                  "w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-all shadow-md cursor-pointer",
                  !fileName
                    ? "bg-dark-300 border border-white/5 text-white/30 cursor-not-allowed"
                    : isAnalyzing
                    ? "bg-indigo-700/50 text-indigo-200 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:scale-[1.01]"
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analizando compatibilidad...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Comenzar Análisis ATS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="flex flex-col gap-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-200 border border-white/5 p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
                <FileCheck2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">Análisis Completado</span>
                <span className="text-white/40 text-[11px]">Archivo: {fileName}</span>
              </div>
            </div>

            <button
              onClick={resetAnalysis}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-dark-300 hover:bg-dark-400 border border-white/10 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Analizar otro currículum
            </button>
          </div>

          <AtsScoreCard score={results.score} breakdown={results.breakdown} />
          
          <KeywordsPanel
            matchedKeywords={results.matchedKeywords}
            missingKeywords={results.missingKeywords}
          />

          <SuggestionCard suggestions={results.suggestions} />
        </div>
      )}
    </div>
  );
};

export default CvAnalyzerUpload;
