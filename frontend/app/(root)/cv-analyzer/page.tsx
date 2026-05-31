import React from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import CvAnalyzerUpload from "@/components/CvAnalyzerUpload";

export const metadata = {
  title: "Análisis de CV con IA — DevCareer AI",
  description: "Compara tu currículum contra una oferta de empleo específica para obtener un score ATS detallado, palabras clave faltantes y recomendaciones.",
};

const Page = () => {
  return (
    <div className="flex flex-col gap-6">
      {/* ─── Header Navigation ─── */}
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors w-fit text-sm font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Volver al panel
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
                <Search className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Análisis de CV con IA</h1>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
              Compara tu currículum en formato PDF o Word contra los requerimientos específicos de una vacante. Identifica vacíos de contenido y optimiza tu score ATS.
            </p>
          </div>
          <span className="self-start md:self-center px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 text-xs font-semibold">
            Módulo 3
          </span>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* ─── Interactive Upload & Analyzer ─── */}
      <CvAnalyzerUpload />
    </div>
  );
};

export default Page;
