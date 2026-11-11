import { unstable_rethrow } from "next/navigation";
import { connection, NextResponse } from "next/server";

import { api } from "@/app/_lib/api";

type ResourceApiResponse = {
  id: number;
  nome: string;
  descricao: string | null;
};

export async function GET() {
  // Executa a consulta somente durante uma requisição real.
  await connection();

  try {
    const resources = await api<ResourceApiResponse[]>("/recursos");

    return NextResponse.json(
      resources.map((resource) => ({
        id: resource.id,
        name: resource.nome,
        description: resource.descricao,
      })),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    unstable_rethrow(error);

    console.error("Erro ao buscar recursos:", error);

    return NextResponse.json(
      { error: "Não foi possível carregar os recursos." },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
