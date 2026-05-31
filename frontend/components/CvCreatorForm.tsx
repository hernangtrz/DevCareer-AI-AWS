"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Palette,
  Check,
} from "lucide-react";
import CvTemplateCard from "@/components/CvTemplateCard";
import CvPreview from "@/components/CvPreview";

// ─── Types ──────────────────────────────────────────────────────────────────
interface WorkExperience {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

interface Education {
  institution: string;
  degree: string;
  year: string;
}

interface PersonalInfo {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

// ─── Templates ───────────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "profesional",
    name: "Profesional Clásico",
    description: "Diseño limpio, ideal para corporaciones",
    accentColor: "#1e40af",
  },
  {
    id: "moderno",
    name: "Moderno Minimalista",
    description: "Sidebar lateral elegante y moderno",
    accentColor: "#6366f1",
  },
  {
    id: "creativo",
    name: "Creativo",
    description: "Destaca con un diseño dinámico",
    accentColor: "#8b5cf6",
  },
  {
    id: "ats",
    name: "ATS-Optimizado",
    description: "Máxima compatibilidad con filtros ATS",
    accentColor: "#0f766e",
  },
];

const STEPS = [
  { id: 0, label: "Información Personal", icon: <User className="h-4 w-4" /> },
  { id: 1, label: "Experiencia Laboral", icon: <Briefcase className="h-4 w-4" /> },
  { id: 2, label: "Habilidades y Educación", icon: <GraduationCap className="h-4 w-4" /> },
  { id: 3, label: "Personalización", icon: <Palette className="h-4 w-4" /> },
];

// ─── Reusable input component ────────────────────────────────────────────────
const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-light-100">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-dark-200 rounded-xl min-h-11 px-4 text-white text-sm placeholder:text-light-600 border border-input focus:outline-none focus:border-indigo-400 transition-colors"
    />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const CvCreatorForm = () => {
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState("profesional");
  const [showPreview, setShowPreview] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
  });

  const [experiences, setExperiences] = useState<WorkExperience[]>([
    { company: "", role: "", startDate: "", endDate: "", bullets: [""] },
  ]);

  const [skills, setSkills] = useState<string[]>([]);
  const [education, setEducation] = useState<Education[]>([
    { institution: "", degree: "", year: "" },
  ]);

  const [accentColor, setAccentColor] = useState("#6366f1");
  const [targetRole, setTargetRole] = useState("");
  const [language, setLanguage] = useState<"es" | "en">("es");

  const currentTemplate = TEMPLATES.find((t) => t.id === selectedTemplate)!;
  const activeAccent = step === 3 ? accentColor : currentTemplate.accentColor;

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills((prev) => [...prev, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) =>
    setSkills((prev) => prev.filter((x) => x !== s));

  const addExperience = () =>
    setExperiences((prev) => [
      ...prev,
      { company: "", role: "", startDate: "", endDate: "", bullets: [""] },
    ]);

  const removeExperience = (i: number) =>
    setExperiences((prev) => prev.filter((_, idx) => idx !== i));

  const updateExperience = (
    i: number,
    key: keyof WorkExperience,
    value: string | string[]
  ) =>
    setExperiences((prev) =>
      prev.map((exp, idx) => (idx === i ? { ...exp, [key]: value } : exp))
    );

  const addBullet = (i: number) =>
    updateExperience(i, "bullets", [...experiences[i].bullets, ""]);

  const updateBullet = (expIdx: number, bIdx: number, val: string) => {
    const newBullets = [...experiences[expIdx].bullets];
    newBullets[bIdx] = val;
    updateExperience(expIdx, "bullets", newBullets);
  };

  const removeBullet = (expIdx: number, bIdx: number) =>
    updateExperience(
      expIdx,
      "bullets",
      experiences[expIdx].bullets.filter((_, i) => i !== bIdx)
    );

  const addEducation = () =>
    setEducation((prev) => [...prev, { institution: "", degree: "", year: "" }]);

  const updateEducation = (i: number, key: keyof Education, value: string) =>
    setEducation((prev) =>
      prev.map((edu, idx) => (idx === i ? { ...edu, [key]: value } : edu))
    );

  // ─── Render Steps ───────────────────────────────────────────────────────────
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Nombre completo *"
              value={personalInfo.name}
              onChange={(v) => setPersonalInfo({ ...personalInfo, name: v })}
              placeholder="Ej: Juan García"
            />
            <Field
              label="Título profesional"
              value={personalInfo.headline}
              onChange={(v) => setPersonalInfo({ ...personalInfo, headline: v })}
              placeholder="Ej: Frontend Developer"
            />
            <Field
              label="Correo electrónico"
              value={personalInfo.email}
              onChange={(v) => setPersonalInfo({ ...personalInfo, email: v })}
              placeholder="tu@email.com"
              type="email"
            />
            <Field
              label="Teléfono"
              value={personalInfo.phone}
              onChange={(v) => setPersonalInfo({ ...personalInfo, phone: v })}
              placeholder="+57 300 000 0000"
            />
            <Field
              label="Ubicación"
              value={personalInfo.location}
              onChange={(v) =>
                setPersonalInfo({ ...personalInfo, location: v })
              }
              placeholder="Bogotá, Colombia"
            />
            <Field
              label="LinkedIn"
              value={personalInfo.linkedin}
              onChange={(v) =>
                setPersonalInfo({ ...personalInfo, linkedin: v })
              }
              placeholder="linkedin.com/in/tu-perfil"
            />
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col gap-4">
            {experiences.map((exp, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 p-4 rounded-2xl bg-dark-200 border border-white/10"
              >
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs font-semibold uppercase tracking-wide">
                    Experiencia {i + 1}
                  </span>
                  {i > 0 && (
                    <button
                      onClick={() => removeExperience(i)}
                      className="text-destructive-100 hover:text-destructive-200 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field
                    label="Empresa"
                    value={exp.company}
                    onChange={(v) => updateExperience(i, "company", v)}
                    placeholder="Nombre de la empresa"
                  />
                  <Field
                    label="Cargo"
                    value={exp.role}
                    onChange={(v) => updateExperience(i, "role", v)}
                    placeholder="Ej: Frontend Developer"
                  />
                  <Field
                    label="Fecha inicio"
                    value={exp.startDate}
                    onChange={(v) => updateExperience(i, "startDate", v)}
                    placeholder="Ene 2022"
                  />
                  <Field
                    label="Fecha fin"
                    value={exp.endDate}
                    onChange={(v) => updateExperience(i, "endDate", v)}
                    placeholder="Presente"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-light-100">
                    Responsabilidades
                  </label>
                  {exp.bullets.map((b, bi) => (
                    <div key={bi} className="flex gap-2 items-center">
                      <input
                        value={b}
                        onChange={(e) => updateBullet(i, bi, e.target.value)}
                        placeholder={`Logro o responsabilidad ${bi + 1}`}
                        className="flex-1 bg-dark-300 rounded-xl min-h-10 px-4 text-white text-sm placeholder:text-light-600 border border-input focus:outline-none focus:border-indigo-400 transition-colors"
                      />
                      {bi > 0 && (
                        <button
                          onClick={() => removeBullet(i, bi)}
                          className="text-white/30 hover:text-destructive-100 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addBullet(i)}
                    className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-1 w-fit"
                  >
                    <Plus className="h-3.5 w-3.5" /> Agregar punto
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={addExperience}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-indigo-500/40 hover:text-indigo-400 transition-all text-sm font-medium"
            >
              <Plus className="h-4 w-4" /> Agregar otra experiencia
            </button>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-6">
            {/* Skills */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-white">
                Habilidades técnicas
              </label>
              <div className="flex gap-2">
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  placeholder="Ej: React, Python, Docker..."
                  className="flex-1 bg-dark-200 rounded-xl min-h-11 px-4 text-white text-sm placeholder:text-light-600 border border-input focus:outline-none focus:border-indigo-400 transition-colors"
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <span
                      key={s}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-medium"
                    >
                      {s}
                      <button
                        onClick={() => removeSkill(s)}
                        className="text-indigo-400 hover:text-white transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold text-white">
                Educación
              </label>
              {education.map((edu, i) => (
                <div
                  key={i}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-dark-200 border border-white/10"
                >
                  <Field
                    label="Institución"
                    value={edu.institution}
                    onChange={(v) => updateEducation(i, "institution", v)}
                    placeholder="Universidad / Bootcamp"
                  />
                  <Field
                    label="Título / Carrera"
                    value={edu.degree}
                    onChange={(v) => updateEducation(i, "degree", v)}
                    placeholder="Ingeniería de Sistemas"
                  />
                  <Field
                    label="Año de graduación"
                    value={edu.year}
                    onChange={(v) => updateEducation(i, "year", v)}
                    placeholder="2023"
                  />
                </div>
              ))}
              <button
                onClick={addEducation}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-white/10 text-white/40 hover:border-indigo-500/40 hover:text-indigo-400 transition-all text-sm font-medium"
              >
                <Plus className="h-4 w-4" /> Agregar otra educación
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-6">
            <Field
              label="Rol objetivo"
              value={targetRole}
              onChange={setTargetRole}
              placeholder="Ej: Senior React Developer en startup fintech"
            />

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-light-100">
                Idioma del CV
              </label>
              <div className="flex gap-3">
                {(["es", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      "px-5 py-2 rounded-full text-sm font-semibold border transition-all cursor-pointer",
                      language === lang
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-dark-200 text-light-100 border-input hover:border-indigo-400"
                    )}
                  >
                    {lang === "es" ? "🇪🇸 Español" : "🇺🇸 English"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-light-100">
                Color de acento
              </label>
              <div className="flex items-center gap-3">
                {[
                  "#6366f1",
                  "#8b5cf6",
                  "#0f766e",
                  "#1e40af",
                  "#b91c1c",
                  "#c2410c",
                  "#000000",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAccentColor(color)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      accentColor === color
                        ? "border-white scale-110"
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                    style={{ background: color }}
                  >
                    {accentColor === color && (
                      <Check className="h-3 w-3 text-white mx-auto" />
                    )}
                  </button>
                ))}
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border-2 border-white/20"
                  title="Color personalizado"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* ─── Template selector ─── */}
      <div className="flex flex-col gap-4">
        <h3 className="text-primary-100">Elige tu plantilla</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TEMPLATES.map((t) => (
            <CvTemplateCard
              key={t.id}
              id={t.id}
              name={t.name}
              description={t.description}
              accentColor={t.accentColor}
              isSelected={selectedTemplate === t.id}
              onSelect={(id) => {
                setSelectedTemplate(id);
                setAccentColor(TEMPLATES.find((x) => x.id === id)!.accentColor);
              }}
              preview={
                <CvPreview
                  templateId={t.id}
                  accentColor={t.accentColor}
                  personalInfo={personalInfo}
                  experiences={experiences}
                  skills={skills}
                  education={education}
                />
              }
            />
          ))}
        </div>
      </div>

      {/* ─── Split layout: Form + Preview ─── */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Form panel */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Stepper */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setStep(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap",
                    step === s.id
                      ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                      : step > s.id
                      ? "text-indigo-300 hover:text-indigo-200"
                      : "text-white/30 cursor-not-allowed"
                  )}
                  disabled={step < s.id}
                >
                  {step > s.id ? (
                    <Check className="h-3.5 w-3.5 text-indigo-400" />
                  ) : (
                    s.icon
                  )}
                  <span className="max-md:hidden">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-px mx-1 transition-colors",
                      step > i ? "bg-indigo-500/60" : "bg-white/10"
                    )}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step content */}
          <div className="card-border">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400">
                  {STEPS[step].icon}
                </span>
                <h3 className="text-primary-100 text-lg">{STEPS[step].label}</h3>
              </div>
              {renderStep()}
            </div>
          </div>

          {/* Step navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-200 text-white/60 hover:text-white border border-input disabled:opacity-30 disabled:cursor-not-allowed transition-all text-sm font-medium"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </button>

            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all"
              >
                Siguiente <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex gap-3">
                <div className="relative group">
                  <button
                    disabled
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-200 border border-input text-white/40 cursor-not-allowed text-sm font-semibold"
                  >
                    Descargar PDF
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[9px] font-bold">
                      Pronto
                    </span>
                  </button>
                </div>
                <div className="relative group">
                  <button
                    disabled
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-indigo-600/40 border border-indigo-500/30 text-indigo-300/60 cursor-not-allowed text-sm font-semibold"
                  >
                    ✨ Generar con IA
                    <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[9px] font-bold">
                      Pronto
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview panel */}
        <div className="lg:w-[340px] xl:w-[380px] flex-shrink-0">
          <div className="sticky top-24 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white/60">
                Vista previa en vivo
              </span>
              <button
                onClick={() => setShowPreview((v) => !v)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors lg:hidden"
              >
                {showPreview ? "Ocultar" : "Mostrar"}
              </button>
            </div>
            <div
              className={cn(
                "card-border rounded-2xl overflow-hidden",
                !showPreview && "hidden lg:block"
              )}
              style={{ aspectRatio: "3/4" }}
            >
              <CvPreview
                templateId={selectedTemplate}
                accentColor={activeAccent}
                personalInfo={personalInfo}
                experiences={experiences}
                skills={skills}
                education={education}
              />
            </div>
            <p className="text-white/20 text-[11px] text-center">
              El diseño final puede variar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CvCreatorForm;
