"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
} from "lucide-react";

// ──────────────────────────────────────────────
// Problema de ejemplo (beta: hardcoded)
// ──────────────────────────────────────────────
const SAMPLE_PROBLEM = {
  id: "two-sum",
  title: "Suma de dos números",
  titleEn: "Two Sum",
  difficulty: "Fácil",
  difficultyEn: "Easy",
  difficultyColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  tags: ["Arreglos", "Hash Map"],
  tagsEn: ["Arrays", "Hash Map"],
  timeLimit: "15 min",
  description: `Dado un arreglo de enteros \`nums\` y un entero \`target\`, retorna los índices de los dos números que suman \`target\`.

Puedes asumir que cada entrada tiene exactamente una solución, y no puedes usar el mismo elemento dos veces.

Puedes retornar la respuesta en cualquier orden.`,
  descriptionEn: `Given an array of integers \`nums\` and an integer \`target\`, return the indices of the two numbers that add up to \`target\`.

You may assume that each input has exactly one solution, and you may not use the same element twice.

You may return the answer in any order.`,
  examples: [
    {
      input: "nums = [2, 7, 11, 15], target = 9",
      output: "[0, 1]",
      explanation: "nums[0] + nums[1] = 2 + 7 = 9",
    },
    {
      input: "nums = [3, 2, 4], target = 6",
      output: "[1, 2]",
      explanation: "nums[1] + nums[2] = 2 + 4 = 6",
    },
  ],
  starterCode: `function twoSum(nums, target) {
  // Escribe tu solución aquí
  
}`,
  optimalSolution: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
}`,
  testCases: [
    { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
    { input: [[3, 2, 4], 6], expected: [1, 2] },
    { input: [[3, 3], 6], expected: [0, 1] },
  ],
};

// ──────────────────────────────────────────────
// Evaluación simple del código (beta)
// ──────────────────────────────────────────────
function evaluateCode(code: string): {
  passed: number;
  total: number;
  results: { input: string; expected: string; got: string; ok: boolean }[];
} {
  const results = [];
  let passed = 0;

  for (const tc of SAMPLE_PROBLEM.testCases) {
    try {
      // eslint-disable-next-line no-new-func
      const fn = new Function(`return (${code})`)();
      const got = JSON.stringify(fn(...tc.input));
      const expected = JSON.stringify(tc.expected);
      const ok = got === expected;
      if (ok) passed++;
      results.push({
        input: `nums=${JSON.stringify(tc.input[0])}, target=${tc.input[1]}`,
        expected,
        got,
        ok,
      });
    } catch (e: unknown) {
      results.push({
        input: `nums=${JSON.stringify(tc.input[0])}, target=${tc.input[1]}`,
        expected: JSON.stringify(tc.expected),
        got: `Error: ${e instanceof Error ? e.message : String(e)}`,
        ok: false,
      });
    }
  }

  return { passed, total: SAMPLE_PROBLEM.testCases.length, results };
}

// ──────────────────────────────────────────────
// Feedback generativo simulado (beta)
// ──────────────────────────────────────────────
function generateFeedback(
  code: string,
  passed: number,
  total: number
): { score: number; efficiency: string; feedback: string; tip: string } {
  const isOptimal = code.includes("Map") || code.includes("map");
  const hasLoop = code.includes("for") || code.includes("while");
  const hasNestedLoop =
    (code.match(/for/g) || []).length >= 2 ||
    (code.match(/while/g) || []).length >= 2;

  const score =
    passed === total ? (isOptimal ? 95 : hasNestedLoop ? 65 : 80) : Math.round((passed / total) * 60);

  const efficiency = isOptimal
    ? "O(n) tiempo, O(n) espacio"
    : hasNestedLoop
    ? "O(n²) tiempo, O(1) espacio"
    : hasLoop
    ? "O(n) tiempo estimado"
    : "No determinado";

  const feedback =
    passed < total
      ? "Tu solución no pasa todos los casos de prueba. Revisa los casos límite y asegúrate de que el retorno sea correcto."
      : isOptimal
      ? "Excelente solución. Usas un Hash Map para reducir la complejidad a O(n), que es la solución óptima para este problema."
      : hasNestedLoop
      ? "Tu solución es correcta pero tiene complejidad O(n²) por el doble ciclo. En entrevistas reales esto puede costar puntos. Considera usar un Hash Map para mejorar a O(n)."
      : "Tu solución es correcta. Considera analizar si se puede optimizar aún más la complejidad temporal.";

  const tip = isOptimal
    ? "En una entrevista real, menciona explícitamente la complejidad O(n) y por qué elegiste un Map sobre un objeto literal."
    : "Tip del entrevistador: pregunta '¿Puedo usar espacio adicional?' antes de plantear la solución de doble ciclo.";

  return { score, efficiency, feedback, tip };
}

// ──────────────────────────────────────────────
// Componente principal
// ──────────────────────────────────────────────
export default function CodeChallengePage() {
  const [code, setCode] = useState(SAMPLE_PROBLEM.starterCode);
  const [output, setOutput] = useState<ReturnType<typeof evaluateCode> | null>(null);
  const [feedback, setFeedback] = useState<ReturnType<typeof generateFeedback> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);

  // Timer simple
  const startTimer = () => {
    if (timerStarted) return;
    setTimerStarted(true);
    setTimeLeft(15 * 60);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const handleRun = () => {
    if (!timerStarted) startTimer();
    setIsRunning(true);
    setTimeout(() => {
      const result = evaluateCode(code);
      setOutput(result);
      setIsRunning(false);
    }, 600);
  };

  const handleSubmit = () => {
    if (!timerStarted) startTimer();
    setIsRunning(true);
    setTimeout(() => {
      const result = evaluateCode(code);
      const fb = generateFeedback(code, result.passed, result.total);
      setOutput(result);
      setFeedback(fb);
      setSubmitted(true);
      setIsRunning(false);
    }, 900);
  };

  const handleReset = () => {
    setCode(SAMPLE_PROBLEM.starterCode);
    setOutput(null);
    setFeedback(null);
    setSubmitted(false);
    setShowSolution(false);
    setShowHint(false);
  };

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Code2 className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-white text-xl font-bold">Prueba técnica de código</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                Beta
              </span>
            </div>
            <p className="text-white/50 text-sm mt-0.5">
              Simula la prueba de código de una entrevista técnica real
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal: dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Columna izquierda: descripción del problema ── */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 p-6 flex flex-col gap-5">
            {/* Título y badges */}
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <h3 className="text-white font-bold text-lg">{SAMPLE_PROBLEM.title}</h3>
                <span
                  className={`text-xs font-semibold border px-2 py-0.5 rounded-full ${SAMPLE_PROBLEM.difficultyColor}`}
                >
                  {SAMPLE_PROBLEM.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {SAMPLE_PROBLEM.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs"
                  >
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs">
                  <Clock className="w-3 h-3" />
                  {SAMPLE_PROBLEM.timeLimit}
                </span>
              </div>
            </div>

            {/* Descripción */}
            <div className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
              {SAMPLE_PROBLEM.description}
            </div>

            {/* Ejemplos */}
            <div className="flex flex-col gap-3">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Ejemplos</p>
              {SAMPLE_PROBLEM.examples.map((ex, i) => (
                <div key={i} className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex flex-col gap-1.5 text-sm font-mono">
                  <span className="text-white/40 text-xs">Entrada:</span>
                  <span className="text-cyan-300">{ex.input}</span>
                  <span className="text-white/40 text-xs mt-1">Salida:</span>
                  <span className="text-emerald-300">{ex.output}</span>
                  <span className="text-white/40 text-xs mt-1">Explicación:</span>
                  <span className="text-white/60 font-sans text-xs">{ex.explanation}</span>
                </div>
              ))}
            </div>

            {/* Hint */}
            <div>
              <button
                onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-amber-400 text-sm hover:text-amber-300 transition-colors"
              >
                <Lightbulb className="w-4 h-4" />
                {showHint ? "Ocultar pista" : "Ver pista"}
                {showHint ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
              {showHint && (
                <div className="mt-2 rounded-xl bg-amber-400/5 border border-amber-400/15 p-3 text-sm text-amber-200/80">
                  ¿Qué estructura de datos te permite buscar un complemento en O(1)?
                </div>
              )}
            </div>
          </div>

          {/* Feedback de IA (aparece después de enviar) */}
          {submitted && feedback && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 p-6 flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <p className="text-white font-semibold text-sm">Retroalimentación de la IA</p>
              </div>

              {/* Score */}
              <div className="flex items-center gap-4">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                    <circle
                      cx="32" cy="32" r="26" fill="none"
                      stroke={feedback.score >= 80 ? "#34d399" : feedback.score >= 60 ? "#fbbf24" : "#f87171"}
                      strokeWidth="6"
                      strokeDasharray={`${(feedback.score / 100) * 163} 163`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-white font-bold text-sm">{feedback.score}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-white/50 text-xs">Complejidad detectada</p>
                  <p className="text-cyan-300 text-sm font-mono">{feedback.efficiency}</p>
                </div>
              </div>

              <p className="text-white/70 text-sm leading-relaxed">{feedback.feedback}</p>

              <div className="rounded-xl bg-violet-500/5 border border-violet-400/15 p-3 text-sm text-violet-200/80">
                <span className="font-semibold text-violet-300">Consejo del entrevistador: </span>
                {feedback.tip}
              </div>

              {/* Solución óptima */}
              <div>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors"
                >
                  {showSolution ? "Ocultar solución óptima" : "Ver solución óptima"}
                  {showSolution ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
                {showSolution && (
                  <pre className="mt-2 rounded-xl bg-white/[0.03] border border-white/5 p-4 text-sm text-emerald-300 font-mono overflow-x-auto">
                    {SAMPLE_PROBLEM.optimalSolution}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Columna derecha: editor + resultados ── */}
        <div className="flex flex-col gap-4">
          {/* Editor header */}
          <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/70" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <span className="w-3 h-3 rounded-full bg-green-500/70" />
                <span className="text-white/30 text-xs ml-2 font-mono">solution.js</span>
              </div>
              <div className="flex items-center gap-2">
                {timerStarted && timeLeft !== null && (
                  <span
                    className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border ${
                      timeLeft < 120
                        ? "text-red-400 border-red-400/20 bg-red-400/5"
                        : "text-white/40 border-white/10"
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {formatTime(timeLeft)}
                  </span>
                )}
                <button
                  onClick={handleReset}
                  className="text-white/30 hover:text-white/60 transition-colors p-1 rounded"
                  title="Reiniciar"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Textarea como editor simple */}
            <textarea
              id="code-editor"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full bg-transparent text-emerald-200 font-mono text-sm p-5 resize-none outline-none min-h-[320px] leading-relaxed"
              spellCheck={false}
              placeholder="Escribe tu solución aquí..."
            />

            {/* Botones */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-white/10">
              <button
                id="run-code-btn"
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5" />
                Ejecutar
              </button>
              <button
                id="submit-code-btn"
                onClick={handleSubmit}
                disabled={isRunning || submitted}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/30 transition-all text-sm font-semibold disabled:opacity-40"
              >
                <Zap className="w-3.5 h-3.5" />
                {submitted ? "Enviado" : "Enviar solución"}
              </button>
            </div>
          </div>

          {/* Resultados de los test cases */}
          {output && (
            <div className="rounded-2xl bg-gradient-to-b from-[#1A1C20] to-[#08090D] border border-white/10 p-5 flex flex-col gap-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">
                  Casos de prueba
                </p>
                <span
                  className={`text-sm font-semibold ${
                    output.passed === output.total ? "text-emerald-400" : "text-amber-400"
                  }`}
                >
                  {output.passed}/{output.total} pasados
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {output.results.map((r, i) => (
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
                      <span className="text-white/60 text-xs">{r.input}</span>
                    </div>
                    {!r.ok && (
                      <div className="pl-6 flex flex-col gap-0.5">
                        <span className="text-white/40 text-xs">
                          Esperado: <span className="text-emerald-300">{r.expected}</span>
                        </span>
                        <span className="text-white/40 text-xs">
                          Obtenido: <span className="text-red-300">{r.got}</span>
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
