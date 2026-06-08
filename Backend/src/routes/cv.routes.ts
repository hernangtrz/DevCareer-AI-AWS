import { Router, Request, Response } from "express";
import multer from "multer";

const router = Router();


// ── Multer config (memory storage, max 10MB) ──────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.originalname.endsWith(".pdf")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Solo se admiten archivos PDF."));
    }
  },
});

// ── Helper: llamada a Gemini ──────────────────────────────────────────────────
async function callGemini(prompt: string, temperature = 0.4): Promise<any> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("Falta GOOGLE_GENERATIVE_AI_API_KEY.");

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errBody}`);
  }

  const data = (await res.json()) as any;
  const rawText: string = data.candidates[0].content.parts[0].text;
  const cleanText = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleanText);
}

// POST /api/cv/analyze ─────────────────────────────────────────────────────────
router.post(
  "/analyze",
  upload.single("cvFile"),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobDescription, cvText: rawCvText } = req.body as {
        jobDescription?: string;
        cvText?: string;
      };

      if (!jobDescription || jobDescription.trim().length < 20) {
        res.status(400).json({
          success: false,
          message: "Debes proporcionar una descripción de vacante (mínimo 20 caracteres).",
        });
        return;
      }

      // Extract CV text: from uploaded PDF or plain text field
      let cvText = rawCvText || "";

      if (req.file) {
        // Dynamic import handles pdf-parse v2.x ESM correctly from CJS compiled code
        const pdfParseModule = await import("pdf-parse");
        const pdfParseFn = (pdfParseModule as any).default ?? pdfParseModule;
        const parsed = await pdfParseFn(req.file.buffer);
        cvText = parsed.text || "";
      }


      if (!cvText || cvText.trim().length < 50) {
        res.status(400).json({
          success: false,
          message:
            "No se pudo extraer suficiente texto del CV. Asegúrate de que el PDF no esté protegido o usa la opción de pegar el texto directamente.",
        });
        return;
      }

      const prompt = `Eres un sistema experto en reclutamiento tecnológico y análisis de compatibilidad ATS (Applicant Tracking System).

Tu tarea es analizar cuán compatible es el siguiente CURRÍCULUM con la OFERTA DE EMPLEO proporcionada.

─── CURRÍCULUM DEL CANDIDATO ───
${cvText.slice(0, 6000)}

─── DESCRIPCIÓN DE LA OFERTA DE EMPLEO ───
${jobDescription.slice(0, 3000)}

─── INSTRUCCIONES DE ANÁLISIS ───
1. Analiza con precisión qué tan bien encaja el currículum con los requisitos de la oferta.
2. Identifica las palabras clave técnicas y habilidades presentes en la oferta y si están en el CV.
3. Evalúa el formato, gramática, impacto de los logros y uso de métricas.
4. Genera sugerencias concretas y accionables para mejorar el CV.
5. El idioma de la respuesta debe ser ESPAÑOL.

Devuelve ÚNICAMENTE un objeto JSON con la siguiente estructura exacta (sin markdown, sin backticks):
{
  "score": <número 0-100 que representa compatibilidad ATS global>,
  "summary": "<resumen ejecutivo de 2-3 oraciones sobre la compatibilidad del candidato>",
  "breakdown": {
    "keywords": <0-100, porcentaje de palabras clave de la oferta presentes en el CV>,
    "formatting": <0-100, calidad del formato y legibilidad del CV>,
    "grammar": <0-100, gramática, claridad y estilo de redacción>,
    "impact": <0-100, uso de métricas, logros cuantificables y verbos de acción>
  },
  "matchedKeywords": [<lista de keywords/habilidades del anuncio que SÍ aparecen en el CV, máximo 12>],
  "missingKeywords": [<lista de keywords/habilidades críticas del anuncio que NO están en el CV, máximo 10>],
  "suggestions": [
    {
      "category": "<una de: 'keywords' | 'formatting' | 'grammar' | 'impact' | 'structure'>",
      "title": "<título corto y accionable de la sugerencia>",
      "description": "<explicación detallada de cómo mejorar este aspecto específico>",
      "severity": "<una de: 'high' | 'medium' | 'low'>"
    }
  ]
}

Importante: El campo "suggestions" debe tener entre 3 y 6 elementos ordenados por severity (high primero).`;

      const result = await callGemini(prompt, 0.3);

      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      console.error("Error en /api/cv/analyze:", error?.message || error);
      res.status(500).json({
        success: false,
        message: error?.message || "Error al analizar el CV con IA.",
      });
    }
  }
);


// POST /api/cv/improve - Optimizar hoja de vida con Gemini AI
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

Devuelve ÚNICAMENTE un objeto JSON estructurado exactamente así, sin bloques de código, sin markdown, sin backticks:
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

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Falta la API Key de Google Generative AI (GOOGLE_GENERATIVE_AI_API_KEY).");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.5,
          responseMimeType: "application/json"
        },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Error de Gemini API: ${geminiRes.status} ${geminiRes.statusText}`);
    }

    const geminiData = await geminiRes.json() as any;
    const rawText: string = geminiData.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const improvedData = JSON.parse(cleanText);

    res.status(200).json({
      success: true,
      data: improvedData
    });
  } catch (error: any) {
    console.error("Error optimizando CV con Gemini:", error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || "Ocurrió un error al procesar la optimización del CV."
    });
  }
});

// POST /api/cv/improve-profile - Optimizar redacción del perfil profesional (Acerca de mí) con Gemini AI
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

Devuelve ÚNICAMENTE un objeto JSON estructurado exactamente así, sin bloques de código, sin markdown, sin backticks:
{
  "refinedProfile": "Párrafo de perfil profesional mejorado en el idioma solicitado"
}`;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("Falta la API Key de Google Generative AI (GOOGLE_GENERATIVE_AI_API_KEY).");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json"
        },
      }),
    });

    if (!geminiRes.ok) {
      throw new Error(`Error de Gemini API: ${geminiRes.status} ${geminiRes.statusText}`);
    }

    const geminiData = await geminiRes.json() as any;
    const rawText: string = geminiData.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanText);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error("Error optimizando perfil de CV con Gemini:", error?.message || error);
    res.status(500).json({
      success: false,
      message: error?.message || "Ocurrió un error al procesar la optimización del perfil."
    });
  }
});

export default router;
