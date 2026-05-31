import { NextRequest, NextResponse } from "next/server";

const INTERNAL_API_URL = process.env.INTERNAL_API_URL 
  || process.env.NEXT_PUBLIC_API_URL 
  || "http://localhost:3001";

async function handler(req: NextRequest) {
  const path = req.nextUrl.pathname.replace("/api/proxy", "");
  const search = req.nextUrl.search;
  const url = `${INTERNAL_API_URL}${path}${search}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const authHeader = req.headers.get("Authorization");
  if (authHeader) headers["Authorization"] = authHeader;

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const res = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const data = await res.text();
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;