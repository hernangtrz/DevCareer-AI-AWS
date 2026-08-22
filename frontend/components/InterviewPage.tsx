"use client";

import InterviewForm from "@/components/InterviewForm";
import { useLanguage } from "@/contexts/LanguageContext";
import { Sparkles, Mic } from "lucide-react";

interface InterviewPageProps {
  userName: string;
  userId: string;
}

const InterviewPage = ({ userName, userId }: InterviewPageProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto pb-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t("int_title") || "Simulador de Entrevista de Voz"}</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          {t("int_form_mode_desc") || "Configura tu entrevista personalizada"}
        </h1>
        <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
          Selecciona tu rol objetivo, tecnologías y nivel de experiencia. Nuestro agente de voz de IA te entrevistará en tiempo real.
        </p>
      </div>

      {/* Form Content */}
      <div className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 md:p-8 shadow-2xl backdrop-blur-sm">
        <InterviewForm userId={userId} />
      </div>
    </div>
  );
};

export default InterviewPage;
