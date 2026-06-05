"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// POST /api/cv/improve - Optimizar hoja de vida con Gemini AI
router.post("/improve", async (req, res) => {
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
        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const improvedData = JSON.parse(cleanText);
        res.status(200).json({
            success: true,
            data: improvedData
        });
    }
    catch (error) {
        console.error("Error optimizando CV con Gemini:", error?.message || error);
        res.status(500).json({
            success: false,
            message: error?.message || "Ocurrió un error al procesar la optimización del CV."
        });
    }
});
// POST /api/cv/improve-profile - Optimizar redacción del perfil profesional (Acerca de mí) con Gemini AI
router.post("/improve-profile", async (req, res) => {
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
        const geminiData = await geminiRes.json();
        const rawText = geminiData.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/```json|```/g, "").trim();
        const result = JSON.parse(cleanText);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error("Error optimizando perfil de CV con Gemini:", error?.message || error);
        res.status(500).json({
            success: false,
            message: error?.message || "Ocurrió un error al procesar la optimización del perfil."
        });
    }
});
exports.default = router;
//# sourceMappingURL=cv.routes.js.map