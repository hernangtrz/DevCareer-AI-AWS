"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mic, FileText, Code2, Cpu, Briefcase } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import UserMenu from "@/components/UserMenu";

interface NavbarLinksProps {
  userName: string;
  userEmail?: string;
}

const NavbarLinks = ({ userName, userEmail }: NavbarLinksProps) => {
  const { t } = useLanguage();
  const pathname = usePathname();

  const navLinks = [
    {
      href: "/dashboard",
      label: t("nav_interviews") || "Entrevistas",
      icon: <Mic className="h-4 w-4" />,
      active: pathname === "/dashboard" || pathname.startsWith("/interview"),
      badge: null,
    },
    {
      href: "/cv",
      label: t("nav_cv_hub") || "CV & ATS",
      icon: <FileText className="h-4 w-4" />,
      active: pathname.startsWith("/cv"),
      badge: null,
    },
    {
      href: "/code-challenge",
      label: t("nav_code_arena") || "Retos & Patrones",
      icon: <Code2 className="h-4 w-4" />,
      active: pathname.startsWith("/code-challenge"),
      badge: "Arena",
    },
    {
      href: "/system-design",
      label: t("nav_system_design") || "System Design",
      icon: <Cpu className="h-4 w-4" />,
      active: pathname.startsWith("/system-design"),
      badge: "Nuevo",
    },
    {
      href: "/jobs",
      label: t("nav_jobs") || "Empleos",
      icon: <Briefcase className="h-4 w-4" />,
      active: pathname.startsWith("/jobs"),
      badge: "Match",
    },
  ];

  return (
    <div className="flex items-center gap-1">
      <nav className="flex items-center gap-1 max-lg:hidden">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              link.active
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
            {link.badge && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[9px] font-bold leading-none">
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="ml-2">
        <UserMenu name={userName} email={userEmail} />
      </div>
    </div>
  );
};

export default NavbarLinks;
