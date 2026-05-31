/**
 * app/api/auth/session/route.ts
 *
 * POST  — recibe { sessionCookie } del cliente y lo guarda como cookie httpOnly
 *         para que los Server Components puedan leerla.
 * DELETE — borra la cookie "session" (logout).
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function POST(req: NextRequest) {
  try {
    const { sessionCookie } = await req.json();

    if (!sessionCookie || typeof sessionCookie !== "string") {
      return NextResponse.json(
        { success: false, message: "sessionCookie requerido" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("session", sessionCookie, {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: false,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error al guardar sesión" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, message: "Error al cerrar sesión" },
      { status: 500 },
    );
  }
}
