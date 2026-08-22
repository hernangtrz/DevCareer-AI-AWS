import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated, getCurrentUser } from "@/lib/api.server";
import AppSidebar from "@/components/AppSidebar";

const Layout = async ({ children }: { children: ReactNode }) => {
  let user = null;
  try {
    const isUserAuthenticated = await isAuthenticated();
    if (!isUserAuthenticated) redirect("/sign-in");
    user = await getCurrentUser();
  } catch {
    redirect("/sign-in");
  }

  return (
    <div className="flex min-h-screen bg-[#020408] text-white">
      {/* ── Left Modern Sidebar ── */}
      <AppSidebar userName={user?.name ?? "Usuario"} userEmail={user?.email} />

      {/* ── Main Content Area ── */}
      <div className="flex flex-col flex-1 min-w-0 md:pl-64">
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 md:px-10 py-6 md:py-10 max-md:pt-20">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;