import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, message: "Falta la API Key de Gemini en el servidor." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { code, problemTitle, problemDescription, testResults, passedCount, totalCount } = body;

    if (!code || !problemTitle) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros requeridos." },
        { status: 400 }
      );
    }

    const prompt = `Eres un entrevistador técnico senior evaluando la solución de código de un candidato para una entrevista de trabajo.

PROBLEMA: ${problemTitle}
DESCRIPCIÓN: ${problemDescription}

CÓDIGO DEL CANDIDATO (JavaScript):
\`\`\`javascript
${code}
\`\`\`

RESULTADOS DE LOS TEST CASES: ${passedCount}/${totalCount} pasados

INSTRUCCIONES:
Analiza el código del candidato de forma objetiva y detallada, como lo haría un entrevistador senior en una empresa de tecnología. Evalúa:
1. Corrección de la solución
2. Complejidad temporal (Big-O)
3. Complejidad espacial (Big-O)
4. Claridad y legibilidad del código
5. Posibles casos límite no manejados

Responde ÚNICAMENTE con un JSON válido, sin markdown, sin backticks, con esta estructura exacta:
{
  "score": <número 0-100 que representa la calidad general de la solución>,
  "complexity": {
    "time": "<complejidad temporal, ej: O(n), O(n²), O(log n)>",
    "space": "<complejidad espacial, ej: O(1), O(n)>"
  },
  "strengths": [<array de 2-3 strings con fortalezas concretas de la solución>],
  "improvements": [<array de 2-3 strings con mejoras concretas y accionables>],
  "interviewerTip": "<string de 1-2 oraciones: consejo específico que un entrevistador real daría a este candidato>"
}

Si el código tiene errores de sintaxis o no resuelve el problema, el score debe ser menor a 40.
Si resuelve correctamente pero con complejidad subóptima, entre 55-75.
Si resuelve correctamente con solución óptima, entre 80-100.
`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
    }

    const data = (await res.json()) as any;
    const rawText: string = data.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json|```/g, "").trim();
    const result = JSON.parse(cleanText);

    return NextResponse.json({ success: true, feedback: result });
  } catch (error: any) {
    console.error("[/api/code/feedback] Error:", error?.message || error);
    return NextResponse.json(
      { success: false, message: error?.message || "Error al generar feedback." },
      { status: 500 }
    );
  }
}
