"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOutCognito } from "@/lib/cognito";
import { LogOut, User, ChevronDown } from "lucide-react";

interface UserMenuProps {
  name: string;
  email?: string;
}

const UserMenu = ({ name, email }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  // Cierra el menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // 1. Borrar tokens de Cognito del localStorage
      signOutCognito();

      // 2. Borrar la cookie httpOnly de sesión del servidor
      await fetch("/api/auth/session", { method: "DELETE" });

      // 3. Redirigir al login
      router.push("/sign-in");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  // Iniciales del nombre para el avatar
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative" ref={menuRef}>
      {/* Botón del avatar */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-input bg-dark-200 hover:bg-dark-300 hover:border-primary-200/50 transition-all group"
        aria-label="Menú de usuario"
      >
        {/* Avatar con iniciales */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-200 to-indigo-500 flex items-center justify-center text-dark-100 text-xs font-bold shrink-0">
          {initials || <User className="h-4 w-4" />}
        </div>
        <span className="text-sm text-light-100 font-medium max-sm:hidden max-w-[120px] truncate">
          {name}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-light-400 transition-transform duration-200 max-sm:hidden ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-input bg-dark-100 shadow-2xl shadow-black/40 overflow-hidden z-50 animate-fadeIn">
          {/* Info del usuario */}
          <div className="px-4 py-3 border-b border-input/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-200 to-indigo-500 flex items-center justify-center text-dark-100 text-sm font-bold shrink-0">
              {initials || <User className="h-5 w-5" />}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-sm font-semibold text-primary-100 truncate">{name}</p>
              {email && (
                <p className="text-xs text-light-400 truncate">{email}</p>
              )}
            </div>
          </div>

          {/* Opciones */}
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-light-100 hover:bg-dark-200 hover:text-red-400 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-7 h-7 rounded-lg bg-dark-200 group-hover:bg-red-500/10 flex items-center justify-center transition-colors">
                <LogOut className="h-4 w-4 text-light-400 group-hover:text-red-400 transition-colors" />
              </div>
              <span className="font-medium">
                {loading ? "Cerrando sesión..." : "Cerrar sesión"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
