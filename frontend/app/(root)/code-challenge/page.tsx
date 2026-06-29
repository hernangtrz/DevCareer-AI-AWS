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
          className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-sm transition-colors w-fit"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver al panel
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Code2 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white text-xl font-bold">Prueba técnica de código</h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-xs font-semibold">
                  Beta
                </span>
              </div>
              <p className="text-white/40 text-sm mt-0.5">
                Elige un problema y simula una entrevista técnica real
              </p>
            </div>
          </div>

          <button
            onClick={handleRandom}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 hover:bg-cyan-500/20 transition-all text-sm font-semibold"
          >
            <Shuffle className="w-4 h-4" />
            Problema aleatorio
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-white/40">
          <Filter className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Filtros</span>
        </div>

        {/* Dificultad */}
        <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/10 rounded-xl p-1">
          {(["all", "easy", "medium", "hard"] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                difficultyFilter === d
                  ? "bg-white/10 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {d === "all" ? "Todas" : DIFFICULTY_LABELS[d]}
            </button>
          ))}
        </div>

        {/* Categoría */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-xl px-3 py-2 text-xs text-white/60 outline-none focus:border-white/20 transition-colors"
        >
          <option value="all">Todas las categorías</option>
          {ALL_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <span className="text-white/30 text-xs ml-1">
          {filtered.length} problema{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid de problemas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((problem) => (
          <Link
            key={problem.id}
            href={`/code-challenge/${problem.id}`}
            className="group flex flex-col gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.07] hover:border-white/15 hover:bg-white/[0.04] transition-all"
          >
            {/* Top row */}
            <div className="flex items-start justify-between gap-2">
              <span className="text-white font-semibold text-sm leading-snug group-hover:text-cyan-200 transition-colors">
                {problem.title}
              </span>
              <span
                className={`flex-shrink-0 text-xs font-semibold border px-2 py-0.5 rounded-full ${
                  DIFFICULTY_COLORS[problem.difficulty]
                }`}
              >
                {DIFFICULTY_LABELS[problem.difficulty]}
              </span>
            </div>

            {/* Description preview */}
            <p className="text-white/40 text-xs leading-relaxed line-clamp-2">
              {problem.description.replace(/`/g, "").split("\n")[0]}
            </p>

            {/* Tags + time */}
            <div className="flex items-center gap-2 flex-wrap mt-auto">
              {problem.category.map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px]"
                >
                  {cat}
                </span>
              ))}
              <span className="flex items-center gap-1 ml-auto text-white/30 text-[10px]">
                <Clock className="w-3 h-3" />
                {problem.timeLimit} min
              </span>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-end">
              <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Code2 className="w-10 h-10 text-white/20" />
          <p className="text-white/40 text-sm">
            No hay problemas con los filtros seleccionados.
          </p>
          <button
            onClick={() => {
              setDifficultyFilter("all");
              setCategoryFilter("all");
            }}
            className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );
}
