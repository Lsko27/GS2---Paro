import { NextResponse } from "next/server";

import { api } from "@/app/_lib/api";

type ResourceApiResponse = {
  id: number;
  nome: string;
  descricao: string | null;
};

export async function GET() {
  try {
    const resources = await api<ResourceApiResponse[]>("/recursos");

    return NextResponse.json(
      resources.map((resource) => ({
        id: resource.id,
        name: resource.nome,
        description: resource.descricao,
      })),
    );
  } catch (error) {
    console.error("Error fetching resources:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar os recursos." },
      { status: 502 },
    );
  }
}
