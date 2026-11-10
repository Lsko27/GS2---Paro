import { api } from "@/app/_lib/api";
import type { EstablishmentSearchResult } from "@/app/_types/establishment";

type SearchEstablishmentsParams = {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  resourceId?: number;
};

type EstablishmentApiResponse = {
  id: number;
  nome: string;
  descricao: string | null;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  latitude: number;
  longitude: number;
  distanciaKm: number;
};

export async function searchEstablishments({
  latitude,
  longitude,
  radiusKm = 10,
  resourceId,
}: SearchEstablishmentsParams): Promise<EstablishmentSearchResult[]> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    raioKm: radiusKm.toString(),
  });

  if (resourceId !== undefined) {
    params.set("recursoId", resourceId.toString());
  }

  const establishments = await api<EstablishmentApiResponse[]>(
    `/estabelecimentos/buscar?${params.toString()}`,
  );

  return establishments.map((establishment) => ({
    id: establishment.id,
    name: establishment.nome,
    description: establishment.descricao,
    zipCode: establishment.cep,
    street: establishment.logradouro,
    number: establishment.numero,
    neighborhood: establishment.bairro,
    city: establishment.cidade,
    state: establishment.uf,
    latitude: establishment.latitude,
    longitude: establishment.longitude,
    distanceKm: establishment.distanciaKm,
  }));
}
