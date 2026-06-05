"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const feedback_service_1 = require("../services/feedback.service");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.requireAuth);
// POST /feedback
router.post("/", async (req, res) => {
    const { interviewId, transcript } = req.body;
    if (!interviewId || !transcript) {
        res.status(400).json({ success: false, message: "interviewId y transcript son requeridos" });
        return;
    }
    try {
        const formattedTranscript = transcript
            .map((s) => `- ${s.role}: ${s.content}\n`)
            .join("");
        const prompt = `Eres un entrevistador de IA que analiza una entrevista simulada. Evalúa al candidato basándote en categorías estructuradas. Sé minucioso. Si hay errores o áreas de mejora, señálalos.
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
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        console.log(`🔑 GOOGLE_GENERATIVE_AI_API_KEY (feedback) - Longitud: ${apiKey?.length || 0}, Empieza con: ${apiKey ? apiKey.substring(0, 7) : "N/A"}`);
        console.log("Enviando petición a Gemini (feedback)...");
        const geminiRes = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.4 },
            }),
        });
        if (!geminiRes.ok) {
            const errBody = await geminiRes.text().catch(() => "");
            console.error(`❌ Error de la API de Gemini (Status ${geminiRes.status}):`, errBody);
            throw new Error(`Gemini API error: ${geminiRes.status} - ${errBody}`);
        }
        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates[0].content.parts[0].text;
        // Limpiar posibles backticks de markdown
        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanText);
        const { totalScore, categoryScores, strengths, areasForImprovement, finalAssessment } = parsed;
        const feedbackId = await (0, feedback_service_1.createFeedbackRecord)({
            interviewId,
            userId: req.userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt: new Date().toISOString(),
        });
        res.status(201).json({ success: true, feedbackId });
    }
    catch (error) {
        console.error("Error generando feedback:", error?.message || error);
        res.status(500).json({ success: false, message: "Error al generar el feedback" });
    }
});
// GET /feedback/:interviewId
router.get("/:interviewId", async (req, res) => {
    try {
        const feedback = await (0, feedback_service_1.getFeedbackByInterviewId)(req.params.interviewId, req.userId);
        if (!feedback) {
            res.status(404).json({ success: false, message: "Feedback no encontrado" });
            return;
        }
        res.status(200).json({ success: true, feedback });
    }
    catch (error) {
        console.error("Error obteniendo feedback:", error);
        res.status(500).json({ success: false, message: "Error al obtener el feedback" });
    }
});
exports.default = router;
//# sourceMappingURL=feedback.routes.js.map