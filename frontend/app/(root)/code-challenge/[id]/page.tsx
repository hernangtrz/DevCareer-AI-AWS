"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  strengths: string[];
  improvements: string[];
  interviewerTip: string;
}

async function fetchAIFeedback(
  code: string,
  problemTitle: string,
  problemDescription: string,
  passedCount: number,
  totalCount: number
): Promise<AIFeedback> {
  const res = await fetch("/api/code/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code, problemTitle, problemDescription, passedCount, totalCount }),
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
  const [showSolution, setShowSolution] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "results" | "feedback">("description");

  // Timer
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
        result.total
      );
      setAIFeedback(feedback);
      setSubmitted(true);
      setActiveTab("feedback");
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
    setShowSolution(false);
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
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al listado
        </Link>

        <div className="flex items-center gap-3">
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
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 text-white/30 hover:text-white/60 hover:border-white/20 transition-all text-xs"
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
          <div className="flex items-center gap-1 bg-white/[0.03] border border-white/10 rounded-xl p-1 w-fit">
            {(
              [
                { key: "description", label: "Problema" },
                { key: "results", label: "Test Cases", dot: testOutput !== null },
                { key: "feedback", label: "Feedback IA", dot: aiFeedback !== null },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab.label}
                {"dot" in tab && tab.dot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </button>
            ))}
          </div>

          {/* Tab: Description */}
          {activeTab === "description" && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 p-6 flex flex-col gap-5">
              {/* Title + meta */}
              <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <h2 className="text-white font-bold text-lg">{problem.title}</h2>
                  <span
                    className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[problem.difficulty]}`}
                  >
                    {DIFFICULTY_LABELS[problem.difficulty]}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {problem.category.map((cat) => (
                    <span
                      key={cat}
                      className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs"
                    >
                      {cat}
                    </span>
                  ))}
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-xs ml-auto">
                    <Clock className="w-3 h-3" />
                    {problem.timeLimit} min
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                {problem.description}
              </div>

              {/* Examples */}
              <div className="flex flex-col gap-3">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
                  Ejemplos
                </p>
                {problem.examples.map((ex, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex flex-col gap-2 text-sm font-mono"
                  >
                    <div>
                      <span className="text-white/30 text-xs block mb-0.5">Entrada:</span>
                      <span className="text-cyan-300">{ex.input}</span>
                    </div>
                    <div>
                      <span className="text-white/30 text-xs block mb-0.5">Salida:</span>
                      <span className="text-emerald-300">{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div>
                        <span className="text-white/30 text-xs block mb-0.5">Explicación:</span>
                        <span className="text-white/50 font-sans text-xs">{ex.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Hints */}
              {problem.hints.length > 0 && (
                <div className="flex flex-col gap-2">
                  {problem.hints.map((hint, i) => (
                    <div key={i}>
                      <button
                        onClick={() => setActiveHint(activeHint === i ? null : i)}
                        className="flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors"
                      >
                        <Lightbulb className="w-4 h-4" />
                        Pista {i + 1}
                        {activeHint === i ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </button>
                      {activeHint === i && (
                        <div className="mt-2 rounded-xl bg-amber-400/5 border border-amber-400/15 p-3 text-sm text-amber-200/80">
                          {hint}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Test Results */}
          {activeTab === "results" && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 p-5 flex flex-col gap-4">
              {testOutput ? (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                      Casos de prueba
                    </p>
                    <span
                      className={`text-sm font-semibold ${
                        testOutput.passed === testOutput.total
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {testOutput.passed}/{testOutput.total} pasados
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    {testOutput.results.map((r, i) => (
                      <div
                        key={i}
                        className={`rounded-xl p-3 border text-sm flex flex-col gap-1 font-mono ${
                          r.ok
                            ? "bg-emerald-500/5 border-emerald-400/15"
                            : "bg-red-500/5 border-red-400/15"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {r.ok ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          )}
                          <span className="text-white/50 text-xs truncate">{r.input}</span>
                        </div>
                        {!r.ok && (
                          <div className="pl-6 flex flex-col gap-0.5">
                            <span className="text-white/30 text-xs">
                              Esperado:{" "}
                              <span className="text-emerald-300">{r.expected}</span>
                            </span>
                            <span className="text-white/30 text-xs">
                              Obtenido:{" "}
                              <span className="text-red-300">{r.got}</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Play className="w-8 h-8 text-white/10" />
                  <p className="text-white/30 text-sm">
                    Ejecuta tu código para ver los resultados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab: AI Feedback */}
          {activeTab === "feedback" && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 p-6 flex flex-col gap-5">
              {aiFeedback ? (
                <>
                  {/* Score + Complexity */}
                  <div className="flex items-center gap-5">
                    <div className="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                      <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
                          stroke="rgba(255,255,255,0.05)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="40"
                          cy="40"
                          r="32"
                          fill="none"
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
                      <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                        Complejidad detectada
                      </p>
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 text-sm">
                          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-white/50 text-xs">Tiempo:</span>
                          <span className="text-cyan-300 font-mono text-xs">
                            {aiFeedback.complexity.time}
                          </span>
                        </span>
                        <span className="flex items-center gap-2 text-sm">
                          <Code2 className="w-3.5 h-3.5 text-violet-400" />
                          <span className="text-white/50 text-xs">Espacio:</span>
                          <span className="text-violet-300 font-mono text-xs">
                            {aiFeedback.complexity.space}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Strengths */}
                  {aiFeedback.strengths.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                          Fortalezas
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {aiFeedback.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                            <span className="text-white/70">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {aiFeedback.improvements.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                          Áreas de mejora
                        </p>
                      </div>
                      <ul className="flex flex-col gap-1.5">
                        {aiFeedback.improvements.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                            <span className="text-white/70">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Interviewer tip */}
                  <div className="rounded-xl bg-violet-500/5 border border-violet-400/15 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-3.5 h-3.5 text-violet-400" />
                      <span className="text-violet-300 text-xs font-semibold uppercase tracking-wider">
                        Consejo del entrevistador
                      </span>
                    </div>
                    <p className="text-white/70 text-sm leading-relaxed">
                      {aiFeedback.interviewerTip}
                    </p>
                  </div>

                  {/* Try again */}
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Intentar de nuevo
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <Zap className="w-8 h-8 text-white/10" />
                  <p className="text-white/30 text-sm">
                    Envía tu solución para obtener feedback de IA
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right panel: Editor ── */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 overflow-hidden flex flex-col">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-green-500/60" />
                <span className="text-white/20 text-xs ml-2 font-mono">solution.js</span>
              </div>
              <span className="text-white/20 text-[10px] font-semibold uppercase tracking-wider">
                JavaScript
              </span>
            </div>

            {/* Textarea editor */}
            <textarea
              id="code-editor"
              value={code}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full bg-transparent text-emerald-200 font-mono text-sm p-5 resize-none outline-none min-h-[380px] leading-relaxed"
              spellCheck={false}
              placeholder="Escribe tu solución aquí..."
              disabled={submitted}
            />

            {/* Action bar */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10">
              <button
                id="run-code-btn"
                onClick={handleRun}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5" />
                {isRunning ? "Ejecutando..." : "Ejecutar"}
              </button>

              <button
                id="submit-code-btn"
                onClick={handleSubmit}
                disabled={isRunning || isSubmitting || submitted}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-all text-sm font-semibold disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5" />
                {isSubmitting ? "Analizando con IA..." : submitted ? "Enviado" : "Enviar solución"}
              </button>
            </div>
          </div>

          {/* Inline test results preview (compact) */}
          {testOutput && activeTab !== "results" && (
            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                testOutput.passed === testOutput.total
                  ? "bg-emerald-500/5 border-emerald-400/15 text-emerald-400"
                  : "bg-amber-500/5 border-amber-400/15 text-amber-400"
              }`}
            >
              <div className="flex items-center gap-2">
                {testOutput.passed === testOutput.total ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="font-semibold">
                  {testOutput.passed}/{testOutput.total} test cases pasados
                </span>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </button>
          )}

          {/* Navigation to next problem */}
          {submitted && (
            <div className="flex items-center gap-3">
              <Link
                href="/code-challenge"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/50 hover:text-white hover:bg-white/[0.06] transition-all text-sm"
              >
                Ver todos los problemas
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
