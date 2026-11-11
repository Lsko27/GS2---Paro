import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  const token = request.cookies.get("paro_token")?.value;

  if (!token) {
    return NextResponse.redirect(loginUrl);
  }

  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error("BACKEND_API_URL não configurada.");

    return new NextResponse("Serviço indisponível.", {
      status: 503,
    });
  }

  try {
    const response = await fetch(`${backendUrl}/auth/me`, {
      method: "GET",
      headers: {
        Cookie: `paro_token=${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (response.status === 401 || response.status === 403) {
      const redirectResponse = NextResponse.redirect(loginUrl);

      redirectResponse.cookies.delete("paro_token");

      return redirectResponse;
    }

    if (!response.ok) {
      return new NextResponse("Não foi possível validar sua sessão.", {
        status: 503,
      });
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Erro ao validar autenticação:", error);

    return new NextResponse("Serviço de autenticação indisponível.", {
      status: 503,
    });
  }
}

export const config = {
  matcher: [
    "/home/:path*",
    "/explore/:path*",
    "/impact/:path*",
    "/profile/:path*",
    "/favorites/:path*",
    "/establishments/new/:path*",
    "/establishments/:id/manage/:path*",
  ],
};
