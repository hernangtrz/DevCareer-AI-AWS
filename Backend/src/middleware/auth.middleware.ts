import { Request, Response, NextFunction } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { cognitoIdVerifier } from "../config/cognito";
import { supabase } from "../config/supabase";

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

  // 1. Intentar verificar con Supabase si está configurado
  if (process.env.SUPABASE_URL) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (user && !error) {
        req.userId    = user.id;
        req.userEmail = user.email;
        req.userName  = user.user_metadata?.name || user.user_metadata?.full_name || user.email?.split("@")[0];
        return next();
      }
    } catch (err) {
      console.log("Supabase token verification skipped or failed, trying Cognito...");
    }
  }

  // 2. Fallback a Cognito si está configurado
  if (cognitoIdVerifier) {
    try {
      const payload = await cognitoIdVerifier.verify(token);
      req.userId    = payload.sub;            // UUID único de Cognito
      req.userEmail = payload.email as string;
      req.userName  = payload.name  as string;
      return next();
    } catch {
      // Continuar al error de abajo
    }
  }

  res.status(401).json({ success: false, message: "Token inválido o expirado" });
}

