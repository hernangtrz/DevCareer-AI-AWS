import { Router, Request, Response } from "express";

const router = Router();

// POST /api/cv/improve - Optimizar hoja de vida con Gemini AI
router.post("/improve", async (req: Request, res: Response): Promise<void> => {
  const { personalInfo, experiences, skills, education, targetRole, language } = req.body;

  try {
    const prompt = `Actúa como un reclutador experto y escritor profesional de CVs optimizados para filtros ATS.
Tu objetivo es optimizar los datos de la hoja de vida que te proporciono para el rol objetivo: "${targetRole || "Profesional TI"}".

El idioma de salida de todo el contenido debe ser: ${language === "en" ? "Inglés (English)" : "Español (Spanish)"}.

Aquí están los datos actuales del candidato:
- Título profesional actual: "${personalInfo?.headline || ""}"
- Experiencia laboral actual: ${JSON.stringify(experiences || [])}
- Habilidades técnicas actuales: ${JSON.stringify(skills || [])}
- Educación: ${JSON.stringify(education || [])}

Realiza las siguientes mejoras:
1. **Título profesional (headline)**: Reescríbelo para que sea de alto impacto, contenga palabras clave relevantes para el rol objetivo ("${targetRole}") y demuestre especialización.
2. **Experiencia laboral (bullets)**: Reescribe los puntos (bullets) de responsabilidades/logros de cada experiencia utilizando verbos de acción fuertes al inicio y métricas de impacto implícitas o sugeridas si aplica. Si el candidato escribió puntos muy cortos o vacíos, expande creativamente sus logros de manera profesional y realista según el puesto y la empresa.
3. **Habilidades técnicas (skills)**: Limpia la lista actual (corrige mayúsculas y nombres estándar, ej. "reactjs" -> "React", "nodejs" -> "Node.js"). Añade entre 3 y 5 habilidades adicionales de alta demanda que encajen directamente con el rol objetivo "${targetRole}" y el perfil del candidato.
4. **Mantener consistencia**: No alteres los nombres de las empresas, fechas de inicio/fin ni la educación.

Devuelve ÚNICAMENTE un objeto JSON estructurado exactamente así, sin bloques de código, sin markdown, sin backticks:
{
  "personalInfo": {
    "headline": "Título profesional optimizado en el idioma solicitado"
  },
  "experiences": [
    {
      "company": "Mismo nombre de empresa sin alterar",
      "role": "Cargo optimizado si era impreciso",
      "startDate": "Misma fecha de inicio",
      "endDate": "Misma fecha de fin",
      "bullets": [
        "Logro/Responsabilidad optimizada 1 con verbo de acción fuerte",
        "Logro/Responsabilidad optimizada 2 con verbo de acción fuerte"
      ]
    }
  ],
  "skills": [
    "Habilidad 1 estándar",
    "Habilidad 2 estándar",
    "Nueva Habilidad Sugerida 1",
    "Nueva Habilidad Sugerida 2"
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
