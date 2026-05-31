import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import CvCreatorForm from "@/components/CvCreatorForm";

export const metadata = {
  title: "Creación de CV con IA — DevCareer AI",
  description: "Crea tu hoja de vida profesional adaptada al rol que buscas con nuestra plantilla interactiva.",
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
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400">
                <FileText className="h-4 w-4" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Creación de CV con IA</h1>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-2xl">
              Completa los pasos para generar una hoja de vida profesional con los formatos más solicitados por las empresas, completamente optimizada y adaptada a tu rol objetivo.
            </p>
          </div>
          <span className="self-start md:self-center px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-300 text-xs font-semibold">
            Módulo 2
          </span>
        </div>
      </div>

      <div className="h-px bg-white/10 w-full" />

      {/* ─── Interactive CV Creator Form ─── */}
      <CvCreatorForm />
    </div>
  );
};

export default Page;
