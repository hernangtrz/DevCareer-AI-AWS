import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { createFeedbackRecord, getFeedbackByInterviewId } from "../services/feedback.service";
import {
  generateInterviewFeedback,
  generateEnglishProficiencyFeedback,
} from "../services/gemini.service";
import { aiRateLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

router.use(requireAuth);

// ──────────────────────────────────────────────────────────────────────────────
// POST /feedback - Generar y persistir feedback de entrevista
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  "/",
  aiRateLimiter,
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { interviewId, transcript, language } = req.body;
    const isEnglish = language === "en";

    if (!interviewId || !transcript) {
      res.status(400).json({ success: false, message: "interviewId y transcript son requeridos" });
      return;
    }

    try {
      const formattedTranscript = (transcript as { role: string; content: string }[])
        .map((s) => `- ${s.role}: ${s.content}\n`)
        .join("");

      // ── Llamadas a Gemini (paralelas si es en inglés) ────────────────────────
      const feedbackPromise = generateInterviewFeedback(formattedTranscript, isEnglish);
      const englishPromise = isEnglish
        ? generateEnglishProficiencyFeedback(formattedTranscript)
        : Promise.resolve(null);

      const [feedbackData, englishData] = await Promise.all([
        feedbackPromise,
        englishPromise,
      ]);

      // ── Guardar feedback en base de datos ────────────────────────────────────
      const feedbackPayload = {
        interviewId,
        userId: req.userId!,
        totalScore: feedbackData.totalScore,
        categoryScores: feedbackData.categoryScores,
        strengths: feedbackData.strengths,
        areasForImprovement: feedbackData.areasForImprovement,
        finalAssessment: feedbackData.finalAssessment,
        englishFeedback: englishData || undefined,
        createdAt: new Date().toISOString(),
      };

      const recordId = await createFeedbackRecord(feedbackPayload);

      res.status(201).json({
        success: true,
        feedback: { id: recordId, ...feedbackPayload },
      });
    } catch (error: any) {
      console.error("[FeedbackRoutes] Error generando feedback:", error);
      res.status(500).json({
        success: false,
        message: error?.message || "Error al procesar el feedback con la IA",
      });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// GET /feedback/:interviewId - Obtener feedback guardado
// ──────────────────────────────────────────────────────────────────────────────
router.get("/:interviewId", async (req: AuthRequest, res: Response): Promise<void> => {
  const { interviewId } = req.params;

  try {
    const feedback = await getFeedbackByInterviewId(interviewId, req.userId!);

    if (!feedback) {
      res.status(404).json({ success: false, message: "Feedback no encontrado" });
      return;
    }

    res.status(200).json({ success: true, feedback });
  } catch (error: any) {
    console.error("[FeedbackRoutes] Error obteniendo feedback:", error);
    res.status(500).json({ success: false, message: "Error al obtener el feedback" });
  }
});

export default router;