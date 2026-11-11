import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

type RouteContext = {
  params: Promise<{ establishmentId: string }>;
};

function validateId(id: string): boolean {
  return /^[1-9]\d*$/.test(id);
}

export async function POST(request: Request, { params }: RouteContext) {
  const { establishmentId } = await params;

  if (!validateId(establishmentId)) {
    return Response.json(
      { message: "ID do estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/favoritos/${establishmentId}`,
    "POST",
  );
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { establishmentId } = await params;

  if (!validateId(establishmentId)) {
    return Response.json(
      { message: "ID do estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/favoritos/${establishmentId}`,
    "DELETE",
  );
}
