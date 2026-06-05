import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes";
import interviewsRoutes from "./routes/interviews.routes";
import feedbackRoutes from "./routes/feedback.routes";
import vapiRoutes from "./routes/vapi.routes";
import cvRoutes from "./routes/cv.routes";

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ───────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Rutas ──────────────────────────────────────────────────────────────────────
app.use("/auth", authRoutes);
app.use("/interviews", interviewsRoutes);
app.use("/feedback", feedbackRoutes);
app.use("/api/vapi", vapiRoutes);
app.use("/api/cv", cvRoutes);

// ── Manejo de rutas no encontradas ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Ruta no encontrada" });
});

// ── Manejo global de errores ───────────────────────────────────────────────────
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Error no manejado:", err);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
);

// ── Iniciar servidor ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Backend DevCareer corriendo en http://localhost:${PORT}`);
  console.log(`   Entorno: ${process.env.NODE_ENV || "development"}`);
});

export default app;
