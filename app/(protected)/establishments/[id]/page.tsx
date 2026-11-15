import { api } from "@/app/_lib/api";
import Navbar from "@/app/_components/navbar";
import type {
  EstablishmentDetailsData,
  EstablishmentResourceData,
  EstablishmentReview,
  OpeningHour,
  ReviewSummary,
} from "@/app/_types/establishment-details";
import EstablishmentDetails from "../_components/establishment-details";
import { Suspense } from "react";
import { notFound } from "next/navigation";

type EstablishmentApiResponse = {
  id: number;
  nome: string;
  descricao: string | null;
  condicoesAcesso: string | null;
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

type ResourceApiResponse = {
  id: number;
  estabelecimentoId: number;
  recursoId: number;
  recursoNome: string;
  recursoDescricao: string | null;
  disponivel: boolean;
  gratuito: boolean;
  condicao: string | null;
};

type OpeningHourApiResponse = {
  id: number;
  estabelecimentoId: number;
  diaSemana: number;
  horaAbertura: string | null;
  horaFechamento: string | null;
  fechado: boolean;
};

type ReviewApiResponse = {
  id: number;
  estabelecimentoId: number;
  usuarioId: number;
  nomeUsuario: string;
  nota: number;
  comentario: string | null;
  criadoEm: string;
  atualizadoEm: string | null;
};

type ReviewSummaryApiResponse = {
  estabelecimentoId: number;
  media: number | null;
  totalAvaliacoes: number;
};

type EstablishmentPageProps = {
  params: Promise<{ id: string }>;
};

async function EstablishmentContent({ params }: EstablishmentPageProps) {
  const { id } = await params;
  const establishmentId = Number(id);

  if (!Number.isSafeInteger(establishmentId) || establishmentId <= 0) {
    notFound();
  }

  const [
    establishmentResponse,
    resourcesResponse,
    openingHoursResponse,
    reviewsResponse,
    summaryResponse,
  ] = await Promise.all([
    api<EstablishmentApiResponse>(`/estabelecimentos/${establishmentId}`),
    api<ResourceApiResponse[]>(`/estabelecimentos/${establishmentId}/recursos`),
    api<OpeningHourApiResponse[]>(
      `/estabelecimentos/${establishmentId}/horarios`,
    ),
    api<ReviewApiResponse[]>(`/estabelecimentos/${establishmentId}/avaliacoes`),
    api<ReviewSummaryApiResponse>(
      `/estabelecimentos/${establishmentId}/avaliacoes/resumo`,
    ),
  ]);

  const establishment: EstablishmentDetailsData = {
    id: establishmentResponse.id,
    name: establishmentResponse.nome,
    description: establishmentResponse.descricao,
    accessConditions: establishmentResponse.condicoesAcesso,
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

  const openingHours: OpeningHour[] = openingHoursResponse.map((hour) => ({
    id: hour.id,
    establishmentId: hour.estabelecimentoId,
    dayOfWeek: hour.diaSemana,
    openingTime: hour.horaAbertura,
    closingTime: hour.horaFechamento,
    closed: hour.fechado,
  }));

  const reviews: EstablishmentReview[] = reviewsResponse.map((review) => ({
    id: review.id,
    establishmentId: review.estabelecimentoId,
    userId: review.usuarioId,
    userName: review.nomeUsuario,
    rating: review.nota,
    comment: review.comentario,
    createdAt: review.criadoEm,
    updatedAt: review.atualizadoEm,
  }));

  const reviewSummary: ReviewSummary = {
    establishmentId: summaryResponse.estabelecimentoId,
    average: summaryResponse.media,
    totalReviews: summaryResponse.totalAvaliacoes,
  };

  return (
    <EstablishmentDetails
      establishment={establishment}
      resources={resources}
      openingHours={openingHours}
      reviews={reviews}
      reviewSummary={reviewSummary}
      currentTime={new Date().toISOString()}
    />
  );
}

function EstablishmentLoading() {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-120 animate-pulse bg-white lg:max-w-[1440px] lg:bg-neutral-50 lg:px-8 lg:pt-7">
      <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-6">
        <div className="h-72 bg-neutral-200 lg:h-[400px] lg:rounded-3xl" />
        <div className="relative -mt-6 rounded-t-[36px] bg-white px-5 pt-8 lg:mt-0 lg:rounded-3xl lg:border lg:border-neutral-200 lg:p-8">
          <div className="h-7 w-3/4 rounded-lg bg-neutral-200" />
          <div className="mt-6 h-5 w-1/2 rounded-lg bg-neutral-200" />
          <div className="mt-8 h-24 rounded-2xl bg-neutral-100" />
        </div>
      </div>
      <div className="mt-6 grid gap-6 px-5 lg:grid-cols-2 lg:px-0">
        <div className="h-32 rounded-xl bg-neutral-100" />
        <div className="h-32 rounded-xl bg-neutral-100" />
      </div>
    </div>
  );
}

export default function EstablishmentPage({ params }: EstablishmentPageProps) {
  return (
    <>
      <div className="hidden lg:block">
        <Navbar />
      </div>
      <Suspense fallback={<EstablishmentLoading />}>
        <EstablishmentContent params={params} />
      </Suspense>
    </>
  );
}
