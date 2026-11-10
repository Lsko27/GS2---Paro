"use client";

import { Loader2, LocateFixed, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import Footer from "../_components/footer";
import Navbar from "../_components/navbar";
import { Button } from "../_components/ui/button";
import type { EstablishmentSearchResult } from "../_types/establishment";
import EstablishmentCard from "./_components/establishment-card";

const SEARCH_RADIUS_KM = 5;

type UserLocation = {
  latitude: number;
  longitude: number;
};

function getGeolocationErrorMessage(error: GeolocationPositionError) {
  switch (error.code) {
    case 1:
      return "Permissão de localização negada. Habilite a localização nas configurações do navegador e tente novamente.";

    case 2:
      return "Não foi possível determinar sua localização. Verifique se o serviço de localização está ativado.";

    case 3:
      return "A localização demorou para responder. Tente novamente.";

    default:
      return "Não foi possível obter sua localização.";
  }
}

const ExplorePage = () => {
  const [establishments, setEstablishments] = useState<
    EstablishmentSearchResult[]
  >([]);

  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchVersion, setSearchVersion] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function loadEstablishments(position: GeolocationPosition) {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      if (cancelled) return;

      setLocation({ latitude, longitude });

      try {
        const params = new URLSearchParams({
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        });

        const response = await fetch(
          `/api/establishments/search?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Não foi possível buscar os pontos de apoio.");
        }

        const data = (await response.json()) as EstablishmentSearchResult[];

        if (cancelled) return;

        setEstablishments(data);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        setError(
          error instanceof Error
            ? error.message
            : "Erro ao carregar estabelecimentos.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    if (!navigator.geolocation) {
      queueMicrotask(() => {
        if (cancelled) return;

        setError("Seu navegador não suporta geolocalização.");
        setIsLoading(false);
      });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (cancelled) return;
          void loadEstablishments(position);
        },
        (geolocationError) => {
          if (cancelled) return;

          setError(getGeolocationErrorMessage(geolocationError));
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    }

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [searchVersion]);

  const handleRefresh = () => {
    setIsLoading(true);
    setError(null);
    setSearchVersion((version) => version + 1);
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-24">
        <div className="px-2">
          <h1 className="text-lg leading-tight font-semibold text-neutral-950">
            Pontos de apoio perto de você
          </h1>

          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-800">
              <MapPin
                className="size-4 shrink-0 text-slate-700"
                aria-hidden="true"
              />

              <span className="truncate">
                {location
                  ? "Próximos à sua localização atual"
                  : "Aguardando localização"}
              </span>
            </p>

            <span className="shrink-0 text-[10px] text-neutral-600">
              Raio de {SEARCH_RADIUS_KM} km
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-neutral-500">
              <LocateFixed className="size-3.5" />
              Localização do dispositivo
            </span>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isLoading}
              onClick={handleRefresh}
              className="h-8 gap-1.5 text-xs"
            >
              <RefreshCw
                className={`size-3.5 ${isLoading ? "animate-spin" : ""}`}
              />
              Atualizar
            </Button>
          </div>

          <div className="mt-4 flex flex-col gap-4">
            {isLoading ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 py-16 text-center"
              >
                <Loader2 className="size-7 animate-spin text-primary" />

                <p className="text-sm text-neutral-600">
                  Obtendo sua localização e buscando pontos de apoio...
                </p>
              </div>
            ) : error ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-4 py-12 text-center"
              >
                <MapPin className="size-8 text-neutral-400" />

                <p className="max-w-70 text-sm text-neutral-600">{error}</p>

                <Button
                  type="button"
                  onClick={handleRefresh}
                  className="rounded-full bg-paro-orange text-white hover:bg-paro-orange/90"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : establishments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <MapPin className="size-8 text-neutral-400" />

                <p className="text-sm text-neutral-600">
                  Nenhum ponto de apoio encontrado em um raio de{" "}
                  {SEARCH_RADIUS_KM} km da sua localização.
                </p>
              </div>
            ) : (
              establishments.map((establishment) => (
                <Link
                  key={establishment.id}
                  href={`/establishments/${establishment.id}`}
                  className="block"
                >
                  <EstablishmentCard
                    establishment={establishment}
                    imageUrl={establishment.imageUrl}
                  />
                </Link>
              ))
            )}
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
};

export default ExplorePage;
