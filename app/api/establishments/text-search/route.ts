import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term")?.trim();

  if (!term) {
    return Response.json([]);
  }

  if (term.length > 100) {
    return Response.json(
      { message: "A pesquisa deve possuir no máximo 100 caracteres." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/pesquisar?termo=${encodeURIComponent(term)}`,
    "GET",
  );
}
