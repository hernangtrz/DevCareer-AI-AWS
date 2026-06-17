import { Router, Request, Response } from "express";
import { cognitoIdVerifier } from "../config/cognito";
import { supabase } from "../config/supabase";
import { getUserById, createUser } from "../services/users.service";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/signup
// Se llama DESPUÉS de que Cognito/Supabase confirme el email del usuario.
// Crea el registro del usuario en la base de datos con su sub/uuid.
// ──────────────────────────────────────────────────────────────────────────────
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { uid, name, email } = req.body;

  if (!uid || !name || !email) {
    res.status(400).json({ success: false, message: "Faltan campos: uid, name, email" });
    return;
  }

  try {
    const existing = await getUserById(uid);

    if (existing) {
      res.status(409).json({
        success: false,
        message: "El usuario ya existe. Por favor inicia sesión.",
      });
      return;
    }

    await createUser({ id: uid, name, email });

    res.status(201).json({
      success: true,
      message: "Cuenta registrada con éxito.",
    });
  } catch (error: any) {
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
// Recibe el token (ID Token de Cognito o Access Token de Supabase) y lo valida.
// Retorna sessionCookie = el mismo Token (el frontend lo guarda en cookie httpOnly).
// ──────────────────────────────────────────────────────────────────────────────
router.post("/signin", async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ success: false, message: "idToken requerido" });
    return;
  }

  try {
    let uid: string;
    let email: string;
    let name: string;

    if (process.env.SUPABASE_URL) {
      const { data: { user }, error } = await supabase.auth.getUser(idToken);
      if (error || !user) {
        throw new Error(error?.message || "Token de Supabase inválido");
      }
      uid = user.id;
      email = user.email!;
      name = user.user_metadata?.name || user.user_metadata?.full_name || email.split("@")[0];
    } else {
      if (!cognitoIdVerifier) {
        throw new Error("AWS Cognito no está configurado (faltan variables de entorno).");
      }
      // Verificar que el token sea válido (firmado por nuestro Cognito User Pool)
      const payload = await cognitoIdVerifier.verify(idToken);
      uid   = payload.sub;
      email = payload.email as string;
      name  = (payload.name as string) || email.split("@")[0];
    }

    // Auto-crear usuario en DB si no existe
    const existing = await getUserById(uid);
    if (!existing) {
      await createUser({ id: uid, name, email });
      console.log(`👤 Usuario ${email} auto-creado en la base de datos (/signin)`);
    }

    // Retornar el mismo Token como "sessionCookie" 
    // (el cliente lo guarda como cookie httpOnly via /api/auth/session)
    res.status(200).json({
      success: true,
      sessionCookie: idToken,
      message: "Sesión iniciada correctamente.",
    });
  } catch (error) {
    console.error("Error en /auth/signin:", error);
    res.status(401).json({ success: false, message: "Token inválido. Error al iniciar sesión." });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /auth/me
// Retorna el usuario actual a partir del Bearer token (ID Token de Cognito o Access Token de Supabase)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let user = await getUserById(req.userId!);

    if (!user) {
      // Auto-crear usuario si no existe
      user = {
        id:    req.userId!,
        name:  req.userName || req.userEmail?.split("@")[0] || "Usuario",
        email: req.userEmail || "",
      };
      await createUser(user);
      console.log(`👤 Usuario ${user.email} auto-creado en la base de datos (/me)`);
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error en /auth/me:", error);
    res.status(500).json({ success: false, message: "Error al obtener el usuario" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/verify-session
// Verifica el token guardado como sessionCookie y retorna el usuario.
// ──────────────────────────────────────────────────────────────────────────────
router.post("/verify-session", async (req: Request, res: Response): Promise<void> => {
  const { sessionCookie } = req.body;

  if (!sessionCookie) {
    res.status(400).json({ success: false, message: "sessionCookie requerido" });
    return;
  }

  try {
    let uid: string;
    let email: string;
    let name: string;

    if (process.env.SUPABASE_URL) {
      const { data: { user }, error } = await supabase.auth.getUser(sessionCookie);
      if (error || !user) {
        throw new Error(error?.message || "Token de Supabase inválido");
      }
      uid = user.id;
      email = user.email!;
      name = user.user_metadata?.name || user.user_metadata?.full_name || email.split("@")[0];
    } else {
      if (!cognitoIdVerifier) {
        throw new Error("AWS Cognito no está configurado (faltan variables de entorno).");
      }
      const payload = await cognitoIdVerifier.verify(sessionCookie);
      uid   = payload.sub;
      email = payload.email as string;
      name  = (payload.name as string) || email.split("@")[0];
    }

    let user = await getUserById(uid);

    if (!user) {
      user = { id: uid, name, email };
      await createUser(user);
      console.log(`👤 Usuario ${email} auto-creado en la base de datos (/verify-session)`);
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error en /auth/verify-session:", error);
    res.status(401).json({ success: false, message: "Sesión inválida o expirada" });
  }
});

export default router;

