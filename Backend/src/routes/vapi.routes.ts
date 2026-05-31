import { Router, Request, Response } from "express";
import { getRandomInterviewCover } from "../config/constants";
import { createInterview } from "../services/interviews.service";

const router = Router();

// GET /api/vapi/generate - health check
router.get("/generate", (_req: Request, res: Response): void => {
  res.status(200).json({ success: true, data: "THANK YOU!" });
});

// POST /api/vapi/generate - webhook de Vapi
router.post("/generate", async (req: Request, res: Response): Promise<void> => {
  const body = req.body;
  console.log("Body recibido de Vapi:", JSON.stringify(body));

  const { type, role, level, techstack, amount, userid, userId } = body;
  const finalUserId = userid || userId || "user_unknown";

  try {
    const prompt = `Prepara preguntas para una entrevista de trabajo.
El rol es: ${role}.
El nivel de experiencia es: ${level}.
El stack tecnológico es: ${techstack}.
El enfoque es: ${type}.
La cantidad de preguntas requeridas es: ${amount}.
Devuelve ÚNICAMENTE un array JSON con las preguntas, sin texto adicional, sin backticks:
["Pregunta 1", "Pregunta 2", "Pregunta 3"]`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const geminiData = await geminiRes.json() as any;
    const rawText: string = geminiData.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const questions = JSON.parse(cleanText);

    await createInterview({
      role,
      type,
      level,
      techstack: typeof techstack === "string" ? techstack.split(",") : (Array.isArray(techstack) ? techstack : []),
      questions,
      userId: finalUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    });

    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Error en webhook Vapi:", error?.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;