"use client";

import {
  ArrowLeft,
  CarFront,
  Clock3,
  Droplets,
  MapPin,
  Navigation,
  Plug,
  Star,
  Store,
  ThumbsUp,
  Toilet,
  TreePine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import OpeningStatusBadge from "@/app/_components/opening-status-badge";
import { getOpeningStatus } from "@/app/_lib/opening-status";
import type {
  EstablishmentDetailsData,
  EstablishmentResourceData,
  EstablishmentReview,
  OpeningHour,
  ReviewSummary,
} from "@/app/_types/establishment-details";
import ReviewForm from "./review-form";

type EstablishmentDetailsProps = {
  establishment: EstablishmentDetailsData;
  resources: EstablishmentResourceData[];
  openingHours: OpeningHour[];
  reviews: EstablishmentReview[];
  reviewSummary: ReviewSummary;
  currentTime: string;
};

const WEEK_DAYS = [
  { number: 1, name: "Segunda-feira" },
  { number: 2, name: "Terça-feira" },
  { number: 3, name: "Quarta-feira" },
  { number: 4, name: "Quinta-feira" },
  { number: 5, name: "Sexta-feira" },
  { number: 6, name: "Sábado" },
  { number: 7, name: "Domingo" },
];

function groupOpeningHours(openingHours: OpeningHour[]) {
  const groups: { startDay: number; endDay: number; label: string }[] = [];

  for (const day of WEEK_DAYS) {
    const schedule = openingHours.find((hour) => hour.dayOfWeek === day.number);
    const label = !schedule
      ? "Não informado"
      : schedule.closed
        ? "Fechado"
        : `${schedule.openingTime} - ${schedule.closingTime}`;

    const previousGroup = groups[groups.length - 1];

    if (
      previousGroup &&
      previousGroup.label === label &&
      previousGroup.endDay === day.number - 1
    ) {
      previousGroup.endDay = day.number;
    } else {
      groups.push({ startDay: day.number, endDay: day.number, label });
    }
  }

  return groups;
}

function getDayLabel(startDay: number, endDay: number) {
  const start = WEEK_DAYS[startDay - 1];
  const end = WEEK_DAYS[endDay - 1];

  if (startDay === endDay) return start.name;

  return `${start.name.replace("-feira", "")} a ${end.name.replace("-feira", "")}`;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getResourceIcon(name: string) {
  const normalized = normalizeText(name);

  if (normalized.includes("agua")) return Droplets;
  if (normalized.includes("banheiro")) return Toilet;
  if (normalized.includes("descanso")) return TreePine;
  if (normalized.includes("tomada")) return Plug;
  if (normalized.includes("estacionamento")) return CarFront;

  return Store;
}

function formatReviewDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} de 5 estrelas`}
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`size-4 ${
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "text-neutral-300"
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

const EstablishmentDetails = ({
  establishment,
  resources,
  openingHours,
  reviews,
  reviewSummary,
  currentTime,
}: EstablishmentDetailsProps) => {
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const availableResources = resources.filter((resource) => resource.available);
  const address = `${establishment.street}, ${establishment.number} - ${establishment.neighborhood}, ${establishment.city} - ${establishment.state}`;
  const directionsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=` +
    `${establishment.latitude},${establishment.longitude}`;
  const isOpen = getOpeningStatus(openingHours, new Date(currentTime));
  const groupedHours = groupOpeningHours(openingHours);
  const average = reviewSummary.average;
  const formattedAverage =
    average === null
      ? null
      : average.toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        });

  const actions = (
    <div className="grid grid-cols-2 gap-3 lg:gap-4">
      <button
        type="button"
        onClick={() => setReviewDialogOpen(true)}
        className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-teal-800 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-50"
      >
        <Star className="size-5" aria-hidden="true" />
        Avaliar ponto
      </button>

      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal-900 text-sm font-semibold text-white transition-colors hover:bg-teal-800"
      >
        <Navigation className="size-5" aria-hidden="true" />
        Traçar rota
      </a>
    </div>
  );

  return (
    <div className="mx-auto min-h-dvh w-full max-w-120 bg-white lg:max-w-none lg:bg-neutral-50">
      <main className="pb-28 lg:mx-auto lg:w-full lg:max-w-[1440px] lg:px-8 lg:pt-7 lg:pb-12">
        <Link
          href="/explore"
          className="mb-4 hidden w-fit items-center gap-2 text-sm font-medium text-primary hover:underline lg:inline-flex"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar para explorar
        </Link>

        {/* Capa e resumo: uma coluna no Mobile, duas no Desktop. */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch lg:gap-6">
          <div className="relative h-72 w-full overflow-hidden bg-neutral-200 lg:h-[400px] lg:rounded-3xl">
            {establishment.imageUrl ? (
              <Image
                src={establishment.imageUrl}
                alt={`Imagem de ${establishment.name}`}
                fill
                priority
                sizes="(min-width: 1024px) 54vw, (max-width: 480px) 100vw, 480px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Store
                  className="size-16 text-neutral-400"
                  aria-hidden="true"
                />
              </div>
            )}

            <Link
              href="/explore"
              aria-label="Voltar para explorar"
              className="absolute top-5 left-4 flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm lg:hidden"
            >
              <ArrowLeft
                className="size-5 text-neutral-900"
                aria-hidden="true"
              />
            </Link>
          </div>

          <section className="relative -mt-6 rounded-t-[36px] bg-white px-5 pt-6 lg:mt-0 lg:flex lg:min-h-[400px] lg:flex-col lg:rounded-3xl lg:border lg:border-neutral-200 lg:p-8 lg:shadow-sm">
            <p className="mb-3 hidden text-xs font-semibold tracking-widest text-teal-700 uppercase lg:block">
              Ponto de apoio
            </p>

            <h1 className="text-2xl font-semibold text-neutral-950 lg:text-3xl lg:font-bold">
              {establishment.name}
            </h1>

            <div className="mt-3 flex items-center gap-2">
              <Star
                className={`size-5 ${
                  average !== null
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-700"
                }`}
                aria-hidden="true"
              />

              {formattedAverage !== null ? (
                <>
                  <span className="text-sm font-semibold text-neutral-950">
                    {formattedAverage}
                  </span>
                  <span className="text-sm text-neutral-600">
                    ({reviewSummary.totalReviews} avaliações)
                  </span>
                </>
              ) : (
                <span className="text-sm text-neutral-600">Sem avaliações</span>
              )}
            </div>

            <div className="mt-5 flex items-start gap-3">
              <MapPin
                className="mt-0.5 size-6 shrink-0 text-slate-700"
                aria-hidden="true"
              />
              <p className="text-sm leading-5 text-neutral-900 lg:leading-6">
                {address}
              </p>
            </div>

            <div className="mt-5 hidden lg:block">
              <OpeningStatusBadge isOpen={isOpen} />
            </div>

            <div className="mt-auto hidden pt-8 lg:block">{actions}</div>
          </section>
        </div>

        <div className="px-5 lg:px-0">
          {/* Recursos e horários lado a lado no Desktop. */}
          <div className="lg:mt-6 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
            <section className="mt-6 rounded-2xl border border-neutral-400 p-4 lg:mt-0 lg:min-h-full lg:border-neutral-200 lg:bg-white lg:p-6 lg:shadow-sm">
              <h2 className="text-lg font-medium text-neutral-950 lg:font-semibold">
                Recursos Disponíveis
              </h2>

              {availableResources.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {availableResources.map((resource) => {
                    const ResourceIcon = getResourceIcon(resource.name);

                    return (
                      <div
                        key={resource.id}
                        className="flex items-center gap-1.5 rounded-full border border-neutral-300 px-3 py-2"
                      >
                        <ResourceIcon
                          className="size-4 shrink-0"
                          aria-hidden="true"
                        />
                        <span className="text-xs">{resource.name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-3 text-sm text-neutral-500">
                  Nenhum recurso disponível no momento.
                </p>
              )}
            </section>

            <section className="mt-7 flex items-start gap-3 lg:mt-0 lg:min-h-full lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-6 lg:shadow-sm">
              <Clock3
                className="mt-0.5 size-5 shrink-0 text-slate-700"
                aria-hidden="true"
              />

              <div className="min-w-0 flex-1">
                <h2 className="text-base font-medium text-neutral-950 lg:text-lg lg:font-semibold">
                  Horário de Funcionamento
                </h2>

                {openingHours.length === 0 ? (
                  <p className="mt-2 text-xs text-neutral-600">
                    Horário ainda não informado.
                  </p>
                ) : (
                  <>
                    <div className="mt-3 space-y-2">
                      {groupedHours.map((group) => (
                        <div
                          key={group.startDay}
                          className="flex items-center justify-between gap-3 text-xs lg:text-sm"
                        >
                          <span className="text-neutral-700">
                            {getDayLabel(group.startDay, group.endDay)}
                          </span>
                          <span className="shrink-0 font-medium text-neutral-950">
                            {group.label.trim() === "00:00 - 00:00"
                              ? "Aberto 24h"
                              : group.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3">
                      <OpeningStatusBadge isOpen={isOpen} />
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* Informações adicionais. */}
          <div className="lg:mt-6 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-6">
            <section
              className={`mt-7 flex items-start gap-3 lg:mt-0 lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-6 lg:shadow-sm ${
                establishment.description ? "" : "lg:col-span-2"
              }`}
            >
              <ThumbsUp
                className="mt-0.5 size-5 shrink-0 text-slate-700"
                aria-hidden="true"
              />

              <div className="min-w-0">
                <h2 className="text-base font-medium text-neutral-950 lg:text-lg lg:font-semibold">
                  Condições de Acesso
                </h2>

                {establishment.accessConditions ? (
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">
                    {establishment.accessConditions}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-neutral-500">
                    Nenhuma condição informada.
                  </p>
                )}
              </div>
            </section>

            {establishment.description && (
              <section className="mt-7 lg:mt-0 lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-6 lg:shadow-sm">
                <h2 className="text-base font-medium text-neutral-950 lg:text-lg lg:font-semibold">
                  Sobre o estabelecimento
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                  {establishment.description}
                </p>
              </section>
            )}
          </div>

          {/* Avaliações: duas colunas no Desktop, lista no Mobile. */}
          <section className="mt-8 lg:mt-6 lg:rounded-2xl lg:border lg:border-neutral-200 lg:bg-white lg:p-6 lg:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-neutral-950 lg:text-lg">
                Avaliações dos usuários
              </h2>
              <span className="text-xs text-neutral-500">
                {reviewSummary.totalReviews} avaliações
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-neutral-600">
                Este estabelecimento ainda não recebeu avaliações.
              </p>
            ) : (
              <div className="mt-4 space-y-3 lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-4 lg:space-y-0">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-2xl border border-neutral-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {review.userName}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {formatReviewDate(review.createdAt)}
                        </p>
                      </div>
                      <RatingStars rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="mt-3 text-sm leading-relaxed text-neutral-700">
                        {review.comment}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Ações fixas somente no Mobile; no Desktop ficam no resumo. */}
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white px-5 py-4 lg:hidden">
        {actions}
      </footer>

      <ReviewForm
        establishmentId={establishment.id}
        open={reviewDialogOpen}
        onOpenChange={setReviewDialogOpen}
      />
    </div>
  );
};

export default EstablishmentDetails;
