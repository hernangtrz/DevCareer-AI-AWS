"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOutCognito } from "@/lib/cognito";
import { LogOut, User, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserMenuProps {
  name: string;
  email?: string;
  direction?: "up" | "down";
  variant?: "button" | "full-card";
}

const UserMenu = ({ name, email, direction = "down", variant = "button" }: UserMenuProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);
  const { language, setLanguage, t } = useLanguage();

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
      signOutCognito();
      await fetch("/api/auth/session", { method: "DELETE" });
      router.push("/sign-in");
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="relative w-full" ref={menuRef}>
      {variant === "full-card" ? (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center justify-between w-full p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 transition-all group text-left cursor-pointer select-none"
          aria-label="Menú de usuario"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md shadow-indigo-500/20">
              {initials || <User className="h-4 w-4" />}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-zinc-200 group-hover:text-white truncate">
                {name}
              </span>
              {email && <span className="text-[10px] text-zinc-500 truncate">{email}</span>}
            </div>
          </div>
          <ChevronDown
            className={`h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-transform duration-200 shrink-0 ml-1.5 ${
              open ? (direction === "up" ? "rotate-0" : "rotate-180") : direction === "up" ? "rotate-180" : ""
            }`}
          />
        </button>
      ) : (
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 transition-all group cursor-pointer"
          aria-label="Menú de usuario"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials || <User className="h-4 w-4" />}
          </div>
          <span className="text-xs text-zinc-300 font-medium max-sm:hidden max-w-[120px] truncate">
            {name}
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-zinc-500 transition-transform duration-200 max-sm:hidden ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      )}

      {/* Dropdown / Popover */}
      {open && (
        <div
          className={`absolute ${
            direction === "up" ? "bottom-full mb-2.5 left-0 right-0" : "top-full mt-2 right-0 w-64"
          } rounded-2xl border border-zinc-800 bg-zinc-950/95 shadow-2xl shadow-black/80 backdrop-blur-xl overflow-hidden z-50 animate-fadeIn`}
        >
          {/* Header Info */}
          <div className="px-4 py-3 border-b border-zinc-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials || <User className="h-4 w-4" />}
            </div>
            <div className="flex flex-col min-w-0">
              <p className="text-xs font-bold text-white truncate">{name}</p>
              {email && <p className="text-[10px] text-zinc-400 truncate">{email}</p>}
            </div>
          </div>

          {/* Options */}
          <div className="p-1.5 flex flex-col gap-1">
            {/* Language Switcher */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 bg-zinc-900/60 border border-zinc-850">
              <span className="font-medium flex items-center gap-1.5">
                🌐 {t("menu_language") || "Idioma"}
              </span>
              <div className="flex bg-zinc-950 rounded-lg p-0.5 border border-zinc-800">
                <button
                  onClick={() => setLanguage("es")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    language === "es"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ES
                </button>
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                    language === "en"
                      ? "bg-indigo-600 text-white"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:bg-red-500/10 hover:text-red-400 transition-all group disabled:opacity-50 disabled:cursor-not-allowed text-left cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-zinc-900 group-hover:bg-red-500/20 flex items-center justify-center transition-colors shrink-0">
                <LogOut className="h-3.5 w-3.5 text-zinc-400 group-hover:text-red-400 transition-colors" />
              </div>
              <span className="font-medium">
                {loading ? t("menu_signingout") || "Cerrando sesión..." : t("menu_signout") || "Cerrar sesión"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
