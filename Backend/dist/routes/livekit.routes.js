"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const livekit_server_sdk_1 = require("livekit-server-sdk");
const constants_1 = require("../config/constants");
const interviews_service_1 = require("../services/interviews.service");
const router = (0, express_1.Router)();
// GET /api/livekit/token - Genera un token de acceso para LiveKit Room
router.get("/token", async (req, res) => {
    try {
        const room = req.query.room || "devcareer-livekit-room";
        const identity = req.query.identity || `user_${Math.random().toString(36).substring(2, 7)}`;
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL;
        if (!apiKey || !apiSecret) {
            console.error("Error: LIVEKIT_API_KEY or LIVEKIT_API_SECRET is missing");
            res.status(500).json({ error: "Configuración de LiveKit incompleta en el servidor" });
            return;
        }
        // Crear el token de acceso
        const at = new livekit_server_sdk_1.AccessToken(apiKey, apiSecret, {
            identity: identity,
            ttl: "15m", // Tiempo de vida del token
        });
        // Añadir permisos para unirse a la sala
        at.addGrant({
            roomJoin: true,
            room: room,
            canPublish: true,
            canSubscribe: true,
        });
        const token = await at.toJwt();
        console.log(`[LiveKit Routes] Generado token para sala "${room}" e identidad "${identity}"`);
        res.json({
            token,
            url: livekitUrl,
        });
    }
    catch (error) {
        console.error("Error al generar token de LiveKit:", error);
        res.status(500).json({ error: "Error interno del servidor al generar el token" });
    }
});
// GET /api/livekit/interview-details - Obtiene los detalles de una entrevista por id (usado por el agente de voz)
router.get("/interview-details", async (req, res) => {
    const { interviewId } = req.query;
    if (!interviewId || typeof interviewId !== "string") {
        res.status(400).json({ success: false, message: "interviewId es requerido" });
        return;
    }
    try {
        const interview = await (0, interviews_service_1.getInterviewById)(interviewId);
        if (!interview) {
            res.status(404).json({ success: false, message: "Entrevista no encontrada" });
            return;
        }
        res.status(200).json({ success: true, interview });
    }
    catch (error) {
        console.error("Error al buscar entrevista:", error?.message || error);
        res.status(500).json({ success: false, message: error.message });
    }
});
// POST /api/livekit/generate - Webhook/Endpoint para generar preguntas de entrevista desde el agente LiveKit
router.post("/generate", async (req, res) => {
    const body = req.body;
    console.log("Body recibido de Agente LiveKit:", JSON.stringify(body));
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
        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const questions = JSON.parse(cleanText);
        const interviewId = await (0, interviews_service_1.createInterview)({
            role,
            type,
            level,
            techstack: typeof techstack === "string" ? techstack.split(",") : (Array.isArray(techstack) ? techstack : []),
            questions,
            userId: finalUserId,
            finalized: true,
            coverImage: (0, constants_1.getRandomInterviewCover)(),
            createdAt: new Date().toISOString(),
        });
        res.status(200).json({ success: true, interviewId });
    }
    catch (error) {
        console.error("Error en generación LiveKit:", error?.message || error);
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=livekit.routes.js.map