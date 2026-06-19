export const dynamic = "force-dynamic";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser, getSessionCookie, getLanguageCookie } from "@/lib/api.server";
import { getInterviewsByUserId } from "@/lib/api";
import { interviewTemplates } from "@/constants";
import { FileText, Search, ArrowRight, Code2 } from "lucide-react";
import { translations } from "@/lib/translations";

const Page = async () => {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/sign-in");

  const sessionCookie = await getSessionCookie();
  const userInterviews = await getInterviewsByUserId(sessionCookie);
  const hasPastInterviews = userInterviews && userInterviews.length > 0;

  const lang = await getLanguageCookie();
  const t = translations[lang];

  const moduleCards = [
    {
      icon: <FileText className="h-5 w-5" />,
      title: t.dash_cv_builder_title,
      description: t.dash_cv_builder_desc,
      href: "/cv-creator",
      badge: t.nav_new,
      color: "from-violet-500/20 to-violet-600/5 border-violet-500/20",
      iconColor: "text-violet-400",
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: t.dash_cv_analyzer_title,
      description: t.dash_cv_analyzer_desc,
      href: "/cv-analyzer",
      badge: t.nav_new,
      color: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/20",
      iconColor: "text-fuchsia-400",
    },
    {
      icon: <Code2 className="h-5 w-5" />,
      title: t.dash_code_challenge_title,
      description: t.dash_code_challenge_desc,
      href: "/code-challenge",
      badge: t.dash_code_challenge_badge,
      color: "from-cyan-500/20 to-cyan-600/5 border-cyan-500/20",
      iconColor: "text-cyan-400",
    },
  ];

  return (
    <>
      {/* ─── Premium Hero Section ─── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#181635]/60 to-[#090A0E] border border-zinc-800/80 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e8112_1px,transparent_1px),linear-gradient(to_bottom,#312e8112_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        {/* Glowing gradient background effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col gap-6 max-w-lg z-10 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium w-fit">
            ✨ {t.dash_new_tools}
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-white tracking-tight">
            Prepárate con{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300">
              Inteligencia Artificial
            </span>
          </h1>
          <p className="text-zinc-400 text-base md:text-lg leading-relaxed font-light">
            {t.dash_hero_subtitle}
          </p>
          <Button asChild className="btn-primary max-sm:w-full hover:shadow-[0_0_20px_rgba(202,197,254,0.3)] transition-all duration-300">
            <Link href="/interview" className="flex items-center justify-center gap-2">
              {t.dash_start_interview} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Right side: AI Audio/Voice Visualizer Panel */}
        <div className="relative w-full max-w-[420px] bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex flex-col justify-between overflow-hidden aspect-[4/3] max-md:hidden select-none z-10">
          {/* Grid overlay background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
          
          {/* Top status bar */}
          <div className="relative flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-zinc-400 tracking-wider">AI AGENT ONLINE</span>
            </div>
            <div className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-400 font-mono">
              LATENCY: 120ms
            </div>
          </div>

          {/* Center soundwave animation */}
          <div className="relative flex items-center justify-center h-28 z-10 gap-1.5">
            {/* Sound waves pulsing */}
            <div className="flex items-end gap-1.5 h-16">
              <div className="w-1 bg-indigo-500 rounded-full animate-bar1 h-4" />
              <div className="w-1 bg-violet-500 rounded-full animate-bar2 h-8" />
              <div className="w-1 bg-purple-500 rounded-full animate-bar3 h-12" />
              <div className="w-1 bg-fuchsia-500 rounded-full animate-bar4 h-6" />
              <div className="w-1 bg-pink-500 rounded-full animate-bar5 h-14" />
              <div className="w-1 bg-fuchsia-500 rounded-full animate-bar4 h-10" />
              <div className="w-1 bg-purple-500 rounded-full animate-bar3 h-6" />
              <div className="w-1 bg-violet-500 rounded-full animate-bar2 h-12" />
              <div className="w-1 bg-indigo-500 rounded-full animate-bar1 h-4" />
            </div>
            
            {/* Concentric rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full border border-indigo-500/20 animate-pulse" />
              <div className="w-32 h-32 rounded-full border border-violet-500/10 animate-ping [animation-duration:3s]" />
            </div>
          </div>

          {/* Simulated transcript snippet */}
          <div className="relative z-10 bg-zinc-900/50 border border-zinc-800/40 rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-start gap-2 text-xs">
              <span className="font-bold text-indigo-400">IA:</span>
              <p className="text-zinc-300 text-xs leading-relaxed">
                "¿Cuál es la diferencia entre Server Components y Client Components en Next.js?"
              </p>
            </div>
            <div className="h-px bg-zinc-800/50" />
            <div className="flex items-start gap-2 text-xs">
              <span className="font-bold text-emerald-400">TÚ:</span>
              <p className="text-zinc-400 text-xs leading-relaxed italic truncate">
                "Los Server Components se ejecutan en el servidor y reducen el JavaScript enviado..."
              </p>
            </div>
          </div>

          {/* CSS Styles injection for animations */}
          <style>{`
            @keyframes barAnimation1 {
              0%, 100% { height: 16px; }
              50% { height: 32px; }
            }
            @keyframes barAnimation2 {
              0%, 100% { height: 24px; }
              50% { height: 48px; }
            }
            @keyframes barAnimation3 {
              0%, 100% { height: 36px; }
              50% { height: 60px; }
            }
            @keyframes barAnimation4 {
              0%, 100% { height: 20px; }
              50% { height: 40px; }
            }
            @keyframes barAnimation5 {
              0%, 100% { height: 40px; }
              50% { height: 64px; }
            }
            .animate-bar1 { animation: barAnimation1 1.2s ease-in-out infinite; }
            .animate-bar2 { animation: barAnimation2 0.9s ease-in-out infinite; }
            .animate-bar3 { animation: barAnimation3 1.5s ease-in-out infinite; }
            .animate-bar4 { animation: barAnimation4 1.1s ease-in-out infinite; }
            .animate-bar5 { animation: barAnimation5 1.3s ease-in-out infinite; }
          `}</style>
        </div>
      </section>

      {/* ─── Other Modules Section ─── */}
      <section className="flex flex-col gap-6 mt-12 text-left">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-white">{t.dash_other_modules}</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            {t.dash_new_tools}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {moduleCards.map((m) => (
            <Link key={m.title} href={m.href}
              className={`group flex items-start gap-4 p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-indigo-500/30 transition-all hover:scale-[1.01] hover:bg-zinc-900/80`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] flex-shrink-0 ${m.iconColor}`}>
                {m.icon}
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm group-hover:text-indigo-200 transition-colors">{m.title}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">{m.badge}</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">{m.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* ─── My Interviews Section ─── */}
      <section className="flex flex-col gap-6 mt-12 text-left">
        <h2 className="text-2xl font-bold text-white">{t.dash_my_interviews}</h2>
        <div className="interviews-section">
          {hasPastInterviews
            ? userInterviews?.map((interview) => (
                <InterviewCard {...interview} key={interview.id} currentUserId={user.id} />
              ))
            : <p className="text-white/40 text-sm italic">{t.dash_no_interviews}</p>}
        </div>
      </section>

      {/* ─── Interview Templates Section ─── */}
      <section className="flex flex-col gap-6 mt-12 text-left">
        <h2 className="text-2xl font-bold text-white">{t.dash_templates}</h2>
        <div className="interviews-section">
          {interviewTemplates.map((template) => (
            <InterviewCard {...template} key={template.id} isTemplate={true} currentUserId={user?.id} />
          ))}
        </div>
      </section>
    </>
  );
};

export default Page;
