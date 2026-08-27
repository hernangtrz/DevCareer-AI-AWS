import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace("/api/proxy", "");
  const search = req.nextUrl.search;
  const url = `${INTERNAL_API_URL}${path}${search}`;

  const incomingHeaders = req.headers;
  const headers: Record<string, string> = {};

  const contentType = incomingHeaders.get("content-type");
  if (contentType) {
    headers["content-type"] = contentType;
  }

  const authHeader = incomingHeaders.get("authorization");
  if (authHeader) {
    headers["authorization"] = authHeader;
  }

  let body: BodyInit | undefined = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
  }

  try {
    const res = await fetch(url, {
      method: req.method,
      headers,
      body,
    });

    const data = await res.arrayBuffer();
    const resContentType = res.headers.get("content-type") || "application/json";

    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": resContentType },
    });
  } catch (error: any) {
    console.error("[ProxyRoute] Error proxying to backend:", error?.message || error);
    return NextResponse.json(
      { success: false, message: "Error al comunicar con el backend." },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;