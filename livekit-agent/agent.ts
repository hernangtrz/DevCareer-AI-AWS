import { cli, WorkerOptions, defineAgent, type JobContext, voice, llm } from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config();

// Cargar Voice Activity Detection (Silero VAD) una vez globalmente al iniciar el contenedor
const vad = await silero.VAD.load();

const VOICE_MAP: Record<string, { voice: string; language: string; name: string }> = {
  'jeronimo-es': {
    voice: '7c1ecd2d-1c83-4d5d-a25c-b3820a274a2e', // Jeronimo (Spanish)
    language: 'es',
    name: 'Alejandro'
  },
  'daniela-es': {
    voice: '399002e9-7f7d-42d4-a6a8-9b91bd809b9d', // Daniela (Mexican Spanish)
    language: 'es',
    name: 'Daniela'
  },
  'brooke-en': {
    voice: 'e07c00bc-4134-4eae-9ea4-1a55fb45746b', // Brooke (English US)
    language: 'en',
    name: 'Brooke'
  },
  'australian-en': {
    voice: 'f786b574-daa5-4673-aa0c-cbe3e8534c02', // Friendly Australian Man (English)
    language: 'en',
    name: 'Oliver'
  }
};

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log(`[Agent] Conectando a la sala: ${ctx.job.room?.name || 'desconocida'}`);
    await ctx.connect();
    console.log(`[Agent] Conectado exitosamente.`);

    const roomName = ctx.job.room?.name || '';
    const parts = roomName.split('_');
    const voiceKey = parts[2] || 'jeronimo-es';
    const config = VOICE_MAP[voiceKey] || VOICE_MAP['jeronimo-es'];
    const isEnglish = config.language === 'en';

    let instructions = '';
    let greeting = '';
    const tools: Record<string, any> = {};
    let hasSaved = false;

    // ── CONFIGURACIÓN SEGÚN TIPO DE SALA ───────────────────────────────────────────
    if (roomName.startsWith('generate_')) {
      // Flujo de Configuración (Creación de Entrevista por Voz)
      const userId = parts[1] || 'user_unknown';

      if (isEnglish) {
        greeting = `Hello, welcome to DevCareer AI. I am ${config.name}, your setup assistant. What technical role or position would you like to prepare an interview for today?`;
        instructions =
          `You are an expert voice assistant configuring job interviews for DevCareer AI. Your goal is to interact smoothly and collect the necessary information from the user to configure their simulation.\n\n` +
          `You must collect the following 5 fields from the user throughout the conversation, one by one:\n` +
          `1. The technical role or position (e.g., Frontend Developer, Backend Developer, Full Stack, Product Manager).\n` +
          `2. The experience level (Junior, Semi-Senior, or Senior).\n` +
          `3. The technologies or stack (e.g., React, Node.js, TypeScript, AWS, etc.).\n` +
          `4. The interview focus or type (tecnica (technical), comportamiento (behavioral), or mixta (mixed)).\n` +
          `5. The number of questions to generate (e.g., 3, 5, 10).\n\n` +
          `CRITICAL OPERATION RULES:\n` +
          `- It is strictly FORBIDDEN to call the "saveParameters" tool before you have explicitly asked and confirmed each of the 5 fields above with the user.\n` +
          `- DO NOT invent, assume, or use default values for any field. If the user hasn't explicitly mentioned a detail, you MUST ask for it.\n` +
          `- Ask only one question at a time in a conversational manner. For example, if the user tells you the role, respond shortly ("Excellent! ${parts[1] || 'Frontend Developer'}.") and then ask the next question ("What is your experience level for this role?").\n` +
          `- Speak ALWAYS in English. Keep your responses extremely short (maximum 1 or 2 sentences).\n` +
          `- Only when you have all 5 fields confirmed verbally by the user, invoke the "saveParameters" tool passing the collected data. Translate type to one of: 'tecnica', 'comportamiento', 'mixta'. Translate level to one of: 'Junior', 'Semi-Senior', 'Senior'.\n` +
          `- After successfully executing the tool, tell the user that their interview has been successfully generated in their dashboard, say goodbye cordially, and end the call.`;
      } else {
        greeting = `Hola, bienvenido a DevCareer AI. Soy ${config.name}, tu asistente de configuración. ¿Para qué puesto o rol técnico te gustaría preparar una entrevista hoy?`;
        instructions =
          'Eres un asistente de voz experto en configurar entrevistas de trabajo para DevCareer AI. Tu objetivo es interactuar de manera fluida y recopilar la información necesaria del usuario para configurar su simulación.\n\n' +
          'Debes recopilar obligatoriamente los siguientes 5 campos del usuario a lo largo de la conversación, uno por uno:\n' +
          '1. El rol técnico o puesto (ej. Frontend Developer, Backend Developer, Full Stack, Product Manager).\n' +
          '2. El nivel de experiencia (Junior, Semi-Senior, o Senior).\n' +
          '3. Las tecnologías o stack (ej. React, Node.js, Typescript, AWS, etc.).\n' +
          '4. El enfoque o tipo de entrevista (tecnica, comportamiento o mixta).\n' +
          '5. La cantidad de preguntas a generar (ej. 3, 5, 10).\n\n' +
          'REGLAS CRÍTICAS DE OPERACIÓN:\n' +
          '- Está estrictamente PROHIBIDO llamar a la herramienta "saveParameters" antes de haber preguntado y confirmado explícitamente con el usuario cada uno de los 5 campos anteriores.\n' +
          '- NO inventes, asumas, ni uses valores por defecto para ningún campo. Si el usuario no te ha mencionado algún dato (por ejemplo, el nivel de experiencia, las tecnologías, el enfoque o la cantidad de preguntas), DEBES preguntárselo.\n' +
          '- Haz una sola pregunta a la vez de forma conversacional. Por ejemplo, si el usuario te dice el puesto, responde de forma corta ("¡Excelente! Frontend Developer.") y luego haz la siguiente pregunta ("¿Cuál es tu nivel de experiencia para este rol?").\n' +
          '- Habla SIEMPRE en español. No uses inglés.\n' +
          '- Mantén tus respuestas extremadamente cortas (máximo 1 o 2 frases).\n' +
          '- Solo cuando tengas los 5 campos confirmados verbalmente por el usuario, invoca la herramienta "saveParameters" pasándole los datos extraídos.\n' +
          '- Tras ejecutar la herramienta con éxito, dile al usuario que la entrevista se ha generado correctamente en su dashboard, despídete cordialmente y termina la llamada.';
      }

      // Definir la herramienta de recopilación
      const saveParameters = llm.tool({
        description: 'Guarda los parámetros de la entrevista recolectados del usuario y genera las preguntas automáticamente.',
        parameters: z.object({
          role: z.string().describe('El rol técnico o puesto de trabajo, ej. Frontend Developer, Backend Developer, Full Stack'),
          level: z.enum(['Junior', 'Semi-Senior', 'Senior']).describe('El nivel de experiencia: Junior, Semi-Senior, o Senior'),
          techstack: z.array(z.string()).describe('Lista de tecnologías clave requeridas, ej. React, Node.js, TypeScript, PostgreSQL'),
          type: z.enum(['tecnica', 'comportamiento', 'mixta']).describe('El tipo o enfoque de la entrevista: tecnica (técnica), comportamiento (behavioral) o mixta'),
          amount: z.number().describe('La cantidad de preguntas a generar (ej. 5). DEBES preguntar explícitamente al usuario cuántas preguntas quiere antes de llamar a esta herramienta.'),
        }),
        execute: async ({ role, level, techstack, type, amount }) => {
          if (hasSaved) {
            console.log(`[Agent Tool] saveParameters ignorado porque ya fue ejecutado con éxito.`);
            return 'La entrevista ya fue guardada y creada anteriormente con éxito en el servidor. Dile al usuario que ya está lista en su dashboard.';
          }
          hasSaved = true;
          console.log(`[Agent Tool] Ejecutando saveParameters con args:`, { role, level, techstack, type, amount });
          try {
            const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
            const payload = {
              role,
              level,
              techstack: techstack.join(','),
              type,
              amount,
              userId,
            };

            console.log(`[Agent Tool] Enviando payload al backend:`, payload);
            const res = await fetch(`${backendUrl}/api/livekit/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            });

            if (res.ok) {
              const data = await res.json() as any;
              console.log(`[Agent Tool] Backend respondió éxito:`, data);
              return 'Los parámetros han sido guardados con éxito en la base de datos y la entrevista fue generada. Puedes decírselo al usuario y despedirte amablemente.';
            } else {
              hasSaved = false; // Permitir reintento
              const text = await res.text();
              console.error(`[Agent Tool] Error en backend response:`, text);
              return 'Hubo un error al guardar los parámetros en el servidor. Dile al usuario que intente de nuevo.';
            }
          } catch (err: any) {
            hasSaved = false; // Permitir reintento
            console.error(`[Agent Tool] Excepción al llamar backend:`, err);
            return `Ocurrió una excepción al conectar con el servidor: ${err.message}`;
          }
        }
      });

      tools.saveParameters = saveParameters;

    } else if (roomName.startsWith('interview_')) {
      // Flujo de Simulación de Entrevista Real
      const interviewId = parts[1] || 'interview_unknown';

      if (isEnglish) {
        greeting = `Hello, welcome to your simulation interview at DevCareer AI. I am ${config.name} and I will be your interviewer today. Are you ready to begin with the first question?`;
      } else {
        greeting = `Hola, bienvenido a tu entrevista de simulación en DevCareer AI. Soy ${config.name} y hoy seré tu entrevistador. ¿Estás listo para comenzar con la primera pregunta?`;
      }

      let role = 'Software Developer';
      let questionsList: string[] = [];

      try {
        const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        console.log(`[Agent] Buscando detalles de entrevista para id: ${interviewId}`);
        const res = await fetch(`${backendUrl}/api/livekit/interview-details?interviewId=${interviewId}`);
        if (res.ok) {
          const data = await res.json() as any;
          if (data.success && data.interview) {
            role = data.interview.role || role;
            questionsList = data.interview.questions || [];
            console.log(`[Agent] Preguntas obtenidas exitosamente del backend: ${questionsList.length}`);
          }
        } else {
          console.error(`[Agent] Error al buscar detalles en backend: ${res.statusText}`);
        }
      } catch (err) {
        console.error(`[Agent] Excepción al buscar detalles en backend:`, err);
      }

      // Si no pudimos obtener preguntas, cargamos unas genéricas por seguridad
      if (questionsList.length === 0) {
        if (isEnglish) {
          questionsList = [
            'Could you describe your experience in software development?',
            'What are your favorite technologies and why?',
            'How do you handle disagreements with your technical team?',
          ];
        } else {
          questionsList = [
            '¿Podrías describirme tu experiencia en el desarrollo de software?',
            '¿Cuáles son tus tecnologías favoritas y por qué?',
            '¿Cómo manejas situaciones de desacuerdo con tu equipo técnico?',
          ];
        }
      }

      const formattedQuestions = questionsList.map((q, idx) => (isEnglish ? `- Question ${idx + 1}: ${q}` : `- Pregunta ${idx + 1}: ${q}`)).join('\n');

      if (isEnglish) {
        instructions =
          `You are a professional interviewer and expert technical recruiter from DevCareer AI. You are conducting a real-time voice interview with a candidate.\n` +
          `The position they are applying for is: "${role}".\n\n` +
          `You must ask the following questions sequentially in the order established, waiting for the user to respond to each before moving to the next:\n` +
          `${formattedQuestions}\n\n` +
          `Important guidelines:\n` +
          `- Greet the user cordially and ask if they are ready.\n` +
          `- Ask one question at a time. Do not read them all together.\n` +
          `- Listen to the user's response actively. Acknowledge it or make a very brief comment before asking the next question.\n` +
          `- If their answer is too short or vague, you can ask a very brief follow-up question on the topic.\n` +
          `- Keep your responses very short (maximum 2 sentences) to make it an active dialogue.\n` +
          `- Be professional but polite and encouraging.\n` +
          `- Speak ALWAYS in English. Do not use Spanish.\n` +
          `- Upon completing all questions, formally thank the user for their time, tell them that the interview has concluded and the system will generate their report in the dashboard immediately. Say goodbye politely.`;
      } else {
        instructions =
          `Eres un entrevistador profesional y reclutador técnico experto de DevCareer AI. Estás conduciendo una entrevista en tiempo real con un candidato.\n` +
          `El puesto para el que está aplicando es: "${role}".\n\n` +
          `Debes realizar las siguientes preguntas secuencialmente en el orden establecido, esperando a que el usuario responda a cada una antes de pasar a la siguiente:\n` +
          `${formattedQuestions}\n\n` +
          `Pautas importantes:\n` +
          `- Saluda al usuario cordialmente y pregúntale si está listo.\n` +
          `- Formula una pregunta a la vez. No las leas todas juntas.\n` +
          `- Escucha la respuesta del usuario de forma activa. Reconócela o haz un comentario muy breve antes de pasar a la siguiente pregunta.\n` +
          `- Si su respuesta es demasiado corta o vaga, puedes hacer una pregunta de seguimiento muy breve sobre el tema.\n` +
          `- Mantén las respuestas de tu parte muy cortas (máximo 2 frases) para que sea un diálogo ágil.\n` +
          `- Sé profesional pero amable y motivador.\n` +
          `- Habla SIEMPRE en español. No uses inglés.\n` +
          `- Al finalizar todas las preguntas, agradece formalmente al usuario por su tiempo, dile que su entrevista ha concluido y que el sistema generará su reporte en el dashboard de inmediato. Despídete amablemente.`;
      }
    } else {
      // Fallback
      greeting = 'Hola, bienvenido a DevCareer AI. ¿En qué te puedo ayudar hoy?';
      instructions = 'Eres un asistente de voz amable de DevCareer AI. Ayuda al usuario en lo que necesite, responde en español y de forma muy breve.';
    }

    // Crear el pipeline con AgentSession
    const session = new voice.AgentSession({
      vad,
      // Deepgram STT dinámico según idioma
      stt: new deepgram.STT({
        model: 'nova-2-general',
        language: config.language,
      }),
      // Groq como LLM
      llm: new openai.LLM({
        model: 'llama-3.3-70b-versatile',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
      }),
      // Cartesia TTS dinámico según la voz elegida
      tts: new cartesia.TTS({
        model: 'sonic-3.5',
        voice: config.voice,
        language: config.language,
      }),
      // Configuración de turnos súper estable para evitar silencios / congelamientos
      turnHandling: {
        preemptiveGeneration: { enabled: false }, // Apaga generación especulativa
        endpointing: {
          minDelay: 800, // 800ms de silencio para turno completo
        },
        interruption: {
          mode: 'vad',
          minDuration: 800, // 800ms de habla continua para interrumpir
          resumeFalseInterruption: false,
        },
      },
    });

    const agent = new voice.Agent({
      instructions,
      tools,
    });

    // Iniciar la sesión de voz
    await session.start({
      agent,
      room: ctx.room,
    });

    console.log('[Agent] Sesión de voz iniciada. Enviando saludo inicial...');
    await session.say(greeting);
  },
});

// Registrar el proceso del CLI para arrancar el worker
cli.runApp(new WorkerOptions({
  agent: fileURLToPath(import.meta.url),
}));
