import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { auth } from "../config/firebase";

export interface AuthRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
  userId?: string;
  userEmail?: string;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Token no proporcionado" });
    return;
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // 1. Intentar verificar como ID Token (enviado por Client Components)
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.userId = decodedToken.uid;
      req.userEmail = decodedToken.email;
      next();
      return;
    } catch (idTokenError) {
      // 2. Si falla, intentar verificar como Session Cookie (enviado por Server Components)
      const decodedClaims = await auth.verifySessionCookie(token, true);
      req.userId = decodedClaims.uid;
      req.userEmail = decodedClaims.email;
      next();
      return;
    }
  } catch (error) {
    res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
}
