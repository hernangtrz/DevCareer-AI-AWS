import { NextRequest, NextResponse } from "next/server";

// Uses INTERNAL_API_URL when running in ECS (server-to-server inside VPC)
// Falls back to NEXT_PUBLIC_API_URL (for local dev)
const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:3001";

export async function POST(req: NextRequest) {
  try {
    // Read multipart/form-data from the browser request
    const formData = await req.formData();

    // Forward it to the Express backend as-is (fetch sets the correct Content-Type boundary automatically)
    const backendRes = await fetch(`${BACKEND_URL}/api/cv/analyze`, {
      method: "POST",
      body: formData,
    });

    const json = await backendRes.json();
    return NextResponse.json(json, { status: backendRes.status });
  } catch (error: any) {
    console.error("[/api/cv/analyze proxy] Error:", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        message:
          error?.message || "Error al conectar con el servidor de análisis.",
      },
      { status: 500 }
    );
  }
}
