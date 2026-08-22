"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, FileText, Search, ShieldCheck } from "lucide-react";
import CvCreatorForm from "@/components/CvCreatorForm";
import CvAnalyzerUpload from "@/components/CvAnalyzerUpload";

function CvHubContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "analyzer" ? "analyzer" : "creator";
  const [activeTab, setActiveTab] = useState<"creator" | "analyzer">(initialTab);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "analyzer" || tabParam === "creator") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col gap-6 min-h-screen pb-16">
      {/* ─── Header Navigation ─── */}
      <div className="flex flex-col gap-3 no-print">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                CV & ATS Intelligence Hub
              </h1>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
              Crea tu perfil profesional optimizado con IA y diagnostica la compatibilidad de tu currículum contra cualquier oferta de empleo.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> ATS Ready
            </span>
          </div>
        </div>

        {/* ─── Tab Switcher ─── */}
        <div className="flex bg-zinc-900/60 p-1.5 rounded-2xl border border-zinc-800/80 w-full sm:w-fit mt-2 gap-1 backdrop-blur-md">
          <button
            onClick={() => setActiveTab("creator")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial ${
              activeTab === "creator"
                ? "bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Constructor & Perfil</span>
          </button>
          <button
            onClick={() => setActiveTab("analyzer")}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-1 sm:flex-initial ${
              activeTab === "analyzer"
                ? "bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Diagnóstico & Escáner ATS</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-zinc-800/80 w-full no-print" />

      {/* ─── Tab Content ─── */}
      <div className="w-full">
        {activeTab === "creator" ? (
          <div className="animate-in fade-in duration-300">
            <CvCreatorForm />
          </div>
        ) : (
          <div className="animate-in fade-in duration-300">
            <CvAnalyzerUpload />
          </div>
        )}
      </div>
    </div>
  );
}

export default function CvHubPage() {
  return (
    <Suspense fallback={<div className="text-zinc-400 text-sm py-12 text-center">Cargando CV Hub...</div>}>
      <CvHubContent />
    </Suspense>
  );
}
