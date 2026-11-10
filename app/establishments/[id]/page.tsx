import { api } from "@/app/_lib/api";
import EstablishmentDetails from "../_components/establishment-details";
import { Suspense } from "react";

export type EstablishmentDetailsData = {
  id: number;
  name: string;
  description: string | null;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  imageUrl: string | null;
};

export type EstablishmentResourceData = {
  id: number;
  resourceId: number;
  name: string;
  description: string | null;
  available: boolean;
  free: boolean;
  condition: string | null;
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
  imagemUrl: string | null;
};

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

type EstablishmentPageProps = {
  params: Promise<{ id: string }>;
};

async function EstablishmentContent({ params }: EstablishmentPageProps) {
  const { id } = await params;

  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    return <p className="p-6">Estabelecimento inválido.</p>;
  }

  const [establishmentResponse, resourcesResponse] = await Promise.all([
    api<EstablishmentApiResponse>(`/estabelecimentos/${establishmentId}`),
    api<EstablishmentResourceApiResponse[]>(
      `/estabelecimentos/${establishmentId}/recursos`,
    ),
  ]);

  const establishment: EstablishmentDetailsData = {
    id: establishmentResponse.id,
    name: establishmentResponse.nome,
    description: establishmentResponse.descricao,
    zipCode: establishmentResponse.cep,
    street: establishmentResponse.logradouro,
    number: establishmentResponse.numero,
    neighborhood: establishmentResponse.bairro,
    city: establishmentResponse.cidade,
    state: establishmentResponse.uf,
    latitude: establishmentResponse.latitude,
    longitude: establishmentResponse.longitude,
    imageUrl: establishmentResponse.imagemUrl,
  };

  const resources: EstablishmentResourceData[] = resourcesResponse.map(
    (resource) => ({
      id: resource.id,
      resourceId: resource.recursoId,
      name: resource.recursoNome,
      description: resource.recursoDescricao,
      available: resource.disponivel,
      free: resource.gratuito,
      condition: resource.condicao,
    }),
  );

  return (
    <EstablishmentDetails establishment={establishment} resources={resources} />
  );
}

export default function EstablishmentPage({ params }: EstablishmentPageProps) {
  return (
    <Suspense fallback={<EstablishmentLoading />}>
      <EstablishmentContent params={params} />
    </Suspense>
  );
}

function EstablishmentLoading() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-120 animate-pulse bg-white">
      <div className="h-72 bg-neutral-200" />

      <div className="relative -mt-6 rounded-t-[36px] bg-white px-5 pt-8">
        <div className="h-7 w-3/4 rounded-lg bg-neutral-200" />

        <div className="mt-6 h-5 w-1/2 rounded-lg bg-neutral-200" />

        <div className="mt-8 h-24 rounded-2xl bg-neutral-100" />

        <div className="mt-8 h-16 rounded-xl bg-neutral-100" />

        <div className="mt-6 h-20 rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}
