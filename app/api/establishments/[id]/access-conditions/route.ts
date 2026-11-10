import { NextResponse } from "next/server";

import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    return NextResponse.json(
      { message: "Estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${establishmentId}/condicoes-acesso`,
    "PATCH",
  );
}
