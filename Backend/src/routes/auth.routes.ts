import { Router, Request, Response } from "express";
import { cognitoIdVerifier } from "../config/cognito";
import { getUserById, createUser } from "../services/users.service";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/signup
// Se llama DESPUÉS de que Cognito confirme el email del usuario.
// Crea el registro del usuario en DynamoDB con su sub (UUID) de Cognito.
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
// Recibe el ID Token de Cognito y lo valida.
// Retorna sessionCookie = el mismo ID Token (el frontend lo guarda en cookie httpOnly).
// ──────────────────────────────────────────────────────────────────────────────
router.post("/signin", async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ success: false, message: "idToken requerido" });
    return;
  }

  try {
    // Verificar que el token sea válido (firmado por nuestro Cognito User Pool)
    const payload = await cognitoIdVerifier.verify(idToken);

    // Auto-crear usuario en DynamoDB si no existe
    const uid   = payload.sub;
    const email = payload.email as string;
    const name  = (payload.name as string) || email.split("@")[0];

    const existing = await getUserById(uid);
    if (!existing) {
      await createUser({ id: uid, name, email });
      console.log(`👤 Usuario ${email} auto-creado en DynamoDB (/signin)`);
    }

    // Retornar el mismo ID Token como "sessionCookie" 
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
// Retorna el usuario actual a partir del Bearer token (ID Token de Cognito)
// ──────────────────────────────────────────────────────────────────────────────
router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let user = await getUserById(req.userId!);

    if (!user) {
      // Auto-crear usuario en DynamoDB si no existe
      user = {
        id:    req.userId!,
        name:  req.userName || req.userEmail?.split("@")[0] || "Usuario",
        email: req.userEmail || "",
      };
      await createUser(user);
      console.log(`👤 Usuario ${user.email} auto-creado en DynamoDB (/me)`);
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error en /auth/me:", error);
    res.status(500).json({ success: false, message: "Error al obtener el usuario" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /auth/verify-session
// Verifica el ID Token de Cognito guardado como sessionCookie y retorna el usuario.
// ──────────────────────────────────────────────────────────────────────────────
router.post("/verify-session", async (req: Request, res: Response): Promise<void> => {
  const { sessionCookie } = req.body;

  if (!sessionCookie) {
    res.status(400).json({ success: false, message: "sessionCookie requerido" });
    return;
  }

  try {
    const payload = await cognitoIdVerifier.verify(sessionCookie);

    const uid   = payload.sub;
    const email = payload.email as string;
    const name  = (payload.name as string) || email.split("@")[0];

    let user = await getUserById(uid);

    if (!user) {
      user = { id: uid, name, email };
      await createUser(user);
      console.log(`👤 Usuario ${email} auto-creado en DynamoDB (/verify-session)`);
    }

    res.status(200).json({ success: true, user });
  } catch {
    res.status(401).json({ success: false, message: "Sesión inválida o expirada" });
  }
});

export default router;
