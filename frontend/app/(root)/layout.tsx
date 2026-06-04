import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Mic, FileText, Search } from "lucide-react";
import { isAuthenticated, getCurrentUser } from "@/lib/api.server";
import UserMenu from "@/components/UserMenu";

const navLinks = [
  { href: "/dashboard", label: "Entrevistas", icon: <Mic className="h-4 w-4" />, badge: null },
  { href: "/cv-creator", label: "Crear CV", icon: <FileText className="h-4 w-4" />, badge: "Nuevo" },
  { href: "/cv-analyzer", label: "Analizar CV", icon: <Search className="h-4 w-4" />, badge: "Nuevo" },
];

const Layout = async ({ children }: { children: ReactNode }) => {
  let user = null;
  try {
    const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) redirect("/sign-in");
    user = await getCurrentUser();
  } catch {
    // Si el backend no responde, redirigir al login por seguridad
    redirect("/sign-in");
  }

  return (
    <div className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Logo de DevCareer AI" width={38} height={38} />
          <h2 className="text-primary-100 text-xl font-bold">DevCareer AI</h2>
        </Link>
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
            <UserMenu name={user?.name ?? "Usuario"} email={user?.email} />
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
};

export default Layout;