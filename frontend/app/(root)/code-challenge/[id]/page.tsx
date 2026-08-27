"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[380px] flex items-center justify-center bg-[#141619] border-none text-white/40 font-mono text-sm">
      Cargando editor de código...
    </div>
  ),
});

import {
  Code2,
  Play,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  Zap,
  ChevronLeft,
  AlertCircle,
  TrendingUp,
  ThumbsUp,
  Wrench,
  Layers,
  ShieldCheck,
  Flame,
  FileCode2,
} from "lucide-react";
import { getProblemById, DIFFICULTY_LABELS, DIFFICULTY_COLORS } from "@/lib/problems";

// ──────────────────────────────────────────────
// Test runner (browser-safe JS execution)
// ──────────────────────────────────────────────
function runTestCases(
  code: string,
  functionName: string,
  testCases: { input: unknown[]; expected: unknown; label?: string }[]
) {
  const results: {
    input: string;
    expected: string;
    got: string;
    ok: boolean;
    label?: string;
  }[] = [];
  let passed = 0;

  for (const tc of testCases) {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${code})`)();
      if (typeof fn !== "function") throw new Error("La función no fue retornada correctamente.");

      const args = tc.input.map((a) => JSON.parse(JSON.stringify(a))); // deep copy
      const got = fn(...args);
      const gotStr = JSON.stringify(got);
      const expectedStr = JSON.stringify(tc.expected);
      const ok = gotStr === expectedStr;
      if (ok) passed++;

      results.push({
        input: tc.label ?? tc.input.map((a) => JSON.stringify(a)).join(", "),
        expected: expectedStr,
        got: gotStr,
        ok,
      });
    } catch (e: unknown) {
      results.push({
        input: tc.label ?? tc.input.map((a) => JSON.stringify(a)).join(", "),
        expected: JSON.stringify(tc.expected),
        got: `Error: ${e instanceof Error ? e.message : String(e)}`,
        ok: false,
      });
    }
  }

  return { passed, total: testCases.length, results };
}

// ──────────────────────────────────────────────
// Feedback de IA via API Route
// ──────────────────────────────────────────────
interface AIFeedback {
  score: number;
  complexity: { time: string; space: string };
  patternAnalysis?: {
    isPatternApplied: boolean;
    patternName: string;
    solidAdherence: string;
  };
  codeSmellsEliminated?: string[];
  strengths: string[];
  improvements: string[];
  interviewerTip: string;
}

async function fetchAIFeedback(
  code: string,
  problemTitle: string,
  problemDescription: string,
  passedCount: number,
  totalCount: number,
  isDesignPattern: boolean
): Promise<AIFeedback> {
  const res = await fetch("/api/proxy/code/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      problemTitle,
      problemDescription,
      passedCount,
      totalCount,
      isDesignPattern,
    }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Error al generar feedback");
  return data.feedback;
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function ProblemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const problem = getProblemById(id);

  const [code, setCode] = useState("");
  const [testOutput, setTestOutput] = useState<ReturnType<typeof runTestCases> | null>(null);
  const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [activeHint, setActiveHint] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"description" | "spaghetti" | "results" | "feedback">("description");

  const isPatternChallenge = problem?.category.includes("Patrones de Diseño") ?? false;

  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    monaco.editor.defineTheme("devcareer-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: {
        "editor.background": "#141619",
        "editor.lineHighlightBackground": "#1d2025",
        "editorCursor.foreground": "#22d3ee",
        "editorLineNumber.foreground": "#4b5563",
        "editorLineNumber.activeForeground": "#22d3ee",
      },
    });
    monaco.editor.setTheme("devcareer-dark");
  }, []);

  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode);
    }
  }, [problem]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    if (timerStarted || !problem) return;
    setTimerStarted(true);
    setTimeLeft(problem.timeLimit * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [timerStarted, problem]);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (!timerStarted) startTimer();
  };

  const handleRun = () => {
    if (!problem) return;
    if (!timerStarted) startTimer();
    setIsRunning(true);
    setTimeout(() => {
      const result = runTestCases(code, problem.functionName, problem.testCases);
      setTestOutput(result);
      setActiveTab("results");
      setIsRunning(false);
    }, 400);
  };

  const handleSubmit = async () => {
    if (!problem || submitted) return;
    if (!timerStarted) startTimer();
    setIsSubmitting(true);

    const result = runTestCases(code, problem.functionName, problem.testCases);
    setTestOutput(result);

    try {
      const feedback = await fetchAIFeedback(
        code,
        problem.title,
        problem.description,
        result.passed,
        result.total,
        isPatternChallenge
      );
      setAIFeedback(feedback);
      setSubmitted(true);
      setActiveTab("feedback");

      // Guardar progreso resuelto en localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("devcareer_solved_challenges") || "{}");
        stored[problem.id] = { score: feedback.score, solvedAt: new Date().toISOString() };
        localStorage.setItem("devcareer_solved_challenges", JSON.stringify(stored));
      } catch (e) {
        console.error("No se pudo persistir en localStorage:", e);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (!problem) return;
    setCode(problem.starterCode);
    setTestOutput(null);
    setAIFeedback(null);
    setSubmitted(false);
    setActiveHint(null);
    setActiveTab("description");
    if (timerRef.current) clearInterval(timerRef.current);
    setTimerStarted(false);
    setTimeLeft(null);
  };

  if (!problem) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <AlertCircle className="w-10 h-10 text-white/20" />
        <p className="text-white/50">Problema no encontrado.</p>
        <Link href="/code-challenge" className="text-cyan-400 text-sm hover:underline">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 min-h-screen pb-12">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/code-challenge"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al listado de retos
        </Link>

        <div className="flex items-center gap-3">
          {isPatternChallenge && problem.patternObjective && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              {problem.patternObjective}
            </span>
          )}

          {/* Timer */}
          {timerStarted && timeLeft !== null && (
            <span
              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border transition-colors ${
                timeLeft < 120
                  ? "text-red-400 border-red-400/30 bg-red-400/5 animate-pulse"
                  : timeLeft < 300
                  ? "text-amber-400 border-amber-400/20 bg-amber-400/5"
                  : "text-white/40 border-white/10"
              }`}
            >
              <Clock className="w-3 h-3" />
              {formatTime(timeLeft)}
            </span>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:text-white hover:border-zinc-600 transition-all text-xs cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Main layout: two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* ── Left panel ── */}
        <div className="flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1 w-fit flex-wrap">
            <button
              onClick={() => setActiveTab("description")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "description"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Enunciado</span>
            </button>

            {problem.legacySpaghettiCode && (
              <button
                onClick={() => setActiveTab("spaghetti")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "spaghetti"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-amber-400/70 hover:text-amber-300"
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>👀 Código Spaghetti (Antes)</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab("results")}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "results"
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Test Cases</span>
              {testOutput !== null && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("feedback")}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "feedback"
                  ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                  : "text-indigo-400 hover:text-indigo-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Feedback IA</span>
              {aiFeedback !== null && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          </div>

          {/* Tab: Description */}
          {activeTab === "description" && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-zinc-800/80 p-6 flex flex-col gap-5">
              {/* Title + meta */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h2 className="text-white font-bold text-lg">{problem.title}</h2>
                  <span
                    className={`text-xs font-semibold border px-2.5 py-0.5 rounded-full ${DIFFICULTY_COLORS[problem.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[problem.difficulty]}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {problem.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700 text-zinc-300 text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-800/60 border border-zinc-700 text-zinc-400 text-xs ml-auto">
                    <Clock className="w-3 h-3" />
                    {problem.timeLimit} min
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line border-t border-zinc-800/60 pt-4">
                {problem.description}
              </div>

              {/* Examples */}
              <div className="flex flex-col gap-3 border-t border-zinc-800/60 pt-4">
                <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                  Ejemplos
                </p>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 text-xs font-mono"
                  >
                    <div>
                      <span className="text-zinc-500">Entrada: </span>
                      <span className="text-zinc-200">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Salida: </span>
                      <span className="text-emerald-400">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div className="text-zinc-400 font-sans text-xs pt-1 border-t border-zinc-800/40 mt-1">
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hints */}
              {problem.hints.length > 0 && (
                <div className="flex flex-col gap-2 border-t border-zinc-800/60 pt-4">
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Pistas
                  </p>
                  {problem.hints.map((hint, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveHint(activeHint === i ? null : i)}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                      >
                        <span>Pista {i + 1}</span>
                        <ChevronDown
                          className={`w-3.5 h-3.5 transition-transform ${
                            activeHint === i ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {activeHint === i && (
                        <p className="px-4 pb-3 text-xs text-zinc-300 leading-relaxed border-t border-zinc-800/40 pt-2">
                          {hint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Spaghetti Code (Before refactor) */}
          {activeTab === "spaghetti" && problem.legacySpaghettiCode && (
            <div className="rounded-2xl bg-gradient-to-b from-[#251814] to-[#0d0908] border border-amber-500/20 p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                <span>Código Legacy (Con Malos Olores)</span>
              </div>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Este es el código antes de la refactorización. Observa cómo viola el principio Open/Closed o genera alto acoplamiento. Tu objetivo es desacoplarlo en el editor.
              </p>
              <pre className="p-4 rounded-xl bg-black/50 border border-amber-500/10 text-amber-200/90 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
                {problem.legacySpaghettiCode}
              </pre>
            </div>
          )}

          {/* Tab: Test Results */}
          {activeTab === "results" && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-zinc-800/80 p-6 flex flex-col gap-4">
              {testOutput ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-sm">
                      Resultados ({testOutput.passed}/{testOutput.total} pasados)
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        testOutput.passed === testOutput.total
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {testOutput.passed === testOutput.total ? "Completado" : "Fallos detectados"}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {testOutput.results.map((res, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border flex flex-col gap-1.5 text-xs font-mono ${
                          res.ok
                            ? "bg-emerald-500/5 border-emerald-500/20"
                            : "bg-red-500/5 border-red-500/20"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-400">Test {i + 1}</span>
                          <span className={res.ok ? "text-emerald-400" : "text-red-400"}>
                            {res.ok ? "PASSED ✓" : "FAILED ✗"}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Entrada: </span>
                          <span className="text-zinc-300">{res.input}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Esperado: </span>
                          <span className="text-emerald-400">{res.expected}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Obtenido: </span>
                          <span className={res.ok ? "text-emerald-400" : "text-red-400"}>
                            {res.got}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Play className="w-8 h-8 text-zinc-600" />
                  <p className="text-zinc-400 text-sm">
                    Ejecuta tu código para ver los resultados de las pruebas
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: AI Feedback */}
          {activeTab === "feedback" && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-zinc-800/80 p-6 flex flex-col gap-5">
              {aiFeedback ? (
                <>
                  {/* Score circle + complexity */}
                  <div className="flex items-center gap-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
                    <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                        <circle
                          cx="36"
                          cy="36"
                          r="32"
                          className="text-zinc-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                        />
                        <circle
                          cx="36"
                          cy="36"
                          r="32"
                          fill="transparent"
                          stroke={
                            aiFeedback.score >= 80
                              ? "#34d399"
                              : aiFeedback.score >= 55
                              ? "#fbbf24"
                              : "#f87171"
                          }
                          strokeWidth="8"
                          strokeDasharray={`${(aiFeedback.score / 100) * 201} 201`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-white font-bold text-lg">
                        {aiFeedback.score}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        Evaluación Técnica
                      </p>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-zinc-400 text-xs">Tiempo:</span>
                          <span className="text-cyan-300 font-mono text-xs">
                            {aiFeedback.complexity.time}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <Code2 className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-zinc-400 text-xs">Espacio:</span>
                          <span className="text-violet-300 font-mono text-xs">
                            {aiFeedback.complexity.space}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pattern & SOLID analysis badge if present */}
                  {aiFeedback.patternAnalysis && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                          <Layers className="w-4 h-4" />
                          Patrón GoF: {aiFeedback.patternAnalysis.patternName}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            aiFeedback.patternAnalysis.isPatternApplied
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {aiFeedback.patternAnalysis.isPatternApplied ? "Patrón Aplicado ✓" : "Sin Desacoplar"}
                        </span>
                      </div>
                      <p className="text-zinc-300 text-xs leading-relaxed">
                        {aiFeedback.patternAnalysis.solidAdherence}
                      </p>
                    </div>
                  )}

                  {/* Code smells eliminated */}
                  {aiFeedback.codeSmellsEliminated && aiFeedback.codeSmellsEliminated.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" />
                        Code Smells Eliminados
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {aiFeedback.codeSmellsEliminated.map((smell, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                            <span>{smell}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Strengths */}
                  {aiFeedback.strengths.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        Fortalezas
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {aiFeedback.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {aiFeedback.improvements.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        Áreas de mejora
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {aiFeedback.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interviewer tip */}
                  <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-violet-300 text-xs font-semibold uppercase tracking-wider">
                        Consejo del entrevistador
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {aiFeedback.interviewerTip}
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Zap className="w-8 h-8 text-zinc-600" />
                  <p className="text-zinc-400 text-sm">
                    Envía tu solución para obtener la evaluación completa de IA con métricas SOLID y Big-O
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: Editor ── */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-zinc-800/80 overflow-hidden flex flex-col shadow-2xl">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-zinc-400 text-xs ml-2 font-mono">solution.js</span>
              </div>
              <span className="text-zinc-400 text-[10px] font-semibold uppercase tracking-wider">
                JavaScript ES6
              </span>
            </div>

            {/* Monaco Editor */}
            <div className="w-full h-[400px] bg-[#141619]">
              <Editor
                height="100%"
                language="javascript"
                value={code}
                onChange={(val) => handleCodeChange(val ?? "")}
                onMount={handleEditorDidMount}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: "var(--font-mono), Menlo, Monaco, 'Courier New', monospace",
                  lineNumbers: "on",
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  readOnly: submitted,
                  domReadOnly: submitted,
                  padding: { top: 12, bottom: 12 },
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                  contextmenu: false,
                }}
              />
            </div>

            {/* Action bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-zinc-800 bg-zinc-950/40">
              <button
                id="run-code-btn"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all text-sm font-semibold disabled:opacity-40 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                {isRunning ? "Ejecutando..." : "Ejecutar Tests"}
              </button>

              <button
                id="submit-code-btn"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || submitted}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all text-sm font-semibold disabled:opacity-40 cursor-pointer ml-auto"
              >
                <Zap className="w-3.5 h-3.5" />
                {isSubmitting ? "Analizando con IA..." : submitted ? "Enviado ✓" : "Evaluar Solución"}
              </button>
            </div>
          </div>

          {/* Inline test results preview */}
          {testOutput && activeTab !== "results" && (
            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all cursor-pointer ${
                testOutput.passed === testOutput.total
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {testOutput.passed === testOutput.total ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-semibold text-xs">
                  {testOutput.passed}/{testOutput.total} test cases pasados
                </span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}

          {submitted && (
            <div className="flex items-center gap-3">
              <Link
                href="/code-challenge"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all text-sm font-medium"
              >
                Ver todos los retos
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
