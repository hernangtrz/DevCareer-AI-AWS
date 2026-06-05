"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cognito_1 = require("../config/cognito");
const users_service_1 = require("../services/users.service");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/signup
// Se llama DESPUÉS de que Cognito confirme el email del usuario.
// Crea el registro del usuario en DynamoDB con su sub (UUID) de Cognito.
// ──────────────────────────────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
    const { uid, name, email } = req.body;
    if (!uid || !name || !email) {
        res.status(400).json({ success: false, message: "Faltan campos: uid, name, email" });
        return;
    }
    try {
        const existing = await (0, users_service_1.getUserById)(uid);
        if (existing) {
            res.status(409).json({
                success: false,
                message: "El usuario ya existe. Por favor inicia sesión.",
            });
            return;
        }
        await (0, users_service_1.createUser)({ id: uid, name, email });
        res.status(201).json({
            success: true,
            message: "Cuenta registrada con éxito.",
        });
    }
    catch (error) {
        console.error("Error en /auth/signup:", error);
        if (error.name === "ConditionalCheckFailedException") {
            res.status(409).json({
                success: false,
                message: "El usuario ya existe. Por favor inicia sesión.",
            });
            return;
        }
        res.status(500).json({ success: false, message: "Error al crear la cuenta" });
    }
});
// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/signin
// Recibe el ID Token de Cognito y lo valida.
// Retorna sessionCookie = el mismo ID Token (el frontend lo guarda en cookie httpOnly).
// ──────────────────────────────────────────────────────────────────────────────
router.post("/signin", async (req, res) => {
    const { idToken } = req.body;
    if (!idToken) {
        res.status(400).json({ success: false, message: "idToken requerido" });
        return;
    }
    try {
        // Verificar que el token sea válido (firmado por nuestro Cognito User Pool)
        const payload = await cognito_1.cognitoIdVerifier.verify(idToken);
        // Auto-crear usuario en DynamoDB si no existe
        const uid = payload.sub;
        const email = payload.email;
        const name = payload.name || email.split("@")[0];
        const existing = await (0, users_service_1.getUserById)(uid);
        if (!existing) {
            await (0, users_service_1.createUser)({ id: uid, name, email });
            console.log(`👤 Usuario ${email} auto-creado en DynamoDB (/signin)`);
        }
        // Retornar el mismo ID Token como "sessionCookie" 
        // (el cliente lo guarda como cookie httpOnly via /api/auth/session)
        res.status(200).json({
            success: true,
            sessionCookie: idToken,
            message: "Sesión iniciada correctamente.",
        });
    }
    catch (error) {
        console.error("Error en /auth/signin:", error);
        res.status(401).json({ success: false, message: "Token inválido. Error al iniciar sesión." });
    }
});
// ──────────────────────────────────────────────────────────────────────────────
// GET /auth/me
// Retorna el usuario actual a partir del Bearer token (ID Token de Cognito)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/me", auth_middleware_1.requireAuth, async (req, res) => {
    try {
        let user = await (0, users_service_1.getUserById)(req.userId);
        if (!user) {
            // Auto-crear usuario en DynamoDB si no existe
            user = {
                id: req.userId,
                name: req.userName || req.userEmail?.split("@")[0] || "Usuario",
                email: req.userEmail || "",
            };
            await (0, users_service_1.createUser)(user);
            console.log(`👤 Usuario ${user.email} auto-creado en DynamoDB (/me)`);
        }
        res.status(200).json({ success: true, user });
    }
    catch (error) {
        console.error("Error en /auth/me:", error);
        res.status(500).json({ success: false, message: "Error al obtener el usuario" });
    }
});
// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/verify-session
// Verifica el ID Token de Cognito guardado como sessionCookie y retorna el usuario.
// ──────────────────────────────────────────────────────────────────────────────
router.post("/verify-session", async (req, res) => {
    const { sessionCookie } = req.body;
    if (!sessionCookie) {
        res.status(400).json({ success: false, message: "sessionCookie requerido" });
        return;
    }
    try {
        const payload = await cognito_1.cognitoIdVerifier.verify(sessionCookie);
        const uid = payload.sub;
        const email = payload.email;
        const name = payload.name || email.split("@")[0];
        let user = await (0, users_service_1.getUserById)(uid);
        if (!user) {
            user = { id: uid, name, email };
            await (0, users_service_1.createUser)(user);
            console.log(`👤 Usuario ${email} auto-creado en DynamoDB (/verify-session)`);
        }
        res.status(200).json({ success: true, user });
    }
    catch {
        res.status(401).json({ success: false, message: "Sesión inválida o expirada" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map