"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  DollarSign,
  FileText,
  Code2,
  Building2,
  GraduationCap,
  Sparkles,
  UploadCloud,
  CheckCircle2,
  Save,
  Plus,
  X,
  ArrowRight,
  ExternalLink,
  Check,
  Briefcase,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"personal" | "summary" | "skills" | "experience" | "education" | "resume">("personal");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeParsed, setResumeParsed] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    fullName: "Hernán Gutiérrez",
    email: "hernan@devcareer.ai",
    phone: "+57 (300) 123-4567",
    location: "Barranquilla, Colombia (Disponible Remoto Global)",
    headline: "Senior Full Stack Engineer · AI Developer · 3+ Años de Experiencia",
    linkedinUrl: "https://linkedin.com/in/hernangtrz",
    githubUrl: "https://github.com/hernangtrz",
    portfolioUrl: "https://hernangtrz.dev",
    desiredSalaryUSD: "$5,500 USD / mes",
    englishLevel: "B2 - Profesional Fluido",
    summary:
      "Ingeniero de Software Full Stack especializado en React, Next.js, Node.js y arquitecturas cloud con AWS. Experiencia liderando proyectos de alta concurrencia, integración de modelos de IA y código limpio con principios SOLID y patrones de diseño.",
    skills: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "AWS DynamoDB", "Docker", "Tailwind CSS", "LiveKit WebRTC", "Google Gemini"],
    experience: [
      {
        id: "exp-1",
        role: "Senior Frontend Engineer",
        company: "TechCorp Global",
        location: "Remoto (EE.UU.)",
        period: "2023 - Presente",
        description: "Lideré el desarrollo de la plataforma web central con Next.js y TypeScript, mejorando los tiempos de carga en un 42% y el score SEO al 98%.",
      },
      {
        id: "exp-2",
        role: "Fullstack Developer",
        company: "Software Labs",
        location: "Barranquilla, Colombia",
        period: "2021 - 2023",
        description: "Diseño y consumo de REST APIs en Node.js/Express y gestión de bases de datos PostgreSQL con migraciones automáticas.",
      },
    ],
    education: [
      {
        id: "edu-1",
        title: "Ingeniería de Sistemas y Computación",
        institution: "Universidad del Norte",
        period: "2020 - 2025",
        description: "Énfasis en Arquitectura de Software, Cloud Computing y Patrones de Diseño.",
      },
    ],
  });

  const handleSimulateResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingResume(true);
    setTimeout(() => {
      setUploadingResume(false);
      setResumeParsed(true);
      alert(`¡Hoja de vida "${file.name}" analizada con éxito por IA! Todos los campos del perfil han sido auto-completados.`);
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-8 min-h-screen pb-16">
      {/* ── Top Header ── */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-indigo-950/40 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-indigo-500/25 shrink-0">
            {profileData.fullName[0]}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {profileData.fullName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold">
                Perfil Activo ✓
              </span>
            </div>
            <p className="text-zinc-400 text-xs md:text-sm">{profileData.headline}</p>
          </div>
        </div>

        {/* Upload Resume Button (Auto-fill profile) */}
        <div className="flex items-center gap-3">
          <label className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] cursor-pointer flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            <span>{uploadingResume ? "Analizando CV con IA..." : "Subir CV para Auto-Rellenar"}</span>
            <input type="file" accept=".pdf,.docx" onChange={handleSimulateResumeUpload} className="hidden" />
          </label>

          <Link
            href="/jobs"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            <span>Ver Ofertas de Empleo</span>
          </Link>
        </div>
      </div>

      {/* ── Main Layout: Sidebar & Form Editor ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Left Column: Profile Completeness Sidebar (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col gap-5 sticky top-6">
          <div className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Estado de tu Perfil
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                Listo para aplicar 🚀
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-950/60 border border-zinc-850">
              <div className="relative flex items-center justify-center w-16 h-16 shrink-0">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 72 72">
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    className="text-zinc-800"
                    strokeWidth="7"
                    stroke="currentColor"
                    fill="transparent"
                  />
                  <circle
                    cx="36"
                    cy="36"
                    r="30"
                    fill="transparent"
                    stroke="#10b981"
                    strokeWidth="7"
                    strokeDasharray="188"
                    strokeDashoffset="4"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-white font-black text-sm">98%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">¡Perfil 98% Completo!</span>
                <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                  Tus datos se usan automáticamente para postularte a las vacantes en 1 clic.
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-col gap-1 text-xs">
              {[
                { id: "personal", label: "Información Básica & Contacto", icon: <User className="w-4 h-4" /> },
                { id: "summary", label: "Resumen Profesional", icon: <FileText className="w-4 h-4" /> },
                { id: "skills", label: "Habilidades & Stack Tecnológico", icon: <Code2 className="w-4 h-4" /> },
                { id: "experience", label: "Experiencia Laboral", icon: <Building2 className="w-4 h-4" /> },
                { id: "education", label: "Educación & Títulos", icon: <GraduationCap className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                    activeTab === item.id
                      ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/20"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-850"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-zinc-800 flex flex-col gap-2">
              <Link
                href="/cv"
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-all text-center flex items-center justify-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Constructor & Scanner ATS (CV Hub)</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Right Column: Editable Profile Forms (8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-6 p-6 md:p-8 rounded-3xl bg-zinc-900/80 border border-zinc-800 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold text-white">Editar Información del Perfil</h2>
              <p className="text-xs text-zinc-400">
                Estos datos se sincronizan con las postulaciones de empleo y la simulación de entrevistas.
              </p>
            </div>

            <button
              onClick={() => alert("¡Perfil guardado y sincronizado con éxito!")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar Cambios</span>
            </button>
          </div>

          {/* TAB 1: Personal Info */}
          {activeTab === "personal" && (
            <div className="flex flex-col gap-5">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Datos de Contacto & Ubicación
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Nombre Completo</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Correo Electrónico</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Ubicación / Modalidad</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-zinc-400">Titular Profesional (Headline)</label>
                <input
                  type="text"
                  value={profileData.headline}
                  onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider pt-3">
                Enlaces Profesionales & Preferencias Salariales
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">URL de LinkedIn</label>
                  <input
                    type="text"
                    value={profileData.linkedinUrl}
                    onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">URL de GitHub</label>
                  <input
                    type="text"
                    value={profileData.githubUrl}
                    onChange={(e) => setProfileData({ ...profileData, githubUrl: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-zinc-400">Portafolio Web</label>
                  <input
                    type="text"
                    value={profileData.portfolioUrl}
                    onChange={(e) => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                    className="bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-emerald-400">Pretensión Salarial Objetivo (USD)</label>
                  <input
                    type="text"
                    value={profileData.desiredSalaryUSD}
                    onChange={(e) => setProfileData({ ...profileData, desiredSalaryUSD: e.target.value })}
                    className="bg-zinc-950 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400 font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Summary */}
          {activeTab === "summary" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Resumen Profesional
                </h3>
                <button
                  onClick={() => alert("¡Resumen profesional optimizado con verbos de acción por IA!")}
                  className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Optimizar con IA</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={profileData.summary}
                onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-200 leading-relaxed focus:outline-none focus:border-indigo-500 font-sans"
              />
            </div>
          )}

          {/* TAB 3: Skills */}
          {activeTab === "skills" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Habilidades & Stack Tecnológico
              </h3>

              <div className="flex items-center gap-2 flex-wrap p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
                {profileData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 text-xs font-semibold flex items-center gap-2"
                  >
                    <span>{skill}</span>
                    <button
                      onClick={() =>
                        setProfileData({
                          ...profileData,
                          skills: profileData.skills.filter((_, i) => i !== index),
                        })
                      }
                      className="text-indigo-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    const newSkill = prompt("Ingresa una nueva tecnología (ej. GraphQL, Python, AWS):");
                    if (newSkill) setProfileData({ ...profileData, skills: [...profileData.skills, newSkill] });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Skill
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Experience */}
          {activeTab === "experience" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Experiencia Laboral
                </h3>
                <button
                  onClick={() => alert("Agregar nueva empresa")}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar Empresa
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {profileData.experience.map((exp) => (
                  <div key={exp.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white">{exp.role}</h4>
                        <p className="text-xs text-indigo-300">{exp.company} · {exp.location}</p>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">{exp.period}</span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: Education */}
          {activeTab === "education" && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Educación & Certificaciones
              </h3>
              <div className="flex flex-col gap-3">
                {profileData.education.map((edu) => (
                  <div key={edu.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col gap-1">
                    <h4 className="text-sm font-bold text-white">{edu.title}</h4>
                    <p className="text-xs text-indigo-300">{edu.institution} · {edu.period}</p>
                    <p className="text-[11px] text-zinc-400">{edu.description}</p>
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
