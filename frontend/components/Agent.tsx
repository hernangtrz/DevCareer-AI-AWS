"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createFeedback } from "@/lib/api";
import { getCognitoIdToken } from "@/lib/cognito";
import {
  Phone,
  PhoneOff,
  Volume2,
  User,
  Sparkles,
  Loader2,
  Globe,
  Headphones,
  Activity
} from "lucide-react";
import {
  Room,
  RoomEvent,
  Participant,
  RemoteParticipant,
  LocalParticipant,
  Track,
  ConnectionState,
  TranscriptionSegment
} from "livekit-client";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
}

interface SavedMessage {
  id?: string;
  role: "user" | "system" | "assistant";
  content: string;
}

const VOICE_OPTIONS = [
  { key: "jeronimo-es", label: "Alejandro — Español LatAm (Hombre)", lang: "es" },
  { key: "catalina-es", label: "Catalina — Español LatAm (Mujer)", lang: "es" },
  { key: "katie-en", label: "Katie — English US (Female)", lang: "en" },
  { key: "daniel-en", label: "Daniel — English US (Male)", lang: "en" },
];

const Agent = ({
  userName,
  userId,
  type,
  interviewId,
  questions,
}: AgentProps) => {
  const router = useRouter();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  // Ref para leer siempre los mensajes más recientes sin añadirlos como dep del efecto de redirección
  const messagesRef = useRef<SavedMessage[]>([]);
  const [lkRoom, setLkRoom] = useState<Room | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("jeronimo-es");

  // Mantener el ref sincronizado con el estado de mensajes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    return () => {
      if (lkRoom) {
        lkRoom.disconnect();
      }
    };
  }, [lkRoom]);

  const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
    console.log("Generate feedback here.");
    setCallStatus(CallStatus.GENERATING_FEEDBACK);

    try {
      // Obtener ID Token de Cognito desde localStorage
      const idToken = getCognitoIdToken();

      const cleanMsgs = msgs.map(({ role, content }) => ({ role, content }));

      const voiceOpt = VOICE_OPTIONS.find((opt) => opt.key === selectedVoice);
      const language = voiceOpt ? voiceOpt.lang : "es";

      const { success, feedbackId: id } = await createFeedback(
        {
          interviewId: interviewId!,
          transcript: cleanMsgs,
          language,
        },
        idToken,
      );

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/dashboard");
      }
    } catch (e) {
      console.error(e);
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        router.push("/dashboard");
      } else {
        // Leer mensajes desde el ref para evitar closure stale y no añadir 'messages' como dep
        handleGenerateFeedback(messagesRef.current);
      }
    }
    // IMPORTANTE: NO incluir 'messages' aquí para evitar que la llegada de un
    // nuevo transcripto re-ejecute este efecto mientras la llamada está activa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

    try {
      const roomName = type === "generate"
        ? `generate_${userId || "unknown"}_${selectedVoice}_${Date.now()}`
        : `interview_${interviewId || "unknown"}_${selectedVoice}_${Date.now()}`;
      const identity = `developer_${userId || Math.floor(Math.random() * 1000)}`;

      const apiUrl = typeof window !== "undefined"
        ? "/api/proxy"
        : process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const tokenResponse = await fetch(`${apiUrl}/api/livekit/token?room=${roomName}&identity=${identity}`);

      if (!tokenResponse.ok) {
        throw new Error("No se pudo obtener el token de LiveKit.");
      }

      const { token, url } = await tokenResponse.json();

      const currentRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      currentRoom.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("[LiveKit] ConnectionState:", state);
        if (state === ConnectionState.Connected) {
          setCallStatus(CallStatus.ACTIVE);
        } else if (state === ConnectionState.Disconnected) {
          setCallStatus((prev) => {
            if (prev === CallStatus.ACTIVE) {
              return CallStatus.FINISHED;
            }
            return prev;
          });
          setLkRoom(null);
          setIsSpeaking(false);
        }
      });

      currentRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Audio) {
          const element = track.attach();
          document.body.appendChild(element);
          console.log(`[Audio Subscribed] Reproduciendo audio de: ${participant.identity}`);
        }
      });

      currentRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach().forEach((element) => element.remove());
      });

      currentRoom.on(RoomEvent.ActiveSpeakersChanged, (speakers) => {
        const isAgentSpeaking = speakers.some(
          (s) => !s.identity.startsWith("developer_") && s instanceof RemoteParticipant
        );
        setIsSpeaking(isAgentSpeaking);
      });

      currentRoom.on(RoomEvent.TranscriptionReceived, (segments: TranscriptionSegment[], participant?: Participant) => {
        if (!participant) return;
        const isSelf = participant instanceof LocalParticipant;
        const sender = isSelf ? "user" : "agent";

        setMessages((prev) => {
          const newMessages = [...prev];
          segments.forEach((segment) => {
            const index = newMessages.findIndex((m) => m.id === segment.id);
            if (index !== -1) {
              newMessages[index] = {
                ...newMessages[index],
                content: segment.text,
              };
            } else if (segment.text.trim()) {
              newMessages.push({
                id: segment.id,
                role: sender === "agent" ? "assistant" : "user",
                content: segment.text,
              });
            }
          });
          return newMessages;
        });
      });

      await currentRoom.connect(url, token);
      setLkRoom(currentRoom);

      try {
        await currentRoom.localParticipant.setMicrophoneEnabled(true);
      } catch (micErr) {
        console.warn("[LiveKit] No se pudo habilitar el micrófono (¿permisos denegados?):", micErr);
      }

    } catch (err) {
      console.error("Error al iniciar llamada con LiveKit:", err);
      setCallStatus(CallStatus.INACTIVE);
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    if (lkRoom) {
      lkRoom.disconnect();
    }
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  const isEs = VOICE_OPTIONS.find((opt) => opt.key === selectedVoice)?.lang === "es";

  if (callStatus === CallStatus.GENERATING_FEEDBACK) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-16">
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-zinc-900 border-t-indigo-500 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border-4 border-zinc-900 border-b-indigo-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.9s" }} />
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <h3 className="text-white text-xl font-extrabold tracking-tight">
            {isEs ? "Analizando tu entrevista..." : "Analyzing your interview..."}
          </h3>
          <p className="text-zinc-400 text-sm max-w-sm font-light leading-relaxed">
            {isEs 
              ? "Estamos generando tu retroalimentación personalizada." 
              : "We are generating your personalized feedback."}
            <br />
            <span className="text-indigo-400 font-semibold">{isEs ? "Por favor no cierres esta página." : "Please do not close this page."}</span>
          </p>
        </div>

        <div className="w-64 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-500 rounded-full"
            style={{
              animation: "feedback-progress 2s ease-in-out infinite",
            }}
          />
        </div>

        <style jsx>{`
          @keyframes feedback-progress {
            0%   { width: 0%;   margin-left: 0%; }
            50%  { width: 70%;  margin-left: 15%; }
            100% { width: 0%;   margin-left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* ─── Immersive Room Container ─── */}
      <div className="relative w-full min-h-[500px] overflow-hidden bg-gradient-to-b from-[#111025] via-zinc-950 to-black border border-zinc-800/80 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-between shadow-2xl">
        {/* Cinematic Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#312e810f_1px,transparent_1px),linear-gradient(to_bottom,#312e810f_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Header Control Bar */}
        <div className="relative w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-4 z-10">
          {/* Status Label */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                callStatus === CallStatus.ACTIVE && "bg-emerald-400",
                callStatus === CallStatus.CONNECTING && "bg-amber-400",
                isCallInactiveOrFinished && "bg-zinc-500"
              )} />
              <span className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                callStatus === CallStatus.ACTIVE && "bg-emerald-500",
                callStatus === CallStatus.CONNECTING && "bg-amber-500",
                isCallInactiveOrFinished && "bg-zinc-600"
              )} />
            </span>
            <span className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              {callStatus === CallStatus.ACTIVE && (isEs ? "Entrevista en curso" : "Call active")}
              {callStatus === CallStatus.CONNECTING && (isEs ? "Conectando..." : "Connecting...")}
              {isCallInactiveOrFinished && (isEs ? "Inactivo" : "Disconnected")}
            </span>
          </div>

          {/* Voice Selector */}
          <div className="flex items-center gap-2">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE}
              className="bg-zinc-900/80 text-zinc-300 border border-zinc-800 rounded-full px-4 py-1.5 text-xs outline-none focus:border-indigo-500 disabled:opacity-50 transition-all cursor-pointer font-medium hover:bg-zinc-900"
            >
              {VOICE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} className="bg-zinc-950 text-zinc-300">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. Interactive Voice Orb Visualizer */}
        <div className="relative flex flex-col items-center justify-center my-auto py-10 z-10">
          <div className="relative flex items-center justify-center">
            {/* Pulsing Concentric Aura */}
            <div className={cn(
              "absolute rounded-full border border-indigo-500/10 pointer-events-none transition-all duration-1000",
              callStatus === CallStatus.ACTIVE && isSpeaking ? "w-48 h-48 opacity-100 animate-pulse" : "w-36 h-36 opacity-30"
            )} />
            <div className={cn(
              "absolute rounded-full border border-indigo-500/5 pointer-events-none transition-all duration-1000",
              callStatus === CallStatus.ACTIVE && isSpeaking ? "w-64 h-64 opacity-100 animate-ping [animation-duration:3s]" : "w-44 h-44 opacity-0"
            )} />
            <div className={cn(
              "absolute rounded-full border border-violet-500/10 pointer-events-none transition-all duration-1000",
              callStatus === CallStatus.ACTIVE && !isSpeaking ? "w-40 h-40 opacity-100 animate-pulse [animation-duration:2s]" : "w-36 h-36 opacity-0"
            )} />

            {/* Glowing Main Orb */}
            <div className={cn(
              "z-10 flex items-center justify-center rounded-full transition-all duration-500 shadow-2xl relative overflow-hidden",
              callStatus === CallStatus.ACTIVE && isSpeaking ? "w-32 h-32 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 scale-105 shadow-purple-500/20" : "",
              callStatus === CallStatus.ACTIVE && !isSpeaking ? "w-28 h-28 bg-gradient-to-tr from-indigo-900 to-violet-950 scale-100 shadow-indigo-500/10" : "",
              callStatus === CallStatus.CONNECTING ? "w-28 h-28 bg-zinc-900 border border-amber-500/50 scale-100 shadow-amber-500/5 animate-pulse" : "",
              isCallInactiveOrFinished ? "w-28 h-28 bg-zinc-900 border border-zinc-800 scale-100 shadow-black/50" : ""
            )}>
              {/* Spinner when connecting */}
              {callStatus === CallStatus.CONNECTING && (
                <Loader2 className="h-8 w-8 text-amber-400 animate-spin" />
              )}
              {/* Audio waves when active */}
              {callStatus === CallStatus.ACTIVE && (
                <div className="flex items-center gap-1">
                  {isSpeaking ? (
                    <>
                      <div className="w-1 bg-white/90 rounded-full animate-vocalBar1 h-8" />
                      <div className="w-1 bg-white/90 rounded-full animate-vocalBar2 h-12" />
                      <div className="w-1 bg-white/90 rounded-full animate-vocalBar3 h-6" />
                      <div className="w-1 bg-white/90 rounded-full animate-vocalBar2 h-10" />
                      <div className="w-1 bg-white/90 rounded-full animate-vocalBar1 h-8" />
                    </>
                  ) : (
                    <Activity className="h-5 w-5 text-indigo-300 opacity-60 animate-pulse" />
                  )}
                </div>
              )}
              {/* Headphone icon when inactive */}
              {isCallInactiveOrFinished && (
                <Headphones className="h-8 w-8 text-zinc-500" />
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-1">
            <h4 className="text-white font-bold tracking-wide text-sm">
              {callStatus === CallStatus.ACTIVE ? (isSpeaking ? (isEs ? "Entrevistador hablando..." : "Interviewer speaking...") : (isEs ? "Escuchando..." : "Listening...")) : (isEs ? "Entrevistador IA" : "AI Interviewer")}
            </h4>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
              {callStatus === CallStatus.ACTIVE ? (isEs ? "Llamada activa" : "webrtc connected") : (isEs ? "Haga clic abajo para llamar" : "click below to connect")}
            </p>
          </div>
        </div>

        {/* 3. Subtitle / Transcript bar */}
        <div className="relative w-full min-h-[72px] bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-4 flex items-center justify-center text-center z-10 max-h-24 overflow-y-auto no-scrollbar mb-6">
          {latestMessage ? (
            <p
              key={latestMessage}
              className={cn(
                "text-xs md:text-sm leading-relaxed text-zinc-200 transition-opacity duration-300 font-light",
                "animate-fadeIn opacity-100",
              )}
            >
              {latestMessage}
            </p>
          ) : (
            <p className="text-xs text-zinc-600 italic">
              {callStatus === CallStatus.ACTIVE 
                ? (isEs ? "El audio transcrito aparecerá aquí en tiempo real..." : "Transcribed audio will appear here in real time...") 
                : (isEs ? "Esperando llamada..." : "Waiting for call...")}
            </p>
          )}
        </div>

        {/* 4. Action Button Bar */}
        <div className="relative w-full flex justify-center z-10">
          {callStatus !== CallStatus.ACTIVE ? (
            <button 
              className={cn(
                "relative flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm text-white transition-all duration-300 cursor-pointer shadow-[0_0_30px_rgba(99,102,241,0.2)] hover:scale-105",
                callStatus === CallStatus.CONNECTING 
                  ? "bg-amber-600 cursor-not-allowed shadow-[0_0_30px_rgba(245,158,11,0.2)]" 
                  : "bg-indigo-600 hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)]"
              )} 
              onClick={handleCall}
              disabled={callStatus === CallStatus.CONNECTING}
            >
              {callStatus === CallStatus.CONNECTING ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{isEs ? "Conectando..." : "Connecting..."}</span>
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 fill-white" />
                  <span>{isEs ? "Iniciar Entrevista" : "Start Interview"}</span>
                </>
              )}
            </button>
          ) : (
            <button 
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-all duration-300 hover:scale-105 cursor-pointer shadow-[0_0_30px_rgba(239,68,68,0.2)] hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]" 
              onClick={handleDisconnect}
            >
              <PhoneOff className="h-4 w-4 fill-white" />
              <span>{isEs ? "Finalizar Entrevista" : "End Interview"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Local keyframes style block */}
      <style>{`
        @keyframes vocalBarAnim1 {
          0%, 100% { height: 16px; }
          50% { height: 32px; }
        }
        @keyframes vocalBarAnim2 {
          0%, 100% { height: 24px; }
          50% { height: 44px; }
        }
        @keyframes vocalBarAnim3 {
          0%, 100% { height: 12px; }
          50% { height: 28px; }
        }
        .animate-vocalBar1 { animation: vocalBarAnim1 1s ease-in-out infinite; }
        .animate-vocalBar2 { animation: vocalBarAnim2 0.8s ease-in-out infinite; }
        .animate-vocalBar3 { animation: vocalBarAnim3 1.2s ease-in-out infinite; }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
export default Agent;

