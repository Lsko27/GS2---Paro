import { NextResponse } from "next/server";

import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getId(context: RouteContext) {
  const { id } = await context.params;
  const parsed = Number(id);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request: Request, context: RouteContext) {
  const id = await getId(context);

  if (id === null) {
    return NextResponse.json(
      { message: "Estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${id}/recursos/gerenciar`,
    "GET",
  );
}

export async function POST(request: Request, context: RouteContext) {
  const id = await getId(context);

  if (id === null) {
    return NextResponse.json(
      { message: "Estabelecimento inválido." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/${id}/recursos`,
    "POST",
  );
}
