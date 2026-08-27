import { Router, Request, Response } from "express";
import { evaluateCodeChallenge } from "../services/gemini.service";
import { aiRateLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

// Apply AI rate limiting
router.use(aiRateLimiter);

// POST /code/feedback (or /api/code/feedback)
router.post("/feedback", async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code,
      problemTitle,
      problemDescription,
      testResults,
      passedCount,
      totalCount,
      isDesignPattern,
    } = req.body;

    if (!code || !problemTitle) {
      res.status(400).json({
        success: false,
        message: "code y problemTitle son requeridos para la evaluación.",
      });
      return;
    }

    const feedback = await evaluateCodeChallenge({
      code,
      problemTitle,
      problemDescription: problemDescription || "",
      passedCount: Number(passedCount) || 0,
      totalCount: Number(totalCount) || 0,
      isDesignPattern: Boolean(isDesignPattern),
    });

    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error: any) {
    console.error("[CodeRoutes] Error en /code/feedback:", error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || "Error al evaluar la solución de código.",
    });
  }
});

export default router;
