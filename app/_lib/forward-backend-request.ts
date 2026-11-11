import "server-only";

import { NextResponse } from "next/server";
import { unstable_rethrow } from "next/navigation";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function forwardBackendRequest(
  request: Request,
  endpoint: string,
  method: HttpMethod,
) {
  try {
    const backendUrl = process.env.BACKEND_API_URL;

    if (!backendUrl) {
      throw new Error("BACKEND_API_URL não configurada.");
    }

    const hasBody = ["POST", "PUT", "PATCH"].includes(method);

    const body = hasBody ? await request.text() : undefined;

    const response = await fetch(`${backendUrl}${endpoint}`, {
      method,
      headers: {
        Cookie: request.headers.get("cookie") ?? "",
        "X-XSRF-TOKEN": request.headers.get("X-XSRF-TOKEN") ?? "",
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });

    const responseBody = await response.text();

    const result = new NextResponse(
      response.status === 204 ? null : responseBody,
      {
        status: response.status,
        headers: {
          "Content-Type":
            response.headers.get("Content-Type") ?? "application/json",
          "Cache-Control": "no-store",
        },
      },
    );

    for (const cookie of response.headers.getSetCookie()) {
      result.headers.append("Set-Cookie", cookie);
    }

    return result;
  } catch (error) {
    unstable_rethrow(error);

    console.error("Erro na comunicação com o backend:", error);

    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor." },
      { status: 502 },
    );
  }
}
