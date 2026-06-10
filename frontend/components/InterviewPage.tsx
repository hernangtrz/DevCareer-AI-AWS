"use client";

import { useState } from "react";
import Agent from "@/components/Agent";
import InterviewForm from "@/components/InterviewForm";
import { useLanguage } from "@/contexts/LanguageContext";

interface InterviewPageProps {
  userName: string;
  userId: string;
}

const InterviewPage = ({ userName, userId }: InterviewPageProps) => {
  const [mode, setMode] = useState<"form" | "agent">("form");
  const { t } = useLanguage();

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3>{t("int_title")}</h3>
        <p className="text-light-400 text-sm">
          {mode === "form"
            ? t("int_form_mode_desc")
            : t("int_agent_mode_desc")}
        </p>
      </div>

      {/* Toggle */}
      <div className="flex bg-dark-200 rounded-full p-1 border border-input">
        <button
          onClick={() => setMode("form")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            mode === "form"
              ? "bg-primary-200 text-dark-100"
              : "text-light-400 hover:text-light-100"
          }`}
        >
          {t("int_mode_form")}
        </button>
        <button
          onClick={() => setMode("agent")}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
            mode === "agent"
              ? "bg-primary-200 text-dark-100"
              : "text-light-400 hover:text-light-100"
          }`}
        >
          {t("int_mode_agent")}
        </button>
      </div>

      {/* Content */}
      <div className="w-full">
        {mode === "form" ? (
          <InterviewForm userId={userId} />
        ) : (
          <Agent userName={userName} userId={userId} type="generate" />
        )}
      </div>
    </div>
  );
};

export default InterviewPage;
