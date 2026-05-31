export const dynamic = "force-dynamic";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import InterviewCard from "@/components/InterviewCard";
import { getCurrentUser, getSessionCookie } from "@/lib/api.server";
import { getInterviewsByUserId } from "@/lib/api";
import { interviewTemplates } from "@/constants";
import { FileText, Search, ArrowRight } from "lucide-react";

const moduleCards = [
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Crear CV con IA",
    description: "Genera tu hoja de vida profesional adaptada al rol que buscas.",
    href: "/cv-creator",
    badge: "Nuevo",
    color: "from-violet-500/20 to-violet-600/5 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: <Search className="h-5 w-5" />,
    title: "Analizar CV con IA",
    description: "Compara tu CV contra una oferta laboral y obtén tu score ATS.",
    href: "/cv-analyzer",
    badge: "Nuevo",
    color: "from-fuchsia-500/20 to-fuchsia-600/5 border-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
  },
];

const Page = async () => {
  const user = await getCurrentUser();
  if (!user || !user.id) redirect("/sign-in");

  const sessionCookie = await getSessionCookie();
  const userInterviews = await getInterviewsByUserId(sessionCookie);
  const hasPastInterviews = userInterviews && userInterviews.length > 0;

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Prepárate para tus entrevistas con práctica y retroalimentación impulsada por IA</h2>
          <p className="text-lg">Practica con preguntas reales de entrevistas y obtén retroalimentación instantánea</p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Iniciar una entrevista</Link>
          </Button>
        </div>
        <Image
          src="/Robotv3.png"
          alt="AI Robot DevCareer"
          width={550}
          height={550}
          unoptimized
          className="max-sm:hidden object-contain -mr-16 scale-110 hover:scale-115 transition-transform duration-300"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <div className="flex items-center gap-3">
          <h2>Otros módulos</h2>
          <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">Nuevas herramientas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {moduleCards.map((m) => (
            <Link key={m.title} href={m.href}
              className={`group flex items-start gap-4 p-6 rounded-2xl bg-gradient-to-br border transition-all hover:scale-[1.01] ${m.color}`}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.05] flex-shrink-0 ${m.iconColor}`}>{m.icon}</div>
              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white font-semibold text-sm">{m.title}</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold">{m.badge}</span>
                </div>
                <p className="text-white/50 text-xs leading-relaxed">{m.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/30 group-hover:text-white/70 transition-colors flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Tus entrevistas</h2>
        <div className="interviews-section">
          {hasPastInterviews
            ? userInterviews?.map((interview) => (
                <InterviewCard {...interview} key={interview.id} currentUserId={user.id} />
              ))
            : <p>Aún no has realizado ninguna entrevista</p>}
        </div>
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Plantillas de entrevistas</h2>
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
