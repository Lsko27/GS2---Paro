import { NextResponse } from "next/server";

export async function PUT(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_API_URL não configurada.");
    }

    const response = await fetch(`${backendUrl}/usuarios/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
        "X-XSRF-TOKEN": request.headers.get("X-XSRF-TOKEN") ?? "",
      },
      body: await request.text(),
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
    console.error("Erro ao atualizar perfil:", error);

    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor." },
      { status: 502 },
    );
  }
}
