import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { cognitoIdVerifier } from "../config/cognito";

export interface AuthRequest extends Request<ParamsDictionary, any, any, ParsedQs> {
  userId?: string;
  userEmail?: string;
  userName?: string;
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
    // Verificar el ID Token firmado por Cognito
    const payload = await cognitoIdVerifier.verify(token);

    req.userId    = payload.sub;            // UUID único de Cognito
    req.userEmail = payload.email as string;
    req.userName  = payload.name  as string;
    next();
  } catch {
    res.status(401).json({ success: false, message: "Token inválido o expirado" });
  }
}
