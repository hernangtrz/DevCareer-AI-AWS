import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/api.server";
import NavbarLinks from "@/components/NavbarLinks";

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
      <nav className="flex items-center justify-between no-print">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <Image src="/logo.svg" alt="Logo de DevCareer AI" width={38} height={38} />
          <h2 className="text-primary-100 text-xl font-bold">DevCareer AI</h2>
        </Link>
        <NavbarLinks userName={user?.name ?? "Usuario"} userEmail={user?.email} />
      </nav>
      {children}
    </div>
  );
};

export default Layout;