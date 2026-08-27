import rateLimit from "express-rate-limit";
import { Request } from "express";

/**
 * Helper para detectar si la petición proviene del mismo servidor/localhost
 * (ej: llamadas internas Server-to-Server de Next.js SSR).
 */
function isInternalOrDev(req: Request): boolean {
  if (process.env.NODE_ENV !== "production") return true;

  const ip = req.ip || req.socket.remoteAddress || "";
  return (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1" ||
    ip.startsWith("10.") ||
    ip.startsWith("172.") ||
    ip.startsWith("192.168.")
  );
}

// ── General API Rate Limiter (Protección DDoS en producción) ─────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Holgado para no bloquear navegación
  standardHeaders: true,
  legacyHeaders: false,
  skip: isInternalOrDev,
  message: {
    success: false,
    message: "Demasiadas solicitudes. Por favor intenta de nuevo en unos minutos.",
  },
});

// ── Strict AI Operations Rate Limiter (Protege cuotas de Gemini/Groq) ─────────
// Solo limita llamadas repetitivas de IA por cliente
export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // Permite pruebas fluidas y uso normal
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Límite de solicitudes de IA excedido temporalmente. Espera un minuto antes de reintentar.",
  },
});

// ── Auth Brute-Force Rate Limiter (Solo para Login y Register) ────────────────
export const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 30, // 30 intentos por 5 minutos
  standardHeaders: true,
  legacyHeaders: false,
  skip: isInternalOrDev,
  message: {
    success: false,
    message: "Demasiados intentos de inicio de sesión. Por favor espera un momento.",
  },
});
