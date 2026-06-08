import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const ATS_PROMPT = (jobDescription: string) => `Eres un sistema experto en reclutamiento tecnológico y análisis de compatibilidad ATS (Applicant Tracking System).

Tu tarea es analizar cuán compatible es el CURRÍCULUM adjunto con la OFERTA DE EMPLEO proporcionada.

─── DESCRIPCIÓN DE LA OFERTA DE EMPLEO ───
${jobDescription.slice(0, 3000)}

─── INSTRUCCIONES DE ANÁLISIS ───
1. Lee el currículum adjunto (PDF) y analiza con precisión qué tan bien encaja con la oferta.
2. Identifica las palabras clave técnicas y habilidades presentes en la oferta y si están en el CV.
3. Evalúa el formato, gramática, impacto de los logros y uso de métricas.
4. Genera sugerencias concretas y accionables para mejorar el CV.
5. El idioma de toda la respuesta debe ser ESPAÑOL.

Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta (sin markdown, sin backticks):
{
  "score": <número 0-100 que representa compatibilidad ATS global>,
  "summary": "<resumen ejecutivo de 2-3 oraciones sobre la compatibilidad del candidato>",
  "breakdown": {
    "keywords": <0-100, porcentaje de palabras clave de la oferta presentes en el CV>,
    "formatting": <0-100, calidad del formato y legibilidad del CV>,
    "grammar": <0-100, gramática, claridad y estilo de redacción>,
    "impact": <0-100, uso de métricas, logros cuantificables y verbos de acción>
  },
  "matchedKeywords": [<lista de keywords del anuncio que SÍ están en el CV, máximo 12>],
  "missingKeywords": [<lista de keywords críticas del anuncio que NO están en el CV, máximo 10>],
  "suggestions": [
    {
      "category": "<una de: 'keywords' | 'formatting' | 'grammar' | 'impact' | 'structure'>",
      "title": "<título corto y accionable>",
      "description": "<explicación detallada de cómo mejorar>",
      "severity": "<una de: 'high' | 'medium' | 'low'>"
    }
  ]
}

El campo "suggestions" debe tener entre 3 y 6 elementos ordenados por severity (high primero).`;

const ATS_TEXT_PROMPT = (cvText: string, jobDescription: string) =>
  ATS_PROMPT(jobDescription).replace(
    "─── INSTRUCCIONES DE ANÁLISIS ───",
    `─── CURRÍCULUM DEL CANDIDATO (TEXTO) ───
${cvText.slice(0, 6000)}

─── INSTRUCCIONES DE ANÁLISIS ───`
  );

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, message: "Falta la API Key de Gemini en el servidor." },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const jobDescription = formData.get("jobDescription") as string;
    const cvText = formData.get("cvText") as string | null;
    const cvFile = formData.get("cvFile") as File | null;

    if (!jobDescription || jobDescription.trim().length < 20) {
      return NextResponse.json(
        { success: false, message: "La descripción de la vacante es demasiado corta (mínimo 20 caracteres)." },
        { status: 400 }
      );
    }

    let geminiBody: any;

    if (cvFile) {
      // ── PDF mode: send file directly to Gemini as inline_data (multimodal) ──
      const arrayBuffer = await cvFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      geminiBody = {
        contents: [
          {
            parts: [
              {
                inline_data: {
                  mime_type: "application/pdf",
                  data: base64,
                },
              },
              { text: ATS_PROMPT(jobDescription) },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      };
    } else if (cvText && cvText.trim().length >= 50) {
      // ── Text mode: send CV text directly in the prompt ──
      geminiBody = {
        contents: [
          {
            parts: [{ text: ATS_TEXT_PROMPT(cvText, jobDescription) }],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      };
    } else {
      return NextResponse.json(
        { success: false, message: "Debes subir un PDF o pegar el texto del CV (mínimo 50 caracteres)." },
        { status: 400 }
      );
    }

    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API error ${geminiRes.status}: ${errText.slice(0, 200)}`);
    }

    const geminiData = await geminiRes.json() as any;
    const rawText: string = geminiData.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanText);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("[/api/cv/analyze] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error al analizar el CV con IA." },
      { status: 500 }
    );
  }
}
