"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import { createFeedback } from "@/lib/api";
import { getCognitoIdToken } from "@/lib/cognito";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
  GENERATING_FEEDBACK = "GENERATING_FEEDBACK",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

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

  useEffect(() => {
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
  }, []);

  const handleGenerateFeedback = async (msgs: SavedMessage[]) => {
    console.log("Generate feedback here.");
    setCallStatus(CallStatus.GENERATING_FEEDBACK);

    try {
      // Obtener ID Token de Cognito desde localStorage
      const idToken = getCognitoIdToken();

      const { success, feedbackId: id } = await createFeedback(
        {
          interviewId: interviewId!,
          transcript: msgs,
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
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, type, userId]);

  const handleCall = async () => {
    setCallStatus(CallStatus.CONNECTING);

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
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
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
