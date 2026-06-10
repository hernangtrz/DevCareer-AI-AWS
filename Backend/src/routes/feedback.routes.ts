import { Router, Response } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";
import { createFeedbackRecord, getFeedbackByInterviewId } from "../services/feedback.service";

const router = Router();

router.use(requireAuth);

// POST /feedback
router.post("/", async (req: AuthRequest, res: Response): Promise<void> => {
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

    // ── Prompt principal de evaluación de entrevista ──────────────────────────
    const interviewPrompt = isEnglish
      ? `You are an AI interviewer analyzing a simulated job interview conducted in English. Evaluate the candidate based on structured categories. Be thorough. If there are errors or areas for improvement, point them out.
Transcript:
${formattedTranscript}

Rate the candidate from 0 to 100 in these areas and respond ONLY with a valid JSON with this exact structure, no additional text:
{
  "totalScore": number,
  "categoryScores": [
    { "name": string, "score": number, "comment": string }
  ],
  "strengths": [string],
  "areasForImprovement": [string],
  "finalAssessment": string
}

The 5 categories are:
- Communication Skills
- Technical Knowledge
- Problem Solving
- Cultural and Role Fit
- Confidence and Clarity`
      : `Eres un entrevistador de IA que analiza una entrevista simulada. Evalúa al candidato basándote en categorías estructuradas. Sé minucioso. Si hay errores o áreas de mejora, señálalos.
Transcripción:
${formattedTranscript}

Califica al candidato de 0 a 100 en estas áreas y responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional:
{
  "totalScore": number,
  "categoryScores": [
    { "name": string, "score": number, "comment": string }
  ],
  "strengths": [string],
  "areasForImprovement": [string],
  "finalAssessment": string
}

Las 5 categorías son:
- Habilidades de Comunicación
- Conocimiento Técnico
- Resolución de Problemas
- Ajuste Cultural y al Puesto
- Confianza y Claridad`;

    // ── Prompt de evaluación de inglés (solo cuando language === "en") ─────────
    const englishPrompt = `You are an expert English language coach and CEFR evaluator. Analyze the English language quality of the CANDIDATE's messages ONLY in the following interview transcript. Focus exclusively on grammar, vocabulary, fluency and natural English expression.

Transcript (analyze only "user" role messages):
${formattedTranscript}

Respond ONLY with a valid JSON object, no markdown, no backticks:
{
  "overallLevel": "<CEFR level: A1, A2, B1, B2, C1, or C2>",
  "grammarScore": <0-100>,
  "vocabularyScore": <0-100>,
  "fluencyScore": <0-100>,
  "grammarErrors": ["<specific grammar error example 1 from transcript>", "<error 2>"],
  "vocabularySuggestions": ["<word/phrase used + better alternative, e.g.: 'I have many knowledge' → 'I have extensive knowledge'>" ],
  "overallComment": "<2-3 sentence overall assessment of the candidate's English level and main areas for improvement>"
}

Rules:
- grammarErrors: list up to 5 real examples directly quoted from the transcript. If the English is excellent, return an empty array.
- vocabularySuggestions: list up to 5 specific improvements. If vocabulary is advanced, return an empty array.
- Be honest and constructive. This feedback will help the candidate improve.`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    console.log(`🔑 GOOGLE_GENERATIVE_AI_API_KEY (feedback) - Longitud: ${apiKey?.length || 0}, Empieza con: ${apiKey ? apiKey.substring(0, 7) : "N/A"}`);
    console.log("Enviando petición a Gemini (feedback)...");

    // ── Llamadas a Gemini (paralelas si es en inglés) ──────────────────────────
    const callGemini = async (prompt: string) => {
      const r = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 },
        }),
      });
      if (!r.ok) {
        const errBody = await r.text().catch(() => "");
        throw new Error(`Gemini API error: ${r.status} - ${errBody}`);
      }
      const data = await r.json() as any;
      const rawText: string = data.candidates[0].content.parts[0].text;
      return JSON.parse(rawText.replace(/```json|```/g, "").trim());
    };

    let parsed: any;
    let englishFeedback: any;

    if (isEnglish) {
      // Ejecutar ambas llamadas en paralelo
      const [interviewResult, englishResult] = await Promise.all([
        callGemini(interviewPrompt),
        callGemini(englishPrompt),
      ]);
      parsed = interviewResult;
      englishFeedback = englishResult;
    } else {
      parsed = await callGemini(interviewPrompt);
    }

    const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = parsed;

    const feedbackId = await createFeedbackRecord({
      interviewId,
      userId: req.userId!,
      totalScore,
      categoryScores,
      strengths,
      areasForImprovement,
      finalAssessment,
      ...(englishFeedback && { englishFeedback }),
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, feedbackId });
  } catch (error: any) {
    console.error("Error generando feedback:", error?.message || error);
    res.status(500).json({ success: false, message: "Error al generar el feedback" });
  }
});

// GET /feedback/:interviewId
router.get("/:interviewId", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const feedback = await getFeedbackByInterviewId(
      req.params.interviewId,
      req.userId!
    );

    if (!feedback) {
      res.status(404).json({ success: false, message: "Feedback no encontrado" });
      return;
    }

    res.status(200).json({ success: true, feedback });
  } catch (error) {
    console.error("Error obteniendo feedback:", error);
    res.status(500).json({ success: false, message: "Error al obtener el feedback" });
  }
});

export default router;