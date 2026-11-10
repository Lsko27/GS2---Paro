"use client";

import {
  Armchair,
  CircleParking,
  Droplet,
  Heart,
  MapPin,
  Plug,
  Store,
  Toilet,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Badge } from "@/app/_components/ui/badge";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import type { EstablishmentSearchResult } from "@/app/_types/establishment";
import type { EstablishmentResource } from "@/app/_types/establishment-resources";
import OpeningStatusBadge from "@/app/_components/opening-status-badge";

type EstablishmentCardProps = {
  establishment: EstablishmentSearchResult;
  imageUrl?: string | null;
  isOpen: boolean | null;
};

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getResourceIcon(name: string) {
  switch (normalizeText(name)) {
    case "agua potavel":
      return Droplet;
    case "banheiro":
      return Toilet;
    case "area de descanso":
      return Armchair;
    case "tomada":
      return Plug;
    case "estacionamento":
      return CircleParking;
    default:
      return Store;
  }
}

const EstablishmentCard = ({
  establishment,
  imageUrl,
  isOpen,
}: EstablishmentCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const [resources, setResources] = useState<EstablishmentResource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [resourcesError, setResourcesError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResources() {
      try {
        const response = await fetch(
          `/api/establishments/${establishment.id}/resources`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load establishment resources");
        }

        const data = (await response.json()) as EstablishmentResource[];

        if (controller.signal.aborted) return;

        setResources(data.filter((resource) => resource.available));
        setResourcesError(false);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Error loading establishment resources:", error);
        setResourcesError(true);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingResources(false);
        }
      }
    }

    void loadResources();

    return () => controller.abort();
  }, [establishment.id]);

  const address = [
    establishment.street,
    establishment.number,
    establishment.neighborhood,
  ]
    .filter(Boolean)
    .join(", ");

  const showImage = Boolean(imageUrl && imageUrl !== failedImageUrl);

  return (
    <Card className="rounded-md border border-neutral-300 bg-white p-2.5 shadow-none ring-0">
      <CardContent className="flex items-center gap-3 p-0">
        <div className="relative grid aspect-square w-[44%] shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted">
          {showImage && imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Foto de ${establishment.name}`}
              fill
              sizes="(max-width: 480px) 44vw, 190px"
              className="object-cover"
              onError={() => setFailedImageUrl(imageUrl)}
            />
          ) : (
            <Store className="size-9 text-slate-500" aria-hidden="true" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <CardHeader className="flex items-center justify-between gap-1 p-0">
            <CardTitle className="min-w-0 text-lg leading-tight font-semibold text-neutral-950">
              {establishment.name}
            </CardTitle>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={
                isFavorite
                  ? `Desmarcar ${establishment.name}`
                  : `Marcar ${establishment.name} como favorito temporário`
              }
              aria-pressed={isFavorite}
              onClick={() => setIsFavorite((current) => !current)}
              className="size-8 shrink-0 rounded-full text-slate-700"
            >
              <Heart
                className={
                  isFavorite ? "size-4 fill-primary text-primary" : "size-4"
                }
                aria-hidden="true"
              />
            </Button>
          </CardHeader>

          {establishment.description && (
            <p className="line-clamp-2 text-xs text-neutral-600">
              {establishment.description}
            </p>
          )}

          <p className="flex items-start gap-2 text-sm text-neutral-800">
            <MapPin
              className="mt-0.5 size-3.5 shrink-0 text-slate-700"
              aria-hidden="true"
            />
            <span className="min-w-0">{address}</span>
          </p>

          <p className="text-xs font-medium text-teal-700">
            {establishment.distanceKm.toFixed(2)} km de distância
          </p>

          <div className="mt-1">
            <OpeningStatusBadge isOpen={isOpen} />
          </div>

          {isLoadingResources ? (
            <p className="text-xs text-neutral-500">Carregando recursos...</p>
          ) : resourcesError ? (
            <p className="text-xs text-red-600">
              Recursos indisponíveis para consulta.
            </p>
          ) : resources.length > 0 ? (
            <ul
              aria-label="Recursos disponíveis"
              className="flex flex-wrap gap-2"
            >
              {resources.map((resource) => {
                const Icon = getResourceIcon(resource.name);

                return (
                  <li
                    key={resource.id}
                    title={`${resource.name}${resource.free ? " — Gratuito" : " — Consulte as condições"}${resource.condition ? ` — ${resource.condition}` : ""}`}
                    className="grid h-6 w-9 place-items-center rounded-full border border-neutral-300"
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                    <span className="sr-only">{resource.name}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-xs text-neutral-500">
              Nenhum recurso disponível informado.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EstablishmentCard;
