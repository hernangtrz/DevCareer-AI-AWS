"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const cognito_1 = require("../config/cognito");
async function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ success: false, message: "Token no proporcionado" });
        return;
    }
    const token = authHeader.split("Bearer ")[1];
    try {
        // Verificar el ID Token firmado por Cognito
        const payload = await cognito_1.cognitoIdVerifier.verify(token);
        req.userId = payload.sub; // UUID único de Cognito
        req.userEmail = payload.email;
        req.userName = payload.name;
        next();
    }
    catch {
        res.status(401).json({ success: false, message: "Token inválido o expirado" });
    }
}
//# sourceMappingURL=auth.middleware.js.map