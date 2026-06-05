"use client";

import { cn } from "@/lib/utils";
import { Mail, Phone, MapPin } from "lucide-react";

const Linkedin = ({ width, height, className }: { width?: number; height?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={width || 12}
    height={height || 12}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

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

/* ─── Shared size tokens ─────────────────────────────────────────────────────── */
const sz = (isPrint: boolean) => ({
  name: isPrint ? "22pt" : "1.5em",
  headline: isPrint ? "12pt" : "0.9em",
  section: isPrint ? "9pt" : "0.75em",
  body: isPrint ? "10pt" : "0.7em",
  small: isPrint ? "8.5pt" : "0.65em",
  iconW: isPrint ? 12 : 7,
});

/* ─── TEMPLATE 1: Profesional Clásico ───────────────────────────────────────── */
const TemplateProfesional = ({ personalInfo, experiences, skills, education, isPrint, photoUrl, profileText, accentColor }: CvPreviewProps) => {
  const s = sz(isPrint!);
  return (
    <div style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: isPrint ? "11pt" : "7px", lineHeight: 1.45, color: "#1a1a1a", width: "100%", height: "100%", padding: isPrint ? "32px 36px" : "10px 12px", boxSizing: "border-box", background: "#fff" }}>
      {/* Header strip */}
      <div style={{ borderBottom: `3px solid ${accentColor}`, paddingBottom: isPrint ? "14px" : "6px", marginBottom: isPrint ? "14px" : "6px", display: "flex", gap: isPrint ? "16px" : "8px", alignItems: "flex-start" }}>
        {photoUrl && (
          <div style={{ width: isPrint ? "80px" : "40px", height: isPrint ? "96px" : "48px", flexShrink: 0, overflow: "hidden", borderRadius: "4px", border: "1px solid #ddd" }}>
            <img src={photoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: s.name, fontWeight: 700, color: accentColor, letterSpacing: "0.02em" }}>{personalInfo.name || "Tu Nombre Completo"}</div>
          <div style={{ fontSize: s.headline, color: "#555", marginTop: isPrint ? "3px" : "2px", fontStyle: "italic" }}>{personalInfo.headline || "Título Profesional"}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isPrint ? "12px" : "5px", marginTop: isPrint ? "6px" : "3px" }}>
            {personalInfo.email && <span style={{ fontSize: s.small, color: "#666", display: "flex", alignItems: "center", gap: "3px" }}><Mail width={s.iconW} height={s.iconW} /> {personalInfo.email}</span>}
            {personalInfo.phone && <span style={{ fontSize: s.small, color: "#666", display: "flex", alignItems: "center", gap: "3px" }}><Phone width={s.iconW} height={s.iconW} /> {personalInfo.phone}</span>}
            {personalInfo.location && <span style={{ fontSize: s.small, color: "#666", display: "flex", alignItems: "center", gap: "3px" }}><MapPin width={s.iconW} height={s.iconW} /> {personalInfo.location}</span>}
            {personalInfo.linkedin && <span style={{ fontSize: s.small, color: "#666", display: "flex", alignItems: "center", gap: "3px" }}><Linkedin width={s.iconW} height={s.iconW} /> {personalInfo.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* Profile */}
      {profileText && (
        <Section title="Perfil Profesional" accent={accentColor} isPrint={isPrint!}>
          <p style={{ fontSize: s.body, color: "#444", textAlign: "justify", lineHeight: 1.5 }}>{profileText}</p>
        </Section>
      )}

      {/* Experience */}
      {experiences.filter(e => e.company || e.role).length > 0 && (
        <Section title="Experiencia Laboral" accent={accentColor} isPrint={isPrint!}>
          {experiences.filter(e => e.company || e.role).map((exp, i) => (
            <div key={i} style={{ marginBottom: isPrint ? "10px" : "5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: s.section, fontWeight: 700, color: "#1a1a1a" }}>{exp.role || "Cargo"}</span>
                <span style={{ fontSize: s.small, color: "#888" }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Presente"}</span>
              </div>
              <div style={{ fontSize: s.small, color: accentColor, fontWeight: 600, marginBottom: "2px" }}>{exp.company}</div>
              {exp.bullets.filter(Boolean).map((b, bi) => (
                <div key={bi} style={{ fontSize: s.body, color: "#555", paddingLeft: isPrint ? "10px" : "5px", lineHeight: 1.5 }}>• {b}</div>
              ))}
            </div>
          ))}
        </Section>
      )}

      {/* Education */}
      {education.filter(e => e.institution || e.degree).length > 0 && (
        <Section title="Educación" accent={accentColor} isPrint={isPrint!}>
          {education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} style={{ marginBottom: isPrint ? "6px" : "3px", display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <div style={{ fontSize: s.section, fontWeight: 700, color: "#1a1a1a" }}>{edu.degree || "Título"}</div>
                <div style={{ fontSize: s.small, color: "#666" }}>{edu.institution}</div>
              </div>
              <span style={{ fontSize: s.small, color: "#888" }}>{edu.year}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <Section title="Habilidades" accent={accentColor} isPrint={isPrint!}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: isPrint ? "5px" : "3px" }}>
            {skills.map((s2, i) => (
              <span key={i} style={{ fontSize: s.small, background: `${accentColor}18`, color: accentColor, border: `1px solid ${accentColor}40`, padding: isPrint ? "2px 8px" : "1px 4px", borderRadius: "3px", fontWeight: 600 }}>{s2}</span>
            ))}
          </div>
        </Section>
      )}

      {experiences.length === 0 && education.length === 0 && <PlaceholderLines />}
    </div>
  );
};

/* ─── TEMPLATE 2: Ejecutivo ──────────────────────────────────────────────────── */
const TemplateEjecutivo = ({ personalInfo, experiences, skills, education, isPrint, photoUrl, profileText, accentColor }: CvPreviewProps) => {
  const s = sz(isPrint!);
  const darkBg = accentColor;
  return (
    <div style={{ fontFamily: "'Arial', Helvetica, sans-serif", fontSize: isPrint ? "11pt" : "7px", lineHeight: 1.5, color: "#2d2d2d", width: "100%", height: "100%", boxSizing: "border-box", background: "#fafafa" }}>
      {/* Full-width dark header */}
      <div style={{ background: darkBg, padding: isPrint ? "24px 36px" : "10px 14px", display: "flex", alignItems: "center", gap: isPrint ? "20px" : "8px" }}>
        {photoUrl && (
          <div style={{ width: isPrint ? "80px" : "36px", height: isPrint ? "80px" : "36px", flexShrink: 0, overflow: "hidden", borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)" }}>
            <img src={photoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isPrint ? "24pt" : "1.6em", fontWeight: 800, color: "#ffffff", letterSpacing: "0.05em", textTransform: "uppercase" }}>{personalInfo.name || "TU NOMBRE"}</div>
          <div style={{ fontSize: isPrint ? "11pt" : "0.8em", color: "rgba(255,255,255,0.75)", marginTop: isPrint ? "4px" : "2px", fontWeight: 400, letterSpacing: "0.08em", textTransform: "uppercase" }}>{personalInfo.headline || "Título Profesional"}</div>
        </div>
      </div>
      {/* Contact bar */}
      <div style={{ background: `${darkBg}22`, borderBottom: `2px solid ${darkBg}`, padding: isPrint ? "7px 36px" : "3px 14px", display: "flex", flexWrap: "wrap", gap: isPrint ? "20px" : "8px" }}>
        {personalInfo.email && <span style={{ fontSize: s.small, color: "#555", display: "flex", alignItems: "center", gap: "3px" }}><Mail width={s.iconW} height={s.iconW} /> {personalInfo.email}</span>}
        {personalInfo.phone && <span style={{ fontSize: s.small, color: "#555", display: "flex", alignItems: "center", gap: "3px" }}><Phone width={s.iconW} height={s.iconW} /> {personalInfo.phone}</span>}
        {personalInfo.location && <span style={{ fontSize: s.small, color: "#555", display: "flex", alignItems: "center", gap: "3px" }}><MapPin width={s.iconW} height={s.iconW} /> {personalInfo.location}</span>}
        {personalInfo.linkedin && <span style={{ fontSize: s.small, color: "#555", display: "flex", alignItems: "center", gap: "3px" }}><Linkedin width={s.iconW} height={s.iconW} /> {personalInfo.linkedin}</span>}
      </div>

      <div style={{ padding: isPrint ? "20px 36px" : "8px 14px" }}>
        {profileText && (
          <EjecutivoSection title="RESUMEN EJECUTIVO" accent={darkBg} isPrint={isPrint!}>
            <p style={{ fontSize: s.body, color: "#555", textAlign: "justify", lineHeight: 1.6 }}>{profileText}</p>
          </EjecutivoSection>
        )}

        {experiences.filter(e => e.company || e.role).length > 0 && (
          <EjecutivoSection title="TRAYECTORIA PROFESIONAL" accent={darkBg} isPrint={isPrint!}>
            {experiences.filter(e => e.company || e.role).map((exp, i) => (
              <div key={i} style={{ marginBottom: isPrint ? "12px" : "5px", paddingLeft: isPrint ? "12px" : "5px", borderLeft: `3px solid ${darkBg}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: s.section, fontWeight: 700, color: "#1a1a1a" }}>{exp.role || "Cargo"}</span>
                  <span style={{ fontSize: s.small, color: "#999", fontStyle: "italic" }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Presente"}</span>
                </div>
                <div style={{ fontSize: s.small, color: darkBg, fontWeight: 700, marginBottom: "3px" }}>{exp.company}</div>
                {exp.bullets.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: s.body, color: "#555", paddingLeft: isPrint ? "10px" : "4px", lineHeight: 1.5 }}>▸ {b}</div>
                ))}
              </div>
            ))}
          </EjecutivoSection>
        )}

        <div style={{ display: "flex", gap: isPrint ? "24px" : "10px" }}>
          {education.filter(e => e.institution || e.degree).length > 0 && (
            <div style={{ flex: 1 }}>
              <EjecutivoSection title="FORMACIÓN" accent={darkBg} isPrint={isPrint!}>
                {education.filter(e => e.institution || e.degree).map((edu, i) => (
                  <div key={i} style={{ marginBottom: isPrint ? "6px" : "3px" }}>
                    <div style={{ fontSize: s.section, fontWeight: 700, color: "#1a1a1a" }}>{edu.degree}</div>
                    <div style={{ fontSize: s.small, color: "#777" }}>{edu.institution} · {edu.year}</div>
                  </div>
                ))}
              </EjecutivoSection>
            </div>
          )}
          {skills.length > 0 && (
            <div style={{ flex: 1 }}>
              <EjecutivoSection title="COMPETENCIAS" accent={darkBg} isPrint={isPrint!}>
                <div style={{ display: "flex", flexDirection: "column", gap: isPrint ? "3px" : "2px" }}>
                  {skills.map((sk, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: isPrint ? "6px" : "3px" }}>
                      <div style={{ width: isPrint ? "6px" : "3px", height: isPrint ? "6px" : "3px", borderRadius: "50%", background: darkBg, flexShrink: 0 }} />
                      <span style={{ fontSize: s.body, color: "#555" }}>{sk}</span>
                    </div>
                  ))}
                </div>
              </EjecutivoSection>
            </div>
          )}
        </div>
      </div>

      {experiences.length === 0 && education.length === 0 && <PlaceholderLines />}
    </div>
  );
};

/* ─── TEMPLATE 3: Moderno con Sidebar ───────────────────────────────────────── */
const TemplateModerno = ({ personalInfo, experiences, skills, education, isPrint, photoUrl, profileText, accentColor }: CvPreviewProps) => {
  const s = sz(isPrint!);
  return (
    <div style={{ fontFamily: "'Arial', Helvetica, sans-serif", fontSize: isPrint ? "11pt" : "7px", lineHeight: 1.45, color: "#1a1a1a", width: "100%", height: "100%", boxSizing: "border-box", background: "#fff", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "36%", background: accentColor, color: "#fff", padding: isPrint ? "28px 18px" : "10px 8px", display: "flex", flexDirection: "column", gap: isPrint ? "16px" : "7px" }}>
        {photoUrl ? (
          <div style={{ width: isPrint ? "90px" : "42px", height: isPrint ? "90px" : "42px", borderRadius: "50%", overflow: "hidden", border: "3px solid rgba(255,255,255,0.4)", alignSelf: "center" }}>
            <img src={photoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        ) : (
          <div style={{ width: isPrint ? "80px" : "38px", height: isPrint ? "80px" : "38px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center", fontSize: isPrint ? "28pt" : "1.4em", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
            {personalInfo.name ? personalInfo.name.charAt(0).toUpperCase() : "U"}
          </div>
        )}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: isPrint ? "16pt" : "1em", fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{personalInfo.name || "Tu Nombre"}</div>
          <div style={{ fontSize: s.small, color: "rgba(255,255,255,0.7)", marginTop: "3px" }}>{personalInfo.headline || "Título Profesional"}</div>
        </div>
        <SidebarDivider />
        <div style={{ display: "flex", flexDirection: "column", gap: isPrint ? "5px" : "3px" }}>
          <SidebarLabel label="CONTACTO" />
          {personalInfo.email && <SidebarItem icon={<Mail width={s.iconW} height={s.iconW} />} text={personalInfo.email} />}
          {personalInfo.phone && <SidebarItem icon={<Phone width={s.iconW} height={s.iconW} />} text={personalInfo.phone} />}
          {personalInfo.location && <SidebarItem icon={<MapPin width={s.iconW} height={s.iconW} />} text={personalInfo.location} />}
          {personalInfo.linkedin && <SidebarItem icon={<Linkedin width={s.iconW} height={s.iconW} />} text={personalInfo.linkedin} />}
        </div>
        {skills.length > 0 && (
          <>
            <SidebarDivider />
            <SidebarLabel label="HABILIDADES" />
            <div style={{ display: "flex", flexDirection: "column", gap: isPrint ? "4px" : "2px" }}>
              {skills.map((sk, i) => (
                <div key={i} style={{ fontSize: s.body, color: "rgba(255,255,255,0.85)", paddingLeft: "5px" }}>· {sk}</div>
              ))}
            </div>
          </>
        )}
        {education.filter(e => e.institution || e.degree).length > 0 && (
          <>
            <SidebarDivider />
            <SidebarLabel label="EDUCACIÓN" />
            {education.filter(e => e.institution || e.degree).map((edu, i) => (
              <div key={i} style={{ marginBottom: "4px" }}>
                <div style={{ fontSize: s.body, fontWeight: 700, color: "#fff" }}>{edu.degree}</div>
                <div style={{ fontSize: s.small, color: "rgba(255,255,255,0.65)" }}>{edu.institution}</div>
                <div style={{ fontSize: s.small, color: "rgba(255,255,255,0.5)" }}>{edu.year}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: isPrint ? "28px 24px" : "10px 10px", display: "flex", flexDirection: "column", gap: isPrint ? "14px" : "7px" }}>
        {profileText && (
          <div>
            <ModernSectionTitle title="Sobre mí" accent={accentColor} isPrint={isPrint!} />
            <p style={{ fontSize: s.body, color: "#555", lineHeight: 1.6, textAlign: "justify" }}>{profileText}</p>
          </div>
        )}
        {experiences.filter(e => e.company || e.role).length > 0 && (
          <div>
            <ModernSectionTitle title="Experiencia" accent={accentColor} isPrint={isPrint!} />
            {experiences.filter(e => e.company || e.role).map((exp, i) => (
              <div key={i} style={{ marginBottom: isPrint ? "10px" : "5px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: s.section, fontWeight: 700, color: "#1a1a1a" }}>{exp.role}</span>
                  <span style={{ fontSize: s.small, color: "#aaa", fontStyle: "italic" }}>{exp.startDate}{exp.endDate ? ` – ${exp.endDate}` : " – Presente"}</span>
                </div>
                <div style={{ fontSize: s.small, color: accentColor, fontWeight: 600, marginBottom: "2px" }}>{exp.company}</div>
                {exp.bullets.filter(Boolean).map((b, bi) => (
                  <div key={bi} style={{ fontSize: s.body, color: "#666", paddingLeft: isPrint ? "8px" : "4px", lineHeight: 1.5 }}>• {b}</div>
                ))}
              </div>
            ))}
          </div>
        )}
        {experiences.length === 0 && education.length === 0 && <PlaceholderLines />}
      </div>
    </div>
  );
};

/* ─── TEMPLATE 4: ATS Puro ───────────────────────────────────────────────────── */
const TemplateAts = ({ personalInfo, experiences, skills, education, isPrint, profileText }: CvPreviewProps) => {
  const s = sz(isPrint!);
  return (
    <div style={{ fontFamily: "'Arial', Helvetica, sans-serif", fontSize: isPrint ? "11pt" : "7px", lineHeight: 1.6, color: "#000", width: "100%", height: "100%", padding: isPrint ? "28px 36px" : "8px 12px", boxSizing: "border-box", background: "#fff" }}>
      {/* Header: plain text, no colors */}
      <div style={{ textAlign: "center", marginBottom: isPrint ? "10px" : "5px", borderBottom: "1px solid #000", paddingBottom: isPrint ? "8px" : "4px" }}>
        <div style={{ fontSize: isPrint ? "18pt" : "1.2em", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{personalInfo.name || "TU NOMBRE COMPLETO"}</div>
        <div style={{ fontSize: s.section, fontWeight: 600, marginTop: isPrint ? "2px" : "1px" }}>{personalInfo.headline || "Título Profesional"}</div>
        <div style={{ fontSize: s.small, marginTop: isPrint ? "4px" : "2px", display: "flex", justifyContent: "center", flexWrap: "wrap", gap: isPrint ? "12px" : "5px" }}>
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>| {personalInfo.phone}</span>}
          {personalInfo.location && <span>| {personalInfo.location}</span>}
          {personalInfo.linkedin && <span>| {personalInfo.linkedin}</span>}
        </div>
      </div>

      {profileText && (
        <AtsSection title="RESUMEN PROFESIONAL" isPrint={isPrint!}>
          <p style={{ fontSize: s.body, lineHeight: 1.6 }}>{profileText}</p>
        </AtsSection>
      )}

      {experiences.filter(e => e.company || e.role).length > 0 && (
        <AtsSection title="EXPERIENCIA PROFESIONAL" isPrint={isPrint!}>
          {experiences.filter(e => e.company || e.role).map((exp, i) => (
            <div key={i} style={{ marginBottom: isPrint ? "10px" : "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontSize: s.section }}>{exp.role || "Cargo"}</strong>
                <span style={{ fontSize: s.small }}>{exp.startDate}{exp.endDate ? ` - ${exp.endDate}` : " - Presente"}</span>
              </div>
              <div style={{ fontSize: s.small, fontWeight: 600 }}>{exp.company}</div>
              {exp.bullets.filter(Boolean).map((b, bi) => (
                <div key={bi} style={{ fontSize: s.body, paddingLeft: isPrint ? "12px" : "5px" }}>- {b}</div>
              ))}
            </div>
          ))}
        </AtsSection>
      )}

      {education.filter(e => e.institution || e.degree).length > 0 && (
        <AtsSection title="EDUCACIÓN" isPrint={isPrint!}>
          {education.filter(e => e.institution || e.degree).map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: isPrint ? "4px" : "2px" }}>
              <div>
                <strong style={{ fontSize: s.section }}>{edu.degree}</strong>
                <div style={{ fontSize: s.small }}>{edu.institution}</div>
              </div>
              <span style={{ fontSize: s.small }}>{edu.year}</span>
            </div>
          ))}
        </AtsSection>
      )}

      {skills.length > 0 && (
        <AtsSection title="HABILIDADES TÉCNICAS" isPrint={isPrint!}>
          <p style={{ fontSize: s.body }}>{skills.join(" | ")}</p>
        </AtsSection>
      )}

      {experiences.length === 0 && education.length === 0 && <PlaceholderLines />}
    </div>
  );
};

/* ─── Sub-components ─────────────────────────────────────────────────────────── */
const Section = ({ title, accent, isPrint, children }: { title: string; accent: string; isPrint: boolean; children: React.ReactNode }) => (
  <div style={{ marginBottom: isPrint ? "12px" : "6px" }}>
    <div style={{ fontSize: isPrint ? "9pt" : "0.7em", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1.5px solid ${accent}`, paddingBottom: isPrint ? "3px" : "2px", marginBottom: isPrint ? "6px" : "3px" }}>{title}</div>
    {children}
  </div>
);

const EjecutivoSection = ({ title, accent, isPrint, children }: { title: string; accent: string; isPrint: boolean; children: React.ReactNode }) => (
  <div style={{ marginBottom: isPrint ? "12px" : "6px" }}>
    <div style={{ fontSize: isPrint ? "8.5pt" : "0.65em", fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: isPrint ? "6px" : "3px", display: "flex", alignItems: "center", gap: "6px" }}>
      <div style={{ height: "1px", width: "100%", background: `${accent}40` }} />
      <span style={{ whiteSpace: "nowrap" }}>{title}</span>
      <div style={{ height: "1px", width: "100%", background: `${accent}40` }} />
    </div>
    {children}
  </div>
);

const ModernSectionTitle = ({ title, accent, isPrint }: { title: string; accent: string; isPrint: boolean }) => (
  <div style={{ fontSize: isPrint ? "9pt" : "0.7em", fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${accent}`, paddingBottom: isPrint ? "3px" : "1px", marginBottom: isPrint ? "6px" : "3px" }}>{title}</div>
);

const AtsSection = ({ title, isPrint, children }: { title: string; isPrint: boolean; children: React.ReactNode }) => (
  <div style={{ marginBottom: isPrint ? "10px" : "4px" }}>
    <div style={{ fontSize: isPrint ? "9pt" : "0.7em", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #000", paddingBottom: isPrint ? "2px" : "1px", marginBottom: isPrint ? "5px" : "2px" }}>{title}</div>
    {children}
  </div>
);

const SidebarLabel = ({ label }: { label: string }) => (
  <div style={{ fontSize: "0.65em", fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>{label}</div>
);

const SidebarItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.65em", color: "rgba(255,255,255,0.8)", wordBreak: "break-all" }}>
    {icon} {text}
  </div>
);

const SidebarDivider = () => (
  <div style={{ height: "1px", background: "rgba(255,255,255,0.2)", margin: "2px 0" }} />
);

const PlaceholderLines = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "8px", opacity: 0.15 }}>
    {[80, 65, 90, 55, 70, 60].map((w, i) => (
      <div key={i} style={{ height: "6px", borderRadius: "3px", background: "#888", width: `${w}%` }} />
    ))}
  </div>
);

/* ─── Main Export ────────────────────────────────────────────────────────────── */
const CvPreview = (props: CvPreviewProps) => {
  switch (props.templateId) {
    case "ejecutivo":
      return <TemplateEjecutivo {...props} />;
    case "moderno":
    case "creativo": // backwards compat
      return <TemplateModerno {...props} />;
    case "ats":
      return <TemplateAts {...props} />;
    case "profesional":
    default:
      return <TemplateProfesional {...props} />;
  }
};

export default CvPreview;
