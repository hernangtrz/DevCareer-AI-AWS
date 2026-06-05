"use client";

import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Code } from "lucide-react";

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
  isPrint?: boolean;
  photoUrl?: string;
  profileText?: string;
}

const CvPreview = ({
  templateId,
  accentColor,
  personalInfo,
  experiences,
  skills,
  education,
  isPrint = false,
  photoUrl,
  profileText,
}: CvPreviewProps) => {
  const isModern = templateId === "moderno" || templateId === "creativo";
  const iconClass = isPrint ? "h-3.5 w-3.5" : "h-1.5 w-1.5";

  return (
    <div
      className={cn(
        "w-full h-full bg-white text-gray-800 overflow-hidden flex select-text",
        isModern ? "flex-row" : "flex-col",
        isPrint ? "p-8 border border-gray-200 shadow-none print:border-none print:shadow-none" : ""
      )}
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: isPrint ? "11pt" : "7px",
        lineHeight: "1.4",
        width: isPrint ? "210mm" : "100%",
        height: isPrint ? "297mm" : "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Sidebar for modern/creative templates */}
      {isModern && (
        <div
          className={cn(
            "w-[35%] flex flex-col text-white",
            isPrint ? "p-6 gap-4" : "p-3 gap-2"
          )}
          style={{ background: accentColor }}
        >
          {/* Avatar placeholder / Photo */}
          {photoUrl ? (
            <div
              className={cn(
                "rounded-full bg-white/20 mx-auto overflow-hidden flex items-center justify-center border-2 border-white/40",
                isPrint ? "w-20 h-20 mb-2" : "w-12 h-12 mb-1"
              )}
            >
              <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className={cn(
                "rounded-full bg-white/20 mx-auto flex items-center justify-center text-white/60",
                isPrint ? "w-20 h-20 text-lg mb-2" : "w-12 h-12 text-[8px] mb-1"
              )}
            >
              {personalInfo.name ? personalInfo.name.charAt(0).toUpperCase() : "U"}
            </div>
          )}

          <div className="text-center">
            <p
              className="font-bold text-white leading-tight"
              style={{ fontSize: "1.2em" }}
            >
              {personalInfo.name || "Tu Nombre"}
            </p>
            <p className="text-white/70" style={{ fontSize: "0.85em" }}>
              {personalInfo.headline || "Tu Título Profesional"}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 mt-2">
            <p
              className="font-bold uppercase tracking-wide text-white/80 border-b border-white/20 pb-0.5"
              style={{ fontSize: "0.95em" }}
            >
              Contacto
            </p>
            {personalInfo.email && (
              <p className="text-white/70 flex items-center gap-1.5 break-all" style={{ fontSize: "0.8em" }}>
                <Mail className={cn(iconClass, "flex-shrink-0")} />
                {personalInfo.email}
              </p>
            )}
            {personalInfo.phone && (
              <p className="text-white/70 flex items-center gap-1.5" style={{ fontSize: "0.8em" }}>
                <Phone className={cn(iconClass, "flex-shrink-0")} />
                {personalInfo.phone}
              </p>
            )}
            {personalInfo.location && (
              <p className="text-white/70 flex items-center gap-1.5" style={{ fontSize: "0.8em" }}>
                <MapPin className={cn(iconClass, "flex-shrink-0")} />
                {personalInfo.location}
              </p>
            )}
          </div>

          {skills.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-2">
              <p
                className="font-bold uppercase tracking-wide text-white/80 border-b border-white/20 pb-0.5"
                style={{ fontSize: "0.95em" }}
              >
                Habilidades
              </p>
              <div className="flex flex-wrap gap-1">
                {skills.map((s, i) => (
                  <span
                    key={i}
                    className="px-1.5 py-0.5 rounded bg-white/20 text-white font-medium"
                    style={{ fontSize: "0.75em" }}
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
      <div
        className={cn(
          "flex flex-col gap-3",
          isModern ? (isPrint ? "w-[65%] p-6" : "w-[65%] p-3") : (isPrint ? "w-full p-6" : "w-full p-3")
        )}
      >
        {/* Header (classic/ATS only) */}
        {!isModern && (
          <div
            className="pb-2.5 mb-1.5 flex gap-4 items-center"
            style={{ borderBottom: `2px solid ${accentColor}` }}
          >
            {photoUrl && (
              <div
                className={cn(
                  "rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 bg-gray-50",
                  isPrint ? "w-20 h-24" : "w-12 h-14"
                )}
              >
                <img src={photoUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <p
                className="font-bold leading-tight"
                style={{ color: accentColor, fontSize: "1.5em" }}
              >
                {personalInfo.name || "Tu Nombre Completo"}
              </p>
              <p className="text-gray-500 font-medium" style={{ fontSize: "1em" }}>
                {personalInfo.headline || "Título Profesional"}
              </p>
              <div className="flex gap-3 mt-1.5 flex-wrap">
                {personalInfo.email && (
                  <span className="text-gray-500 flex items-center gap-1" style={{ fontSize: "0.8em" }}>
                    <Mail className={iconClass} /> {personalInfo.email}
                  </span>
                )}
                {personalInfo.phone && (
                  <span className="text-gray-500 flex items-center gap-1" style={{ fontSize: "0.8em" }}>
                    <Phone className={iconClass} /> {personalInfo.phone}
                  </span>
                )}
                {personalInfo.location && (
                  <span className="text-gray-500 flex items-center gap-1" style={{ fontSize: "0.8em" }}>
                    <MapPin className={iconClass} /> {personalInfo.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile (Acerca de mí / Resumen) */}
        {profileText && (
          <div>
            <p
              className="font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"
              style={{ color: accentColor, fontSize: "1.1em" }}
            >
              Perfil
            </p>
            <p className="text-gray-600 text-justify" style={{ fontSize: "0.85em", lineHeight: "1.4" }}>
              {profileText}
            </p>
          </div>
        )}

        {/* Experience */}
        {experiences.length > 0 && (
          <div>
            <p
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: accentColor, fontSize: "1.1em" }}
            >
              <Briefcase className={iconClass} /> Experiencia
            </p>
            {experiences.map((exp, i) => (
              <div key={i} className={cn(isPrint ? "mb-4" : "mb-2")}>
                <div className="flex justify-between items-baseline flex-wrap">
                  <p className="font-semibold text-gray-800" style={{ fontSize: "0.95em" }}>
                    {exp.role || "Cargo"}
                  </p>
                  <p className="text-gray-400 font-medium" style={{ fontSize: "0.8em" }}>
                    {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : "– Presente"}
                  </p>
                </div>
                <p className="text-gray-500 font-medium" style={{ fontSize: "0.85em" }}>
                  {exp.company || "Empresa"}
                </p>
                <div className="mt-1 flex flex-col gap-0.5">
                  {exp.bullets.map((b, bi) => (
                    b && (
                      <p key={bi} className="text-gray-600 pl-2 relative" style={{ fontSize: "0.85em" }}>
                        • {b}
                      </p>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div>
            <p
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: accentColor, fontSize: "1.1em" }}
            >
              <GraduationCap className={iconClass} /> Educación
            </p>
            {education.map((edu, i) => (
              <div key={i} className="mb-2">
                <div className="flex justify-between items-baseline flex-wrap">
                  <p className="font-semibold text-gray-800" style={{ fontSize: "0.95em" }}>
                    {edu.degree || "Título"}
                  </p>
                  <p className="text-gray-400 font-medium" style={{ fontSize: "0.8em" }}>
                    {edu.year}
                  </p>
                </div>
                <p className="text-gray-500 font-medium" style={{ fontSize: "0.85em" }}>
                  {edu.institution || "Institución"}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Skills (classic only) */}
        {!isModern && skills.length > 0 && (
          <div>
            <p
              className="font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"
              style={{ color: accentColor, fontSize: "1.1em" }}
            >
              <Code className={iconClass} /> Habilidades
            </p>
            <div className="flex flex-wrap gap-1">
              {skills.map((s, i) => (
                <span
                  key={i}
                  className="px-1.5 py-0.5 rounded text-white font-medium"
                  style={{ background: accentColor, fontSize: "0.75em" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Empty state placeholder lines */}
        {experiences.length === 0 && education.length === 0 && (
          <div className="flex flex-col gap-1.5 mt-2 opacity-20">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded bg-gray-400"
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
