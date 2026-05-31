import { Router, Request, Response } from "express";
import { auth } from "../config/firebase";
import { getUserById, createUser } from "../services/users.service";
import { requireAuth, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

// POST /auth/signup
// Registra el usuario en DynamoDB después de que Firebase Auth lo crea en el cliente
router.post("/signup", async (req: Request, res: Response): Promise<void> => {
  const { uid, name, email } = req.body;

  if (!uid || !name || !email) {
    res.status(400).json({ success: false, message: "Faltan campos requeridos: uid, name, email" });
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
      message: "Cuenta creada con éxito. Por favor inicia sesión.",
    });
  } catch (error: any) {
    console.error("Error en signup:", error);

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

// POST /auth/signin
// Verifica el idToken de Firebase y devuelve un session cookie (token de sesión)
router.post("/signin", async (req: Request, res: Response): Promise<void> => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400).json({ success: false, message: "idToken requerido" });
    return;
  }

  try {
    // Verificar el token y crear session cookie (válido 1 semana)
    const ONE_WEEK_MS = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ONE_WEEK_MS,
    });

    res.status(200).json({
      success: true,
      sessionCookie,
      message: "Sesión iniciada correctamente.",
    });
  } catch (error) {
    console.error("Error en signin:", error);
    res.status(401).json({ success: false, message: "Error al iniciar sesión." });
  }
});

// GET /auth/me
// Retorna el usuario actual a partir del Bearer token
router.get("/me", requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let user = await getUserById(req.userId!);

    if (!user) {
      // Auto-crear usuario en DynamoDB si existe en Firebase Auth
      try {
        const firebaseUser = await auth.getUser(req.userId!);
        user = {
          id: req.userId!,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuario",
          email: firebaseUser.email || req.userEmail || "",
        };
        await createUser(user);
        console.log(`👤 Usuario ${user.email} auto-creado en DynamoDB (/me)`);
      } catch (dbError) {
        console.error("Error auto-creando usuario en DynamoDB:", dbError);
        res.status(404).json({ success: false, message: "Usuario no encontrado" });
        return;
      }
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Error en /auth/me:", error);
    res.status(500).json({ success: false, message: "Error al obtener el usuario" });
  }
});

// POST /auth/verify-session
// Verifica un session cookie y retorna el usuario
router.post("/verify-session", async (req: Request, res: Response): Promise<void> => {
  const { sessionCookie } = req.body;

  if (!sessionCookie) {
    res.status(400).json({ success: false, message: "sessionCookie requerido" });
    return;
  }

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    let user = await getUserById(decodedClaims.uid);

    if (!user) {
      // Auto-crear usuario en DynamoDB si existe en Firebase Auth
      try {
        const firebaseUser = await auth.getUser(decodedClaims.uid);
        user = {
          id: decodedClaims.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuario",
          email: firebaseUser.email || decodedClaims.email || "",
        };
        await createUser(user);
        console.log(`👤 Usuario ${user.email} auto-creado en DynamoDB (/verify-session)`);
      } catch (dbError) {
        console.error("Error auto-creando usuario en DynamoDB:", dbError);
        res.status(404).json({ success: false, message: "Usuario no encontrado" });
        return;
      }
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Sesión inválida o expirada" });
  }
});

export default router;
