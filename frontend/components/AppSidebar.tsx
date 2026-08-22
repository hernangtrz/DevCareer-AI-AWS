"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mic,
  FileText,
  Code2,
  Cpu,
  Briefcase,
  BarChart3,
  Sparkles,
  Plus,
  Menu,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import UserMenu from "@/components/UserMenu";

interface AppSidebarProps {
  userName: string;
  userEmail?: string;
}

export default function AppSidebar({ userName, userEmail }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const mainNavLinks = [
    {
      href: "/dashboard",
      label: t("nav_interviews") || "Entrevistas de Voz",
      icon: <Mic className="w-4 h-4" />,
      active: pathname === "/dashboard" || pathname.startsWith("/interview"),
      badge: null,
    },
    {
      href: "/cv",
      label: t("nav_cv_hub") || "CV & ATS Hub",
      icon: <FileText className="w-4 h-4" />,
      active: pathname.startsWith("/cv"),
      badge: null,
    },
    {
      href: "/code-challenge",
      label: t("nav_code_arena") || "Retos & Patrones",
      icon: <Code2 className="w-4 h-4" />,
      active: pathname.startsWith("/code-challenge"),
      badge: "SOLID",
    },
    {
      href: "/system-design",
      label: t("nav_system_design") || "System Design",
      icon: <Cpu className="w-4 h-4" />,
      active: pathname.startsWith("/system-design"),
      badge: "Nuevo",
    },
  ];

  const placementNavLinks = [
    {
      href: "/jobs",
      label: t("nav_jobs") || "Smart Job Portal",
      icon: <Briefcase className="w-4 h-4" />,
      active: pathname.startsWith("/jobs"),
      badge: "Match",
    },
    {
      href: "/analytics",
      label: t("nav_analytics") || "Progreso & Analytics",
      icon: <BarChart3 className="w-4 h-4" />,
      active: pathname.startsWith("/analytics"),
      badge: "Próximamente",
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 select-none">
      {/* ── Top branding & Navigation ── */}
      <div className="flex flex-col gap-5">
        {/* Brand */}
        <Link
          href="/dashboard"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-zinc-900/60 transition-colors group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-md shadow-indigo-500/25 text-white font-bold shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight text-sm group-hover:text-indigo-200 transition-colors">
                DevCareer AI
              </span>
              <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-extrabold uppercase">
                PRO
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">Career Prep Platform</span>
          </div>
        </Link>

        {/* Primary Action Button */}
        <Link
          href="/interview"
          onClick={() => setMobileOpen(false)}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Entrevista</span>
        </Link>

        {/* ── Main Navigation Section ── */}
        <div className="flex flex-col gap-1.5">
          <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Preparación & Práctica
          </span>
          <nav className="flex flex-col gap-1">
            {mainNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  link.active
                    ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`transition-colors shrink-0 ${
                      link.active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none shrink-0 ${
                      link.active
                        ? "bg-indigo-500/30 text-indigo-200"
                        : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* ── Placement & Analytics Section ── */}
        <div className="flex flex-col gap-1.5 pt-2">
          <span className="px-2 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
            Empleabilidad & Métricas
          </span>
          <nav className="flex flex-col gap-1">
            {placementNavLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  link.active
                    ? "bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/20 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`transition-colors shrink-0 ${
                      link.active ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {link.icon}
                  </span>
                  <span className="truncate">{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold leading-none shrink-0 ${
                      link.active
                        ? "bg-indigo-500/30 text-indigo-200"
                        : "bg-zinc-800 text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Bottom Section: Single Upward User Profile Card ── */}
      <div className="pt-3 border-t border-zinc-800/80">
        <UserMenu name={userName} email={userEmail} direction="up" variant="full-card" />
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop Permanent Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed top-0 left-0 bg-zinc-950/95 border-r border-zinc-800/80 z-40 backdrop-blur-xl no-print">
        {sidebarContent}
      </aside>

      {/* ── Mobile Header & Drawer ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/90 border-b border-zinc-800/80 px-4 flex items-center justify-between z-40 backdrop-blur-xl no-print">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white font-bold text-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-bold text-white text-sm">DevCareer AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex flex-col w-72 h-full bg-zinc-950 border-r border-zinc-800 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
