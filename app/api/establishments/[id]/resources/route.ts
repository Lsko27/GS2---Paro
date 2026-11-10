import { NextResponse } from "next/server";

import { api } from "@/app/_lib/api";

type EstablishmentResourceApiResponse = {
  id: number;
  estabelecimentoId: number;
  recursoId: number;
  recursoNome: string;
  recursoDescricao: string | null;
  disponivel: boolean;
  gratuito: boolean;
  condicao: string | null;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    return NextResponse.json(
      { error: "Invalid establishment ID" },
      { status: 400 },
    );
  }

  try {
    const resources = await api<EstablishmentResourceApiResponse[]>(
      `/estabelecimentos/${establishmentId}/recursos`,
    );

    return NextResponse.json(
      resources.map((resource) => ({
        id: resource.id,
        resourceId: resource.recursoId,
        name: resource.recursoNome,
        description: resource.recursoDescricao,
        available: resource.disponivel,
        free: resource.gratuito,
        condition: resource.condicao,
      })),
    );
  } catch (error) {
    console.error("Error fetching establishment resources:", error);

    return NextResponse.json(
      { error: "Failed to fetch establishment resources" },
      { status: 502 },
    );
  }
}
