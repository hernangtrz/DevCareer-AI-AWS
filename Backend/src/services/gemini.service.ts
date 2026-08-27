/**
 * gemini.service.ts
 * Servicio centralizado para todas las interacciones con Google Gemini AI.
 * Maneja prompts estructurados, control de temperatura, llamadas REST a Gemini
 * y sanitización robusta de respuestas JSON.
 */

interface GeminiContentPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

function getGeminiEndpoint(model = "gemini-3.1-flash-lite"): string {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno GOOGLE_GENERATIVE_AI_API_KEY.");
  }
  return `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
}

/**
 * Limpia y parsea de forma segura respuestas JSON devueltas por modelos de lenguaje.
 */
export function sanitizeAndParseJson<T = any>(rawText: string): T {
  let cleaned = rawText.trim();

  // Eliminar bloques de código markdown
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Extraer el primer bloque JSON delimitado por { } o [ ] si el modelo añadió texto introductorio
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(cleaned) as T;
  } catch (err: any) {
    console.error("[GeminiService] Error parseando JSON de Gemini. Raw text:", rawText);
    throw new Error(`Respuesta inválida de IA: no se pudo parsear el JSON generado (${err.message}).`);
  }
}

/**
 * Ejecuta una petición directa a la API de Gemini con control de temperatura y schema JSON.
 */
export async function callGeminiRaw(
  parts: GeminiContentPart[],
  options: { temperature?: number; model?: string } = {}
): Promise<any> {
  const endpoint = getGeminiEndpoint(options.model || "gemini-3.1-flash-lite");

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: options.temperature ?? 0.3,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text().catch(() => "");
    throw new Error(`Gemini API Error (${res.status}): ${errorBody.slice(0, 300)}`);
  }

  const data = (await res.json()) as any;
  const rawText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  if (!rawText) {
    throw new Error("Gemini devolvió una respuesta vacía.");
  }

  return sanitizeAndParseJson(rawText);
}

// ── 1. EVALUACIÓN DE ENTREVISTAS DE VOZ ────────────────────────────────────────

export interface InterviewFeedbackResult {
  totalScore: number;
  categoryScores: Array<{ name: string; score: number; comment: string }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

export async function generateInterviewFeedback(
  formattedTranscript: string,
  isEnglish: boolean
): Promise<InterviewFeedbackResult> {
  const prompt = isEnglish
    ? `You are an AI interviewer analyzing a simulated job interview conducted in English. Evaluate the candidate based on structured categories. Be thorough. If there are errors or areas for improvement, point them out.
Transcript:
${formattedTranscript}

Rate the candidate from 0 to 100 in these areas and respond ONLY with a valid JSON with this exact structure, no additional text:
{
  "totalScore": number,
  "categoryScores": [
    { "name": string, "score": number, "comment": string }
  ],
  "strengths": [string],
  "areasForImprovement": [string],
  "finalAssessment": string
}

The 5 categories are:
- Communication Skills
- Technical Knowledge
- Problem Solving
- Cultural and Role Fit
- Confidence and Clarity`
    : `Eres un entrevistador de IA que analiza una entrevista simulada. Evalúa al candidato basándote en categorías estructuradas. Sé minucioso. Si hay errores o áreas de mejora, señálalos.
Transcripción:
${formattedTranscript}

Califica al candidato de 0 a 100 en estas áreas y responde ÚNICAMENTE con un JSON válido con esta estructura exacta, sin texto adicional:
{
  "totalScore": number,
  "categoryScores": [
    { "name": string, "score": number, "comment": string }
  ],
  "strengths": [string],
  "areasForImprovement": [string],
  "finalAssessment": string
}

Las 5 categorías son:
- Habilidades de Comunicación
- Conocimiento Técnico
- Resolución de Problemas
- Ajuste Cultural y al Puesto
- Confianza y Claridad`;

  return callGeminiRaw([{ text: prompt }], { temperature: 0.3 });
}

export interface EnglishProficiencyFeedback {
  overallLevel: string;
  grammarScore: number;
  vocabularyScore: number;
  fluencyScore: number;
  grammarErrors: string[];
  vocabularySuggestions: string[];
  overallComment: string;
}

export async function generateEnglishProficiencyFeedback(
  formattedTranscript: string
): Promise<EnglishProficiencyFeedback> {
  const prompt = `You are an expert English language coach and CEFR evaluator. Analyze the English language quality of the CANDIDATE's messages ONLY in the following interview transcript. Focus exclusively on grammar, vocabulary, fluency and natural English expression.

Transcript (analyze only "user" role messages):
${formattedTranscript}

Respond ONLY with a valid JSON object, no markdown, no backticks:
{
  "overallLevel": "<CEFR level: A1, A2, B1, B2, C1, or C2>",
  "grammarScore": <0-100>,
  "vocabularyScore": <0-100>,
  "fluencyScore": <0-100>,
  "grammarErrors": ["<specific grammar error example 1 from transcript>", "<error 2>"],
  "vocabularySuggestions": ["<word/phrase used + better alternative>"],
  "overallComment": "<2-3 sentence overall assessment of the candidate's English level and main areas for improvement>"
}

Rules:
- grammarErrors: list up to 5 real examples directly quoted from the transcript. If the English is excellent, return an empty array.
- vocabularySuggestions: list up to 5 specific improvements. If vocabulary is advanced, return an empty array.
- Be honest and constructive.`;

  return callGeminiRaw([{ text: prompt }], { temperature: 0.2 });
}

// ── 2. ANÁLISIS ATS DE CV VS OFERTA ──────────────────────────────────────────

export interface CvAtsAnalysisResult {
  score: number;
  summary: string;
  breakdown: {
    keywords: number;
    formatting: number;
    grammar: number;
    impact: number;
  };
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: Array<{
    category: "keywords" | "formatting" | "grammar" | "impact" | "structure";
    title: string;
    description: string;
    severity: "high" | "medium" | "low";
  }>;
}

export async function analyzeCvAts(params: {
  jobDescription: string;
  cvText?: string;
  pdfBase64?: string;
}): Promise<CvAtsAnalysisResult> {
  const systemPrompt = `Eres un sistema experto en reclutamiento tecnológico y análisis de compatibilidad ATS (Applicant Tracking System).
Tu tarea es analizar cuán compatible es el CURRÍCULUM adjunto con la OFERTA DE EMPLEO proporcionada.

─── DESCRIPCIÓN DE LA OFERTA DE EMPLEO ───
${params.jobDescription.slice(0, 4000)}

─── INSTRUCCIONES DE ANÁLISIS ───
1. Lee el currículum adjunto y analiza con precisión qué tan bien encaja con la oferta.
2. Identifica las palabras clave técnicas y habilidades presentes en la oferta y si están en el CV.
3. Evalúa el formato, gramática, impacto de los logros y uso de métricas.
4. Genera sugerencias concretas y accionables para mejorar el CV.
5. El idioma de toda la respuesta debe ser ESPAÑOL.

Devuelve ÚNICAMENTE un objeto JSON con esta estructura exacta:
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
}`;

  if (params.pdfBase64) {
    return callGeminiRaw(
      [
        { text: systemPrompt },
        {
          inlineData: {
            mimeType: "application/pdf",
            data: params.pdfBase64,
          },
        },
      ],
      { temperature: 0.2 }
    );
  } else {
    const textPrompt = `${systemPrompt}\n\n─── CURRÍCULUM DEL CANDIDATO (TEXTO) ───\n${(params.cvText || "").slice(0, 8000)}`;
    return callGeminiRaw([{ text: textPrompt }], { temperature: 0.2 });
  }
}

// ── 3. EVALUACIÓN DE DESAFÍOS DE CÓDIGO ───────────────────────────────────────

export interface CodeEvaluationResult {
  score: number;
  complexity: {
    time: string;
    space: string;
  };
  patternAnalysis: {
    isPatternApplied: boolean;
    patternName: string;
    solidAdherence: string;
  };
  codeSmellsEliminated: string[];
  strengths: string[];
  improvements: string[];
  interviewerTip: string;
}

export async function evaluateCodeChallenge(params: {
  code: string;
  problemTitle: string;
  problemDescription: string;
  passedCount: number;
  totalCount: number;
  isDesignPattern?: boolean;
}): Promise<CodeEvaluationResult> {
  const patternInstructions = params.isDesignPattern
    ? `ESPECIALIZACIÓN EN PATRONES DE DISEÑO Y CÓDIGO LIMPIO:
El candidato está resolviendo un reto de REFACTORIZACIÓN Y PATRONES DE DISEÑO.
Evalúa rigurosamente:
1. ¿Implementó correctamente el Patrón de Diseño esperado (Strategy, Factory, Observer, Adapter, etc.) desacoplando la lógica?
2. ¿Cumple con los principios SOLID (especialmente Single Responsibility y Open/Closed)?
3. ¿Eliminó los malos olores de código (Code Smells como switch/case anidados, acoplamiento directo, duplicidad)?`
    : `ESPECIALIZACIÓN EN ALGORITMOS Y ESTRUCTURAS DE DATOS:
Evalúa rigurosamente la corrección lógica, eficiencia temporal/espacial Big-O y casos límite.`;

  const prompt = `Eres un Staff Software Engineer y experto en Arquitectura de Software, Patrones de Diseño GoF y principios SOLID evaluando la solución de código de un candidato técnico.

PROBLEMA: ${params.problemTitle}
DESCRIPCIÓN DEL RETO:
${params.problemDescription}

CÓDIGO ENVIADO POR EL CANDIDATO (JavaScript/TypeScript):
\`\`\`javascript
${params.code}
\`\`\`

RESULTADOS DE PRUEBAS UNITARIAS: ${params.passedCount}/${params.totalCount} tests pasados.

${patternInstructions}

INSTRUCCIONES DE EVALUACIÓN:
Responde ÚNICAMENTE con un objeto JSON válido con esta estructura exacta:
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
    "<string con mal olor eliminado 1>",
    "<string con mal olor eliminado 2>"
  ],
  "strengths": [
    "<fortaleza técnica 1>",
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
- Si los tests pasan pero el código tiene malos olores o no aplicó el patrón: Score entre 55 y 74.
- Si los tests pasan, aplica el patrón correctamente y respeta SOLID: Score entre 85 y 100.`;

  return callGeminiRaw([{ text: prompt }], { temperature: 0.3 });
}
