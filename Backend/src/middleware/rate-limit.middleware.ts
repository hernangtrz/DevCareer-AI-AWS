import rateLimit from "express-rate-limit";

// ── General API Rate Limiter (100 req / 15 min) ──────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiadas solicitudes desde esta IP. Por favor intenta de nuevo en 15 minutos.",
  },
});

// ── Strict AI Operations Rate Limiter (20 req / 1 min) ────────────────────────
// Protege cuotas de Google Gemini, Groq, Cartesia y Deepgram
export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Límite de solicitudes de IA excedido temporalmente. Espera un minuto antes de reintentar.",
  },
});

// ── Auth Operations Rate Limiter (10 req / 1 min) ─────────────────────────────
export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Demasiados intentos de autenticación. Por favor espera un momento.",
  },
});
