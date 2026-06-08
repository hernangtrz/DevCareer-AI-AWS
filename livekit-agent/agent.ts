import { cli, WorkerOptions, defineAgent, type JobContext, voice, llm } from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

dotenv.config();

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log(`[Agent] Conectando a la sala: ${ctx.job.room.name}`);
    await ctx.connect();
    console.log(`[Agent] Conectado exitosamente.`);

    const roomName = ctx.job.room.name || '';
    let instructions = '';
    let greeting = '';
    const tools: Record<string, any> = {};

    // Cargar Voice Activity Detection (Silero VAD)
    const vad = await silero.VAD.load();

    // ── CONFIGURACIÓN SEGÚN TIPO DE SALA ───────────────────────────────────────────
    if (roomName.startsWith('generate_')) {
      // Flujo de Configuración (Creación de Entrevista por Voz)
      const parts = roomName.split('_');
      const userId = parts[1] || 'user_unknown';

      greeting = 'Hola, bienvenido a DevCareer AI. Soy Alejandro, tu asistente de configuración. ¿Para qué puesto o rol técnico te gustaría preparar una entrevista hoy?';
      
      instructions = 
        'Eres un asistente de voz experto en configurar entrevistas de trabajo para DevCareer AI. Tu objetivo es interactuar de manera fluida y recopilar la información necesaria del usuario para configurar su simulación.\n\n' +
        'Debes recopilar los siguientes campos del usuario:\n' +
        '1. El rol técnico o puesto (ej. Frontend Developer, Backend Developer, Full Stack, Product Manager).\n' +
        '2. El nivel de experiencia (debe ser uno de estos exactos: Junior, Semi-Senior, o Senior).\n' +
        '3. Las tecnologías o stack (ej. React, Node.js, Typescript, AWS, etc. Pregunta por las tecnologías clave si no las menciona).\n' +
        '4. El enfoque o tipo de entrevista (debe ser uno de estos exactos: tecnica, comportamiento o mixta).\n' +
        '5. La cantidad de preguntas (por defecto 5, a menos que el usuario pida más o menos).\n\n' +
        'Pautas de comportamiento:\n' +
        '- Sé extremadamente amable, profesional y conversacional.\n' +
        '- Habla SIEMPRE en español. No uses inglés.\n' +
        '- Mantén tus respuestas extremadamente cortas (1 o 2 frases máximo) para que no sea un monólogo.\n' +
        '- Haz una pregunta a la vez. No abrumes al usuario pidiéndole todos los datos de golpe.\n' +
        '- En cuanto tengas toda la información recolectada de la conversación, debes invocar inmediatamente la herramienta "saveParameters" pasándole los datos extraídos.\n' +
        '- Tras ejecutar la herramienta con éxito, dile al usuario que la entrevista se ha generado correctamente en su dashboard, despídete cordialmente y termina la llamada.';

      // Definir la herramienta de recopilación
      const saveParameters = llm.tool({
        description: 'Guarda los parámetros de la entrevista recolectados del usuario y genera las preguntas automáticamente.',
        parameters: z.object({
          role: z.string().describe('El rol técnico o puesto de trabajo, ej. Frontend Developer, Backend Developer, Full Stack'),
          level: z.enum(['Junior', 'Semi-Senior', 'Senior']).describe('El nivel de experiencia: Junior, Semi-Senior, o Senior'),
          techstack: z.array(z.string()).describe('Lista de tecnologías clave requeridas, ej. React, Node.js, TypeScript, PostgreSQL'),
          type: z.enum(['tecnica', 'comportamiento', 'mixta']).describe('El tipo o enfoque de la entrevista: tecnica (técnica), comportamiento (behavioral) o mixta'),
          amount: z.number().default(5).describe('La cantidad de preguntas a generar'),
        }),
        execute: async ({ role, level, techstack, type, amount }) => {
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
              const text = await res.text();
              console.error(`[Agent Tool] Error en backend response:`, text);
              return 'Hubo un error al guardar los parámetros en el servidor. Dile al usuario que intente de nuevo.';
            }
          } catch (err: any) {
            console.error(`[Agent Tool] Excepción al llamar backend:`, err);
            return `Ocurrió una excepción al conectar con el servidor: ${err.message}`;
          }
        }
      });

      tools.saveParameters = saveParameters;

    } else if (roomName.startsWith('interview_')) {
      // Flujo de Simulación de Entrevista Real
      const parts = roomName.split('_');
      const interviewId = parts[1] || 'interview_unknown';

      greeting = 'Hola, bienvenido a tu entrevista de simulación en DevCareer AI. Soy Alejandro y hoy seré tu entrevistador. ¿Estás listo para comenzar con la primera pregunta?';

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
        questionsList = [
          '¿Podrías describirme tu experiencia en el desarrollo de software?',
          '¿Cuáles son tus tecnologías favoritas y por qué?',
          '¿Cómo manejas situaciones de desacuerdo con tu equipo técnico?',
        ];
      }

      const formattedQuestions = questionsList.map((q, idx) => `- Pregunta ${idx + 1}: ${q}`).join('\n');

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
    } else {
      // Fallback
      greeting = 'Hola, bienvenido a DevCareer AI. ¿En qué te puedo ayudar hoy?';
      instructions = 'Eres un asistente de voz amable de DevCareer AI. Ayuda al usuario en lo que necesite, responde en español y de forma muy breve.';
    }

    // Crear el pipeline con AgentSession
    const session = new voice.AgentSession({
      vad,
      // Deepgram STT para transcripción en español de alta precisión
      stt: new deepgram.STT({
        model: 'nova-2-general',
        language: 'es',
      }),
      // Groq como LLM
      llm: new openai.LLM({
        model: 'llama-3.3-70b-versatile',
        baseURL: 'https://api.groq.com/openai/v1',
        apiKey: process.env.GROQ_API_KEY,
      }),
      // Cartesia TTS (sonic-3.5)
      tts: new cartesia.TTS({
        model: 'sonic-3.5',
        voice: '162e0f37-8504-474c-bb33-c606c01890dc', // Alejandro - Calm Mentor en español
        language: 'es',
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
