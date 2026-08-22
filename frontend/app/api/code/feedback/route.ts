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
    const { code, problemTitle, problemDescription, testResults, passedCount, totalCount, isDesignPattern } = body;

    if (!code || !problemTitle) {
      return NextResponse.json(
        { success: false, message: "Faltan parámetros requeridos." },
        { status: 400 }
      );
    }

    const patternInstructions = isDesignPattern
      ? `
ESPECIALIZACIÓN EN PATRONES DE DISEÑO Y CÓDIGO LIMPIO:
El candidato está resolviendo un reto de REFACTORIZACIÓN Y PATRONES DE DISEÑO.
Evalúa rigurosamente:
1. ¿Implementó correctamente el Patrón de Diseño esperado (Strategy, Factory, Observer, Adapter, etc.) desacoplando la lógica?
2. ¿Cumple con los principios SOLID (especialmente Single Responsibility y Open/Closed)?
3. ¿Eliminó los malos olores de código (Code Smells como switch/case anidados, acoplamiento directo, duplicidad)?
`
      : `
ESPECIALIZACIÓN EN ALGORITMOS Y ESTRUCTURAS DE DATOS:
Evalúa rigurosamente la corrección lógica, eficiencia temporal/espacial Big-O y casos límite.
`;

    const prompt = `Eres un Staff Software Engineer y experto en Arquitectura de Software, Patrones de Diseño GoF y principios SOLID evaluando la solución de código de un candidato técnico.

PROBLEMA: ${problemTitle}
DESCRIPCIÓN DEL RETO:
${problemDescription}

CÓDIGO ENVIADO POR EL CANDIDATO (JavaScript/TypeScript):
\`\`\`javascript
${code}
\`\`\`

RESULTADOS DE PRUEBAS UNITARIAS: ${passedCount}/${totalCount} tests pasados.

${patternInstructions}

INSTRUCCIONES DE EVALUACIÓN:
Responde ÚNICAMENTE con un objeto JSON válido, sin bloques markdown (\`\`\`json), con esta estructura exacta:
{
  "score": <número entero de 0 a 100>,
  "complexity": {
    "time": "<ej: O(1), O(n), O(log n)>",
    "space": "<ej: O(1), O(n)>"
  },
  "patternAnalysis": {
    "isPatternApplied": <true si aplicó un patrón GoF o estructura limpia, false si dejó código acoplado>,
    "patternName": "<nombre del patrón detectado o 'N/A'>",
    "solidAdherence": "<comentario conciso sobre si respeta Single Responsibility y Open/Closed Principle>"
  },
  "codeSmellsEliminated": [
    "<string con mal olor eliminado 1, ej: 'Eliminó condicionales anidados usando estrategias polimórficas'>",
    "<string con mal olor eliminado 2>"
  ],
  "strengths": [
    "<fortaleza técnica 1 de la solución>",
    "<fortaleza técnica 2>"
  ],
  "improvements": [
    "<mejora concreta 1>",
    "<mejora concreta 2>"
  ],
  "interviewerTip": "<consejo conciso de 1-2 oraciones que un entrevistador senior daría al candidato>"
}

REGLAS DE PUNTUACIÓN:
- Si los tests fallan o hay errores de sintaxis: Score < 45.
- Si los tests pasan pero el código tiene malos olores o no aplicó el patrón esperado: Score entre 55 y 74.
- Si los tests pasan, aplica el patrón de diseño correctamente y respeta principios SOLID: Score entre 85 y 100.
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
      { success: false, message: error?.message || "Error al evaluar el código." },
      { status: 500 }
    );
  }
}
