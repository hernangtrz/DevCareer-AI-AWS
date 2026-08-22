"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Code2,
  Filter,
  Shuffle,
  ArrowRight,
  Clock,
  ChevronLeft,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  PROBLEMS,
  DIFFICULTY_LABELS,
  DIFFICULTY_COLORS,
  type Difficulty,
} from "@/lib/problems";
import { useRouter } from "next/navigation";

const ALL_CATEGORIES = Array.from(
  new Set(PROBLEMS.flatMap((p) => p.category))
).sort();

export default function CodeChallengePage() {
  const router = useRouter();
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    return PROBLEMS.filter((p) => {
      const matchDiff = difficultyFilter === "all" || p.difficulty === difficultyFilter;
      const matchCat = categoryFilter === "all" || p.category.includes(categoryFilter);
      return matchDiff && matchCat;
    });
  }, [difficultyFilter, categoryFilter]);

  const handleRandom = () => {
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    if (random) router.push(`/code-challenge/${random.id}`);
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white text-sm transition-colors w-fit font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al panel
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Code2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-white text-2xl font-bold tracking-tight">
                  Retos de Código y Patrones de Diseño
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
                  Arena & SOLID
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-1">
                Practica algoritmos de entrevista y refactoriza código aplicando patrones GoF evaluados por IA.
              </p>
            </div>
          </div>

          <button
            onClick={handleRandom}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all text-sm font-semibold cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            Problema aleatorio
          </button>
        </div>
      </div>

      {/* Quick Filter Tabs: All vs Design Patterns */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => {
            setCategoryFilter("all");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            categoryFilter === "all"
              ? "bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          <Code2 className="w-4 h-4" />
          <span>Todos los Retos ({PROBLEMS.length})</span>
        </button>

        <button
          onClick={() => {
            setCategoryFilter("Patrones de Diseño");
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            categoryFilter === "Patrones de Diseño"
              ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
              : "bg-zinc-900/60 border border-zinc-800 text-indigo-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>✨ Patrones de Diseño & Refactoring</span>
        </button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-zinc-400">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Dificultad:</span>
        </div>

        {/* Dificultad */}
        <div className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 rounded-xl p-1">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                difficultyFilter === d
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {d === "all" ? "Todas" : DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Categoría dropdown */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 outline-none focus:border-zinc-700 transition-colors cursor-pointer"
        >
          <option value="all">Todas las categorías</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <span className="text-zinc-500 text-xs ml-auto">
          Mostrando {filtered.length} reto{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid de problemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((problem) => {
          const isPattern = problem.category.includes("Patrones de Diseño");

          return (
            <Link
              key={problem.id}
              href={`/code-challenge/${problem.id}`}
              className={`group flex flex-col gap-4 p-5 rounded-2xl border transition-all hover:scale-[1.01] ${
                isPattern
                  ? "bg-indigo-950/20 border-indigo-500/20 hover:border-indigo-500/40 hover:bg-indigo-950/30"
                  : "bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/80"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-2">
                <span className="text-white font-semibold text-sm leading-snug group-hover:text-cyan-200 transition-colors">
                  {problem.title}
                </span>
                <span
                  className={`flex-shrink-0 text-xs font-semibold border px-2.5 py-0.5 rounded-full ${
                    DIFFICULTY_COLORS[problem.difficulty]
                  }`}
                >
                  {DIFFICULTY_LABELS[problem.difficulty]}
                </span>
              </div>

              {/* Description preview */}
              <p className="text-zinc-400 text-xs leading-relaxed line-clamp-2">
                {problem.description.replace(/`/g, "").split("\n")[0]}
              </p>

              {/* Tags + time */}
              <div className="flex items-center gap-2 flex-wrap mt-auto pt-2">
                {problem.category.map((cat) => (
                  <span
                    key={cat}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      cat === "Patrones de Diseño"
                        ? "bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-semibold"
                        : "bg-zinc-800/60 border border-zinc-700/50 text-zinc-400"
                    }`}
                  >
                    {cat}
                  </span>
                ))}
                <span className="flex items-center gap-1 ml-auto text-zinc-500 text-[10px] font-mono">
                  <Clock className="w-3 h-3" />
                  {problem.timeLimit}m
                </span>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-end border-t border-zinc-800/50 pt-3 mt-1">
                <span className="text-xs text-zinc-400 group-hover:text-cyan-300 transition-colors mr-2">
                  Resolver reto
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Code2 className="w-10 h-10 text-zinc-600" />
          <p className="text-zinc-400 text-sm">
            No hay problemas con los filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setDifficultyFilter("all");
              setCategoryFilter("all");
            }}
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
