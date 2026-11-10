import { NextResponse } from "next/server";

import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

async function getEstablishmentId(context: RouteContext) {
  const { id } = await context.params;
  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    return null;
  }

  return establishmentId;
}

export async function GET(request: Request, context: RouteContext) {
  const establishmentId = await getEstablishmentId(context);

  if (establishmentId === null) {
    return NextResponse.json(
      { message: "Estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${establishmentId}/horarios`,
    "GET",
  );
}

export async function PUT(request: Request, context: RouteContext) {
  const establishmentId = await getEstablishmentId(context);

  if (establishmentId === null) {
    return NextResponse.json(
      { message: "Estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${establishmentId}/horarios`,
    "PUT",
  );
}
