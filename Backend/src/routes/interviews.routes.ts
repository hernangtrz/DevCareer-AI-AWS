import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import {
  getInterviewsByUserId,
  getLatestInterviews,
  getInterviewById,
  createInterview,
} from "../services/interviews.service";
import { interviewTemplates, getRandomInterviewCover } from "../config/constants";

const router = Router();

// Todas las rutas requieren autenticación
router.use(requireAuth);

// GET /interviews/mine
// Entrevistas del usuario autenticado
router.get("/mine", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interviews = await getInterviewsByUserId(req.userId!);
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    console.error("Error obteniendo entrevistas del usuario:", error);
    res.status(500).json({ success: false, message: "Error al obtener entrevistas" });
  }
});

// GET /interviews/latest?limit=20
// Entrevistas finalizadas de otros usuarios (para el dashboard)
router.get("/latest", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const interviews = await getLatestInterviews(req.userId!, limit);
    res.status(200).json({ success: true, interviews });
  } catch (error) {
    console.error("Error obteniendo últimas entrevistas:", error);
    res.status(500).json({ success: false, message: "Error al obtener entrevistas" });
  }
});

// GET /interviews/:id
// Entrevista por ID
router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const interview = await getInterviewById(req.params.id);

    if (!interview) {
      res.status(404).json({ success: false, message: "Entrevista no encontrada" });
      return;
    }

    res.status(200).json({ success: true, interview });
  } catch (error) {
    console.error("Error obteniendo entrevista:", error);
    res.status(500).json({ success: false, message: "Error al obtener la entrevista" });
  }
});

// POST /interviews/from-template
// Crea una entrevista a partir de una plantilla predefinida
router.post("/from-template", async (req: AuthRequest, res: Response): Promise<void> => {
  const { templateId } = req.body;

  if (!templateId) {
    res.status(400).json({ success: false, message: "templateId requerido" });
    return;
  }

  try {
    const template = interviewTemplates.find((t) => t.id === templateId);

    if (!template) {
      res.status(404).json({ success: false, message: "Plantilla no encontrada" });
      return;
    }

    const interviewId = await createInterview({
      role: template.role,
      level: template.level,
      type: template.type,
      techstack: template.techstack,
      questions: template.questions,
      userId: req.userId!,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, interviewId });
  } catch (error) {
    console.error("Error creando entrevista desde plantilla:", error);
    res.status(500).json({ success: false, message: "Error al crear la entrevista" });
  }
});

export default router;
