"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createInterviewFromTemplate } from "@/lib/api";
import { Button } from "./ui/button";
import { getCognitoIdToken } from "@/lib/cognito";

interface StartTemplateButtonProps {
  templateId: string;
  userId: string;
}

const StartTemplateButton = ({ templateId, userId }: StartTemplateButtonProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Obtener idToken del usuario autenticado en Cognito
      const idToken = getCognitoIdToken();

      const newInterviewId = await createInterviewFromTemplate(templateId, idToken);
      if (newInterviewId) {
        router.push(`/interview/${newInterviewId}`);
      } else {
        alert("Hubo un error al iniciar la entrevista. Inténtalo de nuevo.");
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert("Hubo un error al iniciar la entrevista. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleStart}
      disabled={loading}
      className="btn-primary flex-1 flex items-center justify-center gap-2 min-h-[40px] px-4 rounded-md transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-2 border-black border-t-transparent" />
          <span>Iniciando...</span>
        </>
      ) : (
        <span>Realizar entrevista</span>
      )}
    </Button>
  );
};

export default StartTemplateButton;
