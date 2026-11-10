import { NextResponse } from "next/server";

import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    return NextResponse.json(
      { message: "ID do estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${establishmentId}`,
    "GET",
  );
}
