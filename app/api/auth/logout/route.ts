import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_API_URL não configurada.");
    }

    const response = await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
        "X-XSRF-TOKEN": request.headers.get("X-XSRF-TOKEN") ?? "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Não foi possível encerrar a sessão." },
        { status: response.status },
      );
    }

    const result = new NextResponse(null, {
      status: 204,
      headers: {
        "Cache-Control": "no-store",
      },
    });

    for (const cookie of response.headers.getSetCookie()) {
      result.headers.append("Set-Cookie", cookie);
    }

    return result;
  } catch (error) {
    console.error("Erro ao encerrar sessão:", error);

    return NextResponse.json(
      { message: "Erro ao encerrar sessão." },
      { status: 502 },
    );
  }
}
