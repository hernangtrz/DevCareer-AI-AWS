"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const interviews_service_1 = require("../services/interviews.service");
const constants_1 = require("../config/constants");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.requireAuth);
// GET /interviews/mine
// Entrevistas del usuario autenticado
router.get("/mine", async (req, res) => {
    try {
        const interviews = await (0, interviews_service_1.getInterviewsByUserId)(req.userId);
        res.status(200).json({ success: true, interviews });
    }
    catch (error) {
        console.error("Error obteniendo entrevistas del usuario:", error);
        res.status(500).json({ success: false, message: "Error al obtener entrevistas" });
    }
});
// GET /interviews/latest?limit=20
// Entrevistas finalizadas de otros usuarios (para el dashboard)
router.get("/latest", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const interviews = await (0, interviews_service_1.getLatestInterviews)(req.userId, limit);
        res.status(200).json({ success: true, interviews });
    }
    catch (error) {
        console.error("Error obteniendo últimas entrevistas:", error);
        res.status(500).json({ success: false, message: "Error al obtener entrevistas" });
    }
});
// GET /interviews/:id
// Entrevista por ID
router.get("/:id", async (req, res) => {
    try {
        const interview = await (0, interviews_service_1.getInterviewById)(req.params.id);
        if (!interview) {
            res.status(404).json({ success: false, message: "Entrevista no encontrada" });
            return;
        }
        res.status(200).json({ success: true, interview });
    }
    catch (error) {
        console.error("Error obteniendo entrevista:", error);
        res.status(500).json({ success: false, message: "Error al obtener la entrevista" });
    }
});
// POST /interviews/from-template
// Crea una entrevista a partir de una plantilla predefinida
router.post("/from-template", async (req, res) => {
    const { templateId } = req.body;
    if (!templateId) {
        res.status(400).json({ success: false, message: "templateId requerido" });
        return;
    }
    try {
        const template = constants_1.interviewTemplates.find((t) => t.id === templateId);
        if (!template) {
            res.status(404).json({ success: false, message: "Plantilla no encontrada" });
            return;
        }
        const interviewId = await (0, interviews_service_1.createInterview)({
            role: template.role,
            level: template.level,
            type: template.type,
            techstack: template.techstack,
            questions: template.questions,
            userId: req.userId,
            finalized: true,
            coverImage: (0, constants_1.getRandomInterviewCover)(),
            createdAt: new Date().toISOString(),
        });
        res.status(201).json({ success: true, interviewId });
    }
    catch (error) {
        console.error("Error creando entrevista desde plantilla:", error);
        res.status(500).json({ success: false, message: "Error al crear la entrevista" });
    }
});
exports.default = router;
//# sourceMappingURL=interviews.routes.js.map