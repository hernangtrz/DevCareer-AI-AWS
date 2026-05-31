import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/api.server";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  try {
    const isUserAuthenticated = await isAuthenticated();
    if (isUserAuthenticated) redirect("/dashboard");
  } catch {
    // Si falla la verificación, mostrar el login de todas formas
  }

  return <div className="auth-layout">{children}</div>;
};

export default AuthLayout;