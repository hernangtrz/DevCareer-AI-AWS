import { Router, Request, Response } from "express";
import multer from "multer";
import { analyzeCvAts, callGeminiRaw } from "../services/gemini.service";
import { aiRateLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

// Configure multer for in-memory PDF uploads (max 8MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

// Apply rate limiting to all AI CV endpoints
router.use(aiRateLimiter);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/cv/analyze
// Soporta tanto subida de archivo PDF (multipart/form-data) como texto pegado (JSON)
// ──────────────────────────────────────────────────────────────────────────────
router.post(
  "/analyze",
  upload.single("cvFile"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const jobDescription = req.body.jobDescription || "";
      const cvText = req.body.cvText || "";
      const file = req.file;

      if (!jobDescription || jobDescription.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "La descripción de la oferta de empleo es obligatoria.",
        });
        return;
      }

      if (!file && (!cvText || cvText.trim().length === 0)) {
        res.status(400).json({
          success: false,
          message: "Debes adjuntar un archivo PDF o ingresar el texto de tu currículum.",
        });
        return;
      }

      let pdfBase64: string | undefined = undefined;
      if (file && file.mimetype === "application/pdf") {
        pdfBase64 = file.buffer.toString("base64");
      }

      const analysis = await analyzeCvAts({
        jobDescription,
        cvText: !pdfBase64 ? cvText : undefined,
        pdfBase64,
      });

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      console.error("[CvRoutes] Error en /api/cv/analyze:", error?.message || error);
      res.status(500).json({
        success: false,
        message: error?.message || "Ocurrió un error al analizar el CV con la IA.",
      });
    }
  }
);

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/cv/improve - Optimizar hoja de vida con Gemini AI
// ──────────────────────────────────────────────────────────────────────────────
router.post("/improve", async (req: Request, res: Response): Promise<void> => {
  const { personalInfo, experiences, skills, education, targetRole, language, profileText, translate } = req.body;

  try {
    const langName = language === "en" ? "English (Inglés)" : "Spanish (Español)";
    const translateNote = translate
      ? `IMPORTANTE: El usuario ha cambiado el idioma del CV a ${langName}. Debes TRADUCIR TODO el contenido al ${langName}, incluyendo los bullets de experiencia, habilidades, perfil, títulos de cargo y educación.`
      : `El idioma de salida de todo el contenido debe ser: ${langName}.`;

    const prompt = `Actúa como un reclutador experto y escritor profesional de CVs optimizados para filtros ATS.
Tu objetivo es optimizar los datos de la hoja de vida que te proporciono para el rol objetivo: "${targetRole || "Profesional TI"}".

${translateNote}

Aquí están los datos actuales del candidato:
- Título profesional actual: "${personalInfo?.headline || ""}"
- Perfil Profesional (Acerca de mí): "${profileText || ""}"
- Experiencia laboral actual: ${JSON.stringify(experiences || [])}
- Habilidades técnicas actuales: ${JSON.stringify(skills || [])}
- Educación: ${JSON.stringify(education || [])}

Realiza las siguientes mejoras (en el idioma solicitado):
1. **Título profesional (headline)**: Reescríbelo para que sea de alto impacto y contenga palabras clave para el rol "${targetRole}".
2. **Perfil profesional**: Si está presente, mejora la redacción y tradúcelo al idioma solicitado.
3. **Experiencia laboral (bullets)**: Reescribe los puntos usando verbos de acción fuertes. Si el usuario pidió traducción, tradúcelos también.
4. **Habilidades técnicas (skills)**: Normaliza los nombres (ej. "reactjs" -> "React"). Si pidió traducción, traduce habilidades no técnicas (ej. "Trabajo en equipo" -> "Teamwork").
5. **Mantener consistencia**: No alteres los nombres de las empresas ni las fechas.

Devuelve ÚNICAMENTE un objeto JSON estructurado exactamente así:
{
  "personalInfo": {
    "headline": "Título profesional optimizado en el idioma solicitado"
  },
  "profileText": "Perfil profesional mejorado y traducido (vacío si no había texto original)",
  "experiences": [
    {
      "company": "Mismo nombre de empresa sin alterar",
      "role": "Cargo traducido si aplica",
      "startDate": "Misma fecha de inicio",
      "endDate": "Misma fecha de fin",
      "bullets": [
        "Logro/Responsabilidad optimizada 1 con verbo de acción fuerte",
        "Logro/Responsabilidad optimizada 2 con verbo de acción fuerte"
      ]
    }
  ],
  "skills": [
    "Habilidad 1 estandarizada",
    "Habilidad 2 estandarizada"
  ]
}`;

    const improvedData = await callGeminiRaw([{ text: prompt }], { temperature: 0.4 });

    res.status(200).json({
      success: true,
      data: improvedData,
    });
  } catch (error: any) {
    console.error("[CvRoutes] Error optimizando CV con Gemini:", error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || "Ocurrió un error al procesar la optimización del CV.",
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/cv/improve-profile - Optimizar resumen ejecutivo del perfil
// ──────────────────────────────────────────────────────────────────────────────
router.post("/improve-profile", async (req: Request, res: Response): Promise<void> => {
  const { profileText, targetRole, language } = req.body;

  try {
    const prompt = `Actúa como un reclutador experto y redactor profesional de CVs.
Tu tarea es perfeccionar el "Perfil Profesional" (también llamado "Acerca de mí" o "Resumen Ejecutivo") de un candidato para que sea atractivo, profesional, use un tono formal y esté alineado con el rol objetivo: "${targetRole || "Profesional TI"}".

El idioma de salida del párrafo resultante debe ser: ${language === "en" ? "Inglés (English)" : "Español (Spanish)"}.

Aquí está el texto de perfil actual provisto por el usuario:
"${profileText || ""}"

Instrucciones:
1. Mejora la gramática, redacción, vocabulario y fluidez profesional.
2. Hazlo sonar motivador, dinámico y con palabras clave que encajen con el rol objetivo "${targetRole}".
3. Debe ser un único párrafo conciso (entre 3 y 5 oraciones, máximo 120 palabras).
4. No agregues certificaciones o estudios específicos que no se mencionen en el texto original, mantén la fidelidad a los hechos reales.

Devuelve ÚNICAMENTE un objeto JSON estructurado exactamente así:
{
  "refinedProfile": "Párrafo de perfil profesional mejorado en el idioma solicitado"
}`;

    const result = await callGeminiRaw([{ text: prompt }], { temperature: 0.5 });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[CvRoutes] Error optimizando perfil con Gemini:", error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || "Ocurrió un error al procesar la optimización del perfil.",
    });
  }
});

export default router;
