import { NextResponse } from "next/server";

import { forwardBackendRequest } from "@/app/_lib/forward-backend-request";

type RouteContext = {
  params: Promise<{ associationId: string }>;
};

async function getAssociationId(context: RouteContext) {
  const { associationId } = await context.params;
  const parsed = Number(associationId);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function PUT(request: Request, context: RouteContext) {
  const id = await getAssociationId(context);

  if (id === null) {
    return NextResponse.json(
      { message: "Associação inválida." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/recursos/${id}`,
    "PUT",
  );
}

export async function DELETE(request: Request, context: RouteContext) {
  const id = await getAssociationId(context);

  if (id === null) {
    return NextResponse.json(
      { message: "Associação inválida." },
      { status: 400 },
    );
  }

  return forwardBackendRequest(
    request,
    `/estabelecimentos/recursos/${id}`,
    "DELETE",
  );
}
