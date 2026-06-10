"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/api";
import { getCognitoIdToken } from "@/lib/cognito";
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
  { key: "jeronimo-es", label: "Alejandro (Español LatAm - Hombre)", lang: "es" },
  { key: "daniela-es", label: "Daniela (Español México - Dama)", lang: "es" },
  { key: "brooke-en", label: "Brooke (Inglés US - Dama)", lang: "en" },
  { key: "australian-en", label: "Oliver (Inglés Australia - Hombre)", lang: "en" },
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

  const isLiveKit = process.env.NEXT_PUBLIC_VOICE_PROVIDER === "livekit";

  // Mantener el ref sincronizado con el estado de mensajes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (isLiveKit) return;

    const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
    const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => setIsSpeaking(true);
    const onSpeechEnd = () => setIsSpeaking(false);

    const onError = (error: Error) => console.log("Error", error);

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [isLiveKit]);

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

    if (isLiveKit) {
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
            // Solo marcar como FINISHED si previamente estábamos conectados (ACTIVE).
            // Esto evita que un Disconnected transitorio durante la inicialización
            // dispare la redirección antes de que la llamada haya comenzado.
            setCallStatus((prev) => {
              if (prev === CallStatus.ACTIVE || prev === CallStatus.CONNECTING) {
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
        await currentRoom.localParticipant.setMicrophoneEnabled(true);
        setLkRoom(currentRoom);

      } catch (err) {
        console.error("Error al iniciar llamada con LiveKit:", err);
        // Usar INACTIVE en lugar de FINISHED para no disparar la redirección
        // cuando hay un error de conexión antes de que la llamada haya iniciado.
        setCallStatus(CallStatus.INACTIVE);
      }
    } else {
      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
            userId: userId,
          },
        });
      } else {
        let formattedQuestions = "";

        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
          },
        });
      }
    }
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    if (isLiveKit) {
      if (lkRoom) {
        lkRoom.disconnect();
      }
    } else {
      vapi.stop();
    }
  };

  const latestMessage = messages[messages.length - 1]?.content;
  const isCallInactiveOrFinished =
    callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

  // --- Pantalla de carga de feedback ---
  if (callStatus === CallStatus.GENERATING_FEEDBACK) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-16">
        {/* Spinner animado */}
        <div className="relative flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-dark-200 border-t-primary-200 animate-spin" />
          <div className="absolute w-16 h-16 rounded-full border-4 border-dark-200 border-b-primary-200 animate-spin" style={{ animationDirection: "reverse", animationDuration: "0.9s" }} />
        </div>

        {/* Texto de estado */}
        <div className="flex flex-col items-center gap-3 text-center">
          <h3 className="text-primary-100 text-xl font-semibold">
            Analizando tu entrevista...
          </h3>
          <p className="text-light-400 text-sm max-w-sm">
            Estamos generando tu retroalimentación personalizada.
            <br />
            <span className="text-primary-200 font-medium">Por favor no cierres esta página.</span>
          </p>
        </div>

        {/* Barra de progreso indeterminada */}
        <div className="w-64 h-1.5 bg-dark-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-200 rounded-full"
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
    <>
      {isLiveKit && (
        <div className="flex justify-end mb-5">
          <div className="flex flex-col gap-1.5 w-64">
            <label className="text-light-400 text-xs font-semibold">Idioma / Voz del Entrevistador</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              disabled={callStatus === CallStatus.CONNECTING || callStatus === CallStatus.ACTIVE}
              className="bg-dark-300 text-light-100 border border-dark-100 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-200 disabled:opacity-50 transition-all cursor-pointer"
            >
              {VOICE_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} className="bg-dark-300 text-light-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar_v3.png"
              alt="vapi"
              width={120}
              height={120}
              className="rounded-full object-cover size-[120px]"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Entrevistador IA</h3>
        </div>

        <div className="card-border">
          <div className="card-content">
            <Image
              src="/user-avatar.png"
              alt="user avatar"
              width={540}
              height={540}
              className="rounded-full object-cover size-[120px]"
            />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={latestMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100",
              )}
            >
              {latestMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call mt-5" onClick={handleCall}>
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden",
              )}
            />

            <span>{isCallInactiveOrFinished ? "Llamar" : ". . ."}</span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            Finalizar
          </button>
        )}
      </div>
    </>
  );
};
export default Agent;
