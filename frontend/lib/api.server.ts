/**
 * lib/api.server.ts
 * Funciones exclusivas para SERVER COMPONENTS.
 * Usa "next/headers" — NO importar desde Client Components.
 */

import { cookies } from "next/headers";

// Para SSR usa el ALB interno, para el browser usa la URL pública
const API_URL = process.env.INTERNAL_API_URL 
  || process.env.NEXT_PUBLIC_API_URL 
  || "http://localhost:3001";

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

export async function verifySession(
  sessionCookie: string,
): Promise<{ success: boolean; user?: User }> {
  try {
    return await apiFetch("/auth/verify-session", {
      method: "POST",
      body: JSON.stringify({ sessionCookie }),
    });
  } catch {
    return { success: false };
  }
}

/**
 * getCurrentUser — solo para Server Components.
 * Lee la cookie "session" y verifica con el backend.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    if (!sessionCookie) return null;
    const result = await verifySession(sessionCookie);
    if (!result.success || !result.user) return null;
    return result.user;
  } catch {
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

/**
 * getSessionCookie — helper para pasar el token a las funciones de api.ts
 * desde Server Components.
 */
export async function getSessionCookie(): Promise<string> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("session")?.value ?? "";
  } catch {
    return "";
  }
}
