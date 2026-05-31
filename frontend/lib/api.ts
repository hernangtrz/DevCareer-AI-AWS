/**
 * lib/api.ts
 * Funciones HTTP para CLIENT COMPONENTS.
 * No importa "next/headers" — es seguro usarlo en el browser.
 */

const API_URL = typeof window !== "undefined"
  ? "/api/proxy"
  : process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
// ─────────────────────────────────────────────
// Helper interno
// ─────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  bearerToken?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (bearerToken) {
    headers["Authorization"] = `Bearer ${bearerToken}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────
// AUTH (client-safe)
// ─────────────────────────────────────────────

export async function signUp(params: {
  uid: string;
  name: string;
  email: string;
}): Promise<{ success: boolean; message: string }> {
  try {
    return await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch (e: any) {
    return { success: false, message: e.message || "Error al crear la cuenta" };
  }
}

export async function signIn(params: {
  idToken: string;
}): Promise<{ success: boolean; sessionCookie?: string; message?: string }> {
  try {
    return await apiFetch("/auth/signin", {
      method: "POST",
      body: JSON.stringify(params),
    });
  } catch (e: any) {
    return { success: false, message: e.message || "Error al iniciar sesión" };
  }
}

// ─────────────────────────────────────────────
// ENTREVISTAS (client-safe, requieren bearerToken)
// ─────────────────────────────────────────────

export async function getInterviewsByUserId(
  bearerToken: string,
): Promise<Interview[]> {
  try {
    const res = await apiFetch<{ success: boolean; interviews: Interview[] }>(
      "/interviews/mine",
      { method: "GET" },
      bearerToken,
    );
    return res.interviews ?? [];
  } catch {
    return [];
  }
}

export async function getLatestInterviews(params: {
  limit?: number;
  bearerToken: string;
}): Promise<Interview[]> {
  const { limit = 20, bearerToken } = params;
  try {
    const res = await apiFetch<{ success: boolean; interviews: Interview[] }>(
      `/interviews/latest?limit=${limit}`,
      { method: "GET" },
      bearerToken,
    );
    return res.interviews ?? [];
  } catch {
    return [];
  }
}

export async function getInterviewById(
  id: string,
  bearerToken?: string,
): Promise<Interview | null> {
  try {
    const res = await apiFetch<{ success: boolean; interview: Interview }>(
      `/interviews/${id}`,
      { method: "GET" },
      bearerToken,
    );
    return res.interview ?? null;
  } catch {
    return null;
  }
}

export async function createInterviewFromTemplate(
  templateId: string,
  bearerToken: string,
): Promise<string | null> {
  try {
    const res = await apiFetch<{ success: boolean; interviewId: string }>(
      "/interviews/from-template",
      {
        method: "POST",
        body: JSON.stringify({ templateId }),
      },
      bearerToken,
    );
    return res.interviewId ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// FEEDBACK (client-safe, requieren bearerToken)
// ─────────────────────────────────────────────

export async function createFeedback(
  params: {
    interviewId: string;
    transcript: { role: string; content: string }[];
  },
  bearerToken: string,
): Promise<{ success: boolean; feedbackId?: string }> {
  try {
    return await apiFetch(
      "/feedback",
      {
        method: "POST",
        body: JSON.stringify(params),
      },
      bearerToken,
    );
  } catch {
    return { success: false };
  }
}

export async function getFeedbackByInterviewId(
  params: { interviewId: string },
  bearerToken: string,
): Promise<Feedback | null> {
  try {
    const res = await apiFetch<{ success: boolean; feedback: Feedback }>(
      `/feedback/${params.interviewId}`,
      { method: "GET" },
      bearerToken,
    );
    return res.feedback ?? null;
  } catch {
    return null;
  }
}
