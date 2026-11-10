import { NextResponse } from "next/server";

import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getEstablishmentId(context: RouteContext) {
  const { id } = await context.params;
  const establishmentId = Number(id);

  return Number.isSafeInteger(establishmentId) && establishmentId > 0
    ? establishmentId
    : null;
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
    `/estabelecimentos/${establishmentId}`,
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
    `/estabelecimentos/${establishmentId}`,
    "PUT",
  );
}
