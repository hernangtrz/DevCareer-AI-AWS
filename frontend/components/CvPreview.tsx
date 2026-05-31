"use client";

import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Link2, Briefcase, GraduationCap, Code } from "lucide-react";

interface PersonalInfo {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
}

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

interface CvPreviewProps {
  templateId: string;
  accentColor: string;
  personalInfo: PersonalInfo;
  experiences: WorkExperience[];
  skills: string[];
  education: Education[];
}

const CvPreview = ({
  templateId,
  accentColor,
  personalInfo,
  experiences,
  skills,
  education,
}: CvPreviewProps) => {
  const isModern = templateId === "moderno" || templateId === "creativo";

  return (
    <div
      className={cn(
        "w-full h-full bg-white text-gray-800 overflow-hidden flex",
        isModern ? "flex-row" : "flex-col"
      )}
      style={{ fontFamily: "sans-serif", fontSize: "7px", lineHeight: "1.3" }}
    >
      {/* Sidebar for modern/creative templates */}
      {isModern && (
        <div
          className="w-[35%] p-3 flex flex-col gap-2 text-white"
          style={{ background: accentColor }}
        >
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full bg-white/20 mx-auto mb-1 flex items-center justify-center text-white/60 text-[8px]">
            {personalInfo.name ? personalInfo.name.charAt(0) : "U"}
          </div>

          <div className="text-center">
            <p className="font-bold text-[8px] text-white leading-tight">
              {personalInfo.name || "Tu Nombre"}
            </p>
            <p className="text-white/70 text-[6px]">
              {personalInfo.headline || "Tu Título Profesional"}
            </p>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <p className="font-bold text-[7px] uppercase tracking-wide text-white/80 border-b border-white/20 pb-0.5">
              Contacto
            </p>
            {personalInfo.email && (
              <p className="text-[6px] text-white/70 flex items-center gap-1">
                <Mail className="h-1.5 w-1.5 flex-shrink-0" />
                {personalInfo.email}
              </p>
            )}
            {personalInfo.phone && (
              <p className="text-[6px] text-white/70 flex items-center gap-1">
                <Phone className="h-1.5 w-1.5 flex-shrink-0" />
                {personalInfo.phone}
              </p>
            )}
            {personalInfo.location && (
              <p className="text-[6px] text-white/70 flex items-center gap-1">
                <MapPin className="h-1.5 w-1.5 flex-shrink-0" />
                {personalInfo.location}
              </p>
            )}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <p className="font-bold text-[7px] uppercase tracking-wide text-white/80 border-b border-white/20 pb-0.5">
                Habilidades
              </p>
              <div className="flex flex-wrap gap-0.5">
                {skills.slice(0, 8).map((s, i) => (
                  <span
                    key={i}
                    className="px-1 py-0.5 rounded text-[5px] bg-white/20 text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main content */}
      <div className={cn("flex flex-col gap-2 p-3", isModern ? "w-[65%]" : "w-full")}>
        {/* Header (classic/ATS only) */}
        {!isModern && (
          <div
            className="pb-2 mb-1"
            style={{ borderBottom: `2px solid ${accentColor}` }}
          >
            <p
              className="font-bold text-[10px] leading-tight"
              style={{ color: accentColor }}
            >
              {personalInfo.name || "Tu Nombre Completo"}
            </p>
            <p className="text-gray-500 text-[7px]">
              {personalInfo.headline || "Título Profesional"}
            </p>
            <div className="flex gap-2 mt-0.5 flex-wrap">
              {personalInfo.email && (
                <span className="text-[6px] text-gray-400 flex items-center gap-0.5">
                  <Mail className="h-1.5 w-1.5" /> {personalInfo.email}
                </span>
              )}
              {personalInfo.phone && (
                <span className="text-[6px] text-gray-400 flex items-center gap-0.5">
                  <Phone className="h-1.5 w-1.5" /> {personalInfo.phone}
                </span>
              )}
              {personalInfo.location && (
                <span className="text-[6px] text-gray-400 flex items-center gap-0.5">
                  <MapPin className="h-1.5 w-1.5" /> {personalInfo.location}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div>
            <p
              className="font-bold text-[7px] uppercase tracking-wider mb-1 flex items-center gap-1"
              style={{ color: accentColor }}
            >
              <Briefcase className="h-2 w-2" /> Experiencia
            </p>
            {experiences.slice(0, 2).map((exp, i) => (
              <div key={i} className="mb-1">
                <div className="flex justify-between items-baseline">
                  <p className="font-semibold text-[7px]">{exp.role || "Cargo"}</p>
                  <p className="text-[6px] text-gray-400">
                    {exp.startDate} {exp.endDate ? `- ${exp.endDate}` : "- Presente"}
                  </p>
                </div>
                <p className="text-[6px] text-gray-500">{exp.company || "Empresa"}</p>
                {exp.bullets.slice(0, 2).map((b, bi) => (
                  <p key={bi} className="text-[6px] text-gray-600 pl-1">
                    • {b}
                  </p>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <p
              className="font-bold text-[7px] uppercase tracking-wider mb-1 flex items-center gap-1"
              style={{ color: accentColor }}
            >
              <GraduationCap className="h-2 w-2" /> Educación
            </p>
            {education.slice(0, 2).map((edu, i) => (
              <div key={i} className="mb-0.5">
                <p className="font-semibold text-[7px]">{edu.degree || "Título"}</p>
                <p className="text-[6px] text-gray-500">
                  {edu.institution || "Institución"} {edu.year && `· ${edu.year}`}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Skills (classic only) */}
        {!isModern && skills.length > 0 && (
          <div>
            <p
              className="font-bold text-[7px] uppercase tracking-wider mb-1 flex items-center gap-1"
              style={{ color: accentColor }}
            >
              <Code className="h-2 w-2" /> Habilidades
            </p>
            <div className="flex flex-wrap gap-0.5">
              {skills.slice(0, 10).map((s, i) => (
                <span
                  key={i}
                  className="px-1 py-0.5 rounded text-[5px] text-white"
                  style={{ background: accentColor }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state placeholder lines */}
        {experiences.length === 0 && education.length === 0 && (
          <div className="flex flex-col gap-1 mt-2 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-1 rounded bg-gray-400"
                style={{ width: `${60 + Math.random() * 35}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CvPreview;
