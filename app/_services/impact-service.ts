import "server-only";

import { api } from "@/app/_lib/api";
import type { ImpactSummary } from "@/app/_types/impact";

type ResourceImpactResponse = {
  nome: string;
  totalEstabelecimentos: number;
};

type ImpactSummaryResponse = {
  totalEstabelecimentos: number;
  totalBairros: number;
  recursos: ResourceImpactResponse[];
};

const getImpactSummary = async (): Promise<ImpactSummary> => {
  const response = await api<ImpactSummaryResponse>("/impacto/resumo");

  return {
    totalEstablishments: response.totalEstabelecimentos,
    totalNeighborhoods: response.totalBairros,
    resources: response.recursos.map((resource) => ({
      name: resource.nome,
      totalEstablishments: resource.totalEstabelecimentos,
    })),
  };
};

export default getImpactSummary;
