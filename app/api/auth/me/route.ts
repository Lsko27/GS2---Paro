import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_API_URL não configurada.");
    }

    const response = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
      },
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json(
        { message: "Usuário não autenticado." },
        { status: 401 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: "Não foi possível consultar o usuário." },
        { status: response.status },
      );
    }

    const user = await response.json();

    return NextResponse.json(user, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Erro ao consultar sessão:", error);

    return NextResponse.json(
      { message: "Erro ao consultar sessão." },
      { status: 502 },
    );
  }
}
