import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!/^[1-9]\d*$/.test(id)) {
    return Response.json(
      { message: "ID do estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${id}/avaliacoes/resumo`,
    "GET",
  );
}
