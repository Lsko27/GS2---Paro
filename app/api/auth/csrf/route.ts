import { unstable_rethrow } from "next/navigation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_API_URL não configurada.");
    }

    const response = await fetch(`${backendUrl}/auth/csrf`, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    const body = await response.text();

    const result = new NextResponse(body, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });

    for (const cookie of response.headers.getSetCookie()) {
      result.headers.append("Set-Cookie", cookie);
    }

    return result;
  } catch (error) {
    unstable_rethrow(error);

    console.error("Erro ao obter token CSRF:", error);

    return NextResponse.json(
      { message: "Não foi possível iniciar a autenticação." },
      { status: 502 },
    );
  }
}
