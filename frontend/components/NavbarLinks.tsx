"use client";

import Link from "next/link";
import { Mic, FileText, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import UserMenu from "@/components/UserMenu";

interface NavbarLinksProps {
  userName: string;
  userEmail?: string;
}

const NavbarLinks = ({ userName, userEmail }: NavbarLinksProps) => {
  const { t } = useLanguage();

  const navLinks = [
    { href: "/dashboard", label: t("nav_interviews"), icon: <Mic className="h-4 w-4" />, badge: null },
    { href: "/cv-creator", label: t("nav_create_cv"), icon: <FileText className="h-4 w-4" />, badge: t("nav_new") },
    { href: "/cv-analyzer", label: t("nav_analyze_cv"), icon: <Search className="h-4 w-4" />, badge: t("nav_new") },
  ];

  return (
    <div className="flex items-center gap-1">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="relative flex items-center gap-2 px-4 py-2 rounded-full text-sm text-light-400 hover:text-primary-100 hover:bg-dark-200 transition-all font-medium"
        >
          {link.icon}
          <span className="max-sm:hidden">{link.label}</span>
          {link.badge && (
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-500/80 text-white text-[9px] font-bold leading-none">
              {link.badge}
            </span>
          )}
        </Link>
      ))}
      <div className="ml-2">
        <UserMenu name={userName} email={userEmail} />
      </div>
    </div>
  );
};

export default NavbarLinks;
