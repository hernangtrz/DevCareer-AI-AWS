"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Briefcase, 
  Cpu, 
  Code2, 
  UserCheck, 
  Sparkles, 
  GraduationCap, 
  Layers, 
  Hammer,
  HelpCircle,
  Loader2
} from "lucide-react";

interface InterviewFormData {
  role: string;
  techstack: string;
  level: "junior" | "Semi-Senior" | "Senior";
  type: "tecnica" | "conductual" | "combinada";
  amount: number;
}

interface InterviewFormProps {
  userId: string;
}

const LEVELS = [
  { value: "junior", label: "Junior", desc: "0-2 años" },
  { value: "Semi-Senior", label: "Mid-Level", desc: "2-5 años" },
  { value: "Senior", label: "Senior", desc: "5+ años" }
] as const;

const AMOUNTS = [2, 5, 8, 10, 15];

const InterviewForm = ({ userId }: InterviewFormProps) => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState<InterviewFormData>({
    role: "",
    techstack: "",
    level: "junior",
    type: "tecnica",
    amount: 5,
  });

  const localizedTypes = [
    { 
      value: "tecnica", 
      label: t("form_type_tech"), 
      desc: language === "es" ? "Algoritmos y código" : "Algorithms & code", 
      icon: <Code2 className="h-5 w-5" /> 
    },
    { 
      value: "conductual", 
      label: t("form_type_beh"), 
      desc: language === "es" ? "Habilidades blandas" : "Soft skills & behavior", 
      icon: <UserCheck className="h-5 w-5" /> 
    },
    { 
      value: "combinada", 
      label: t("form_type_comb"), 
      desc: language === "es" ? "Técnica y blanda" : "Best of both worlds", 
      icon: <Sparkles className="h-5 w-5" /> 
    },
  ] as const;

  const handleSubmit = async () => {
    if (!form.role.trim() || !form.techstack.trim()) {
      setError(t("form_error_required"));
      return;
    }
    setError("");
    setLoading(true);

    try {
      const apiUrl = typeof window !== "undefined"
        ? "/api/proxy"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/livekit/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userid: userId }),
      });

      if (!res.ok) throw new Error("Error al generar la entrevista.");
      router.push("/dashboard");
    } catch (e) {
      setError(t("form_error_generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
      <div className="relative w-full overflow-hidden bg-gradient-to-b from-[#181635]/30 to-[#090A0E] border border-zinc-800/80 rounded-3xl p-8 shadow-2xl">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e810a_1px,transparent_1px),linear-gradient(to_bottom,#312e810a_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

        <div className="relative flex flex-col gap-8 z-10">
          {/* Header */}
          <div className="flex flex-col gap-1.5 text-left border-b border-zinc-800/60 pb-6">
            <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">{t("form_title")}</h3>
            <p className="text-sm text-zinc-400 font-light">
              {t("form_subtitle")}
            </p>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-2.5 text-left">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider flex items-center gap-1.5 uppercase">
              <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
              {t("form_role_label")}
            </label>
            <div className="relative">
              <input
                className="w-full bg-zinc-950/60 rounded-xl min-h-12 pl-12 pr-5 text-white placeholder:text-zinc-600 border border-zinc-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm font-light"
                placeholder={t("form_role_placeholder")}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Briefcase className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Techstack */}
          <div className="flex flex-col gap-2.5 text-left">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider flex items-center gap-1.5 uppercase">
              <Cpu className="h-3.5 w-3.5 text-indigo-400" />
              {t("form_tech_label")}
            </label>
            <div className="relative">
              <input
                className="w-full bg-zinc-950/60 rounded-xl min-h-12 pl-12 pr-5 text-white placeholder:text-zinc-600 border border-zinc-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm font-light"
                placeholder={t("form_tech_placeholder")}
                value={form.techstack}
                onChange={(e) => setForm({ ...form, techstack: e.target.value })}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">
                <Cpu className="h-4 w-4" />
              </div>
            </div>
          </div>

          {/* Level */}
          <div className="flex flex-col gap-2.5 text-left">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider flex items-center gap-1.5 uppercase">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
              {t("form_level_label")}
            </label>
            <div className="grid grid-cols-3 gap-3">
              {LEVELS.map(({ value, label, desc }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, level: value })}
                  className={`flex flex-col gap-1 p-4 rounded-xl text-left border transition-all cursor-pointer select-none ${
                    form.level === value
                      ? "bg-indigo-500/10 text-white border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "bg-zinc-950/40 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <span className="text-sm font-bold">{label}</span>
                  <span className="text-[10px] text-zinc-500">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-2.5 text-left">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider flex items-center gap-1.5 uppercase">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              {t("form_type_label")}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {localizedTypes.map(({ value, label, desc, icon }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, type: value })}
                  className={`flex items-center gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer select-none ${
                    form.type === value
                      ? "bg-indigo-500/10 text-white border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "bg-zinc-950/40 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-zinc-900 ${form.type === value ? "text-indigo-400" : "text-zinc-500"}`}>
                    {icon}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">{label}</span>
                    <span className="text-[10px] text-zinc-500">{desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div className="flex flex-col gap-2.5 text-left border-t border-zinc-800/60 pt-6">
            <label className="text-xs font-semibold text-zinc-300 tracking-wider flex items-center gap-1.5 uppercase">
              <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
              {t("form_questions_label")}
            </label>
            <div className="flex gap-3 flex-wrap items-center">
              {AMOUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setCustomAmount("");
                    setForm({ ...form, amount: n });
                  }}
                  className={`w-11 h-11 rounded-xl text-sm font-bold border transition-all cursor-pointer select-none ${
                    form.amount === n && customAmount === ""
                      ? "bg-indigo-500 text-white border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                      : "bg-zinc-950/40 text-zinc-400 border-zinc-800/80 hover:border-zinc-700 hover:text-zinc-200"
                  }`}
                >
                  {n}
                </button>
              ))}
              <div className="flex flex-col gap-1">
                <input
                  type="number"
                  min={1}
                  max={30}
                  placeholder={t("form_questions_placeholder")}
                  value={customAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomAmount(val);
                    const num = parseInt(val, 10);
                    if (!isNaN(num) && num >= 1 && num <= 30) {
                      setForm({ ...form, amount: num });
                    }
                  }}
                  className="w-20 h-11 rounded-xl text-sm font-bold border border-zinc-800 bg-zinc-950/40 text-white text-center placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">{t("form_questions_desc")}</p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center font-medium animate-fadeIn">{error}</p>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl min-h-12 flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("form_btn_generating")}
              </>
            ) : (
              t("form_btn_generate")
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InterviewForm;

