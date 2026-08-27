import { cli, WorkerOptions, defineAgent, type JobContext, voice } from '@livekit/agents';
import * as deepgram from '@livekit/agents-plugin-deepgram';
import * as cartesia from '@livekit/agents-plugin-cartesia';
import * as openai from '@livekit/agents-plugin-openai';
import * as silero from '@livekit/agents-plugin-silero';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config();

// Cargar Voice Activity Detection (Silero VAD) una vez globalmente al iniciar el worker
const vad = await silero.VAD.load();

const VOICE_MAP: Record<string, { voice: string; language: string; name: string }> = {
  'jeronimo-es': {
    voice: '7c1ecd2d-1c83-4d5d-a25c-b3820a274a2e', // Jeronimo (Spanish)
    language: 'es',
    name: 'Alejandro',
  },
  'catalina-es': {
    voice: '162e0f37-8504-474c-bb33-c606c01890dc', // Catalina (Spanish)
    language: 'es',
    name: 'Catalina',
  },
  'katie-en': {
    voice: 'f786b574-daa5-4673-aa0c-cbe3e8534c02', // Katie (English US)
    language: 'en',
    name: 'Katie',
  },
  'daniel-en': {
    voice: '47c38ca4-5f35-497b-b1a3-415245fb35e1', // Corey (English US)
    language: 'en',
    name: 'Daniel',
  },
};

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log(`[Agent] Conectando a la sala: ${ctx.job.room?.name || 'desconocida'}`);
    await ctx.connect();
    console.log(`[Agent] Conectado a LiveKit.`);

    const roomName = ctx.job.room?.name || '';
    const parts = roomName.split('_');
    const voiceKey = parts[2] || 'jeronimo-es';
    const config = VOICE_MAP[voiceKey] || VOICE_MAP['jeronimo-es'];
    const isEnglish = config.language === 'en';

    let instructions = '';
    let greeting = '';
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
        const data = (await res.json()) as any;
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

    // Si no se pudieron obtener preguntas del backend, fallback seguro
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

    const formattedQuestions = questionsList
      .map((q, idx) => (isEnglish ? `- Question ${idx + 1}: ${q}` : `- Pregunta ${idx + 1}: ${q}`))
      .join('\n');

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

    // Groq como LLM (modelo conversacional de baja latencia sin tokens de razonamiento)
    const groqModel = process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';
    console.log(`[Agent] Utilizando modelo LLM en Groq: ${groqModel}`);

    // Crear el pipeline con AgentSession
    const session = new voice.AgentSession({
      vad,
      // Deepgram STT dinámico según idioma
      stt: new deepgram.STT({
        model: 'nova-2-general',
        language: config.language,
      }),
      // Groq como LLM mediante plugin oficial
      llm: openai.LLM.withGroq({
        model: groqModel,
        apiKey: process.env.GROQ_API_KEY,
      }),
      // Cartesia TTS dinámico según la voz elegida
      tts: new cartesia.TTS({
        model: 'sonic-2',
        voice: config.voice,
        language: config.language,
        encoding: 'pcm_s16le',
        sampleRate: 16000,
      }),
    });

    // Logging de eventos para monitoreo y depuración en tiempo real
    session.on(voice.AgentSessionEventTypes.Error, (ev) => {
      console.error('[Agent] Error en sesión de voz:', ev);
    });

    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
      if (ev.transcript?.trim()) {
        console.log(`[Agent] Transcripción (${ev.isFinal ? 'FINAL' : 'parcial'}): "${ev.transcript.trim()}"`);
      }
    });

    session.on(voice.AgentSessionEventTypes.UserStateChanged, (ev) => {
      console.log(`[Agent] Estado del candidato: ${ev.oldState} -> ${ev.newState}`);
    });

    session.on(voice.AgentSessionEventTypes.AgentStateChanged, (ev) => {
      console.log(`[Agent] Estado del agente: ${ev.oldState} -> ${ev.newState}`);
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev) => {
      if ('role' in ev.item) {
        console.log(`[Agent] Historial [${ev.item.role}]: ${(ev.item.content || []).map((c: any) => typeof c === 'string' ? c : c?.text || '').join(' ')}`);
      }
    });

    const agent = new voice.Agent({
      instructions,
      tools: {},
    });

    // Iniciar la sesión vinculada a la sala de LiveKit
    await session.start({
      agent,
      room: ctx.room,
    });

    console.log('[Agent] Sesión iniciada. Esperando a que el participante se una...');
    const participant = await ctx.waitForParticipant();
    console.log(`[Agent] Participante conectado (${participant.identity}). Enviando saludo inicial...`);

    // Pausa breve para garantizar que el canal WebRTC esté listo
    await new Promise((r) => setTimeout(r, 600));
    await session.say(greeting);
  },
});

// Registrar el proceso del CLI para arrancar el worker
cli.runApp(
  new WorkerOptions({
    agent: fileURLToPath(import.meta.url),
  })
);

