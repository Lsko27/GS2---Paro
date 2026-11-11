"use client";

import { Loader2, LocateFixed, MapPin, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import Footer from "@/app/_components/footer";
import Navbar from "@/app/_components/navbar";
import SearchBar from "@/app/_components/search-bar";
import { Button } from "@/app/_components/ui/button";
import { useFavorites } from "@/app/_hooks/use-favorites";
import type { EstablishmentSearchResult } from "@/app/_types/establishment";
import EstablishmentCard from "./_components/establishment-card";

const SEARCH_RADIUS_KM = 5;

type TextSearchResponse = {
  id: number;
  nome: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  imagemUrl: string | null;
  latitude: number;
  longitude: number;
};

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
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [globalResults, setGlobalResults] = useState<TextSearchResponse[]>([]);

  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const {
    favoriteIds,
    pendingIds,
    isLoadingFavorites,
    favoritesError,
    toggleFavorite,
  } = useFavorites();

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
      } catch (fetchError) {
        if (cancelled) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Erro ao carregar estabelecimentos.",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
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

  const handleUseMyLocation = () => {
    setSearch("");
    setSubmittedSearch("");
    setGlobalResults([]);
    setSearchError(null);
    handleRefresh();
  };

  const handleSearch = async () => {
    const term = search.trim();

    setSubmittedSearch(term);

    if (!term) {
      setGlobalResults([]);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await fetch(
        `/api/establishments/text-search?term=${encodeURIComponent(term)}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Não foi possível pesquisar os pontos de apoio.");
      }

      const data = (await response.json()) as TextSearchResponse[];

      setGlobalResults(data);
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "Erro ao pesquisar estabelecimentos.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const globalEstablishments = globalResults.map((item) => ({
    id: item.id,
    name: item.nome,
    street: item.logradouro,
    number: item.numero,
    neighborhood: item.bairro,
    city: item.cidade,
    imageUrl: item.imagemUrl,
  }));

  const visibleEstablishments = submittedSearch
    ? globalEstablishments
    : establishments;
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-24">
        <div className="p-2">
          <h1>
            {submittedSearch
              ? "Resultados da pesquisa"
              : "Pontos de apoio perto de você"}
          </h1>
          <div className="mt-4">
            <SearchBar
              value={search}
              onChange={setSearch}
              onSearch={handleSearch}
              onUseMyLocation={handleUseMyLocation}
              isLocating={isLoading}
              isSearching={isSearching}
              className="mx-0 mt-0 mb-5"
            />
          </div>

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

          {favoritesError && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700"
            >
              {favoritesError}
            </p>
          )}

          <div className="mt-4 flex flex-col gap-4">
            {(submittedSearch ? isSearching : isLoading) ? (
              <div
                role="status"
                className="flex flex-col items-center gap-3 py-16 text-center"
              >
                <Loader2 className="size-7 animate-spin text-primary" />

                <p className="text-sm text-neutral-600">
                  {submittedSearch
                    ? `Pesquisando pontos de apoio para "${submittedSearch}"...`
                    : "Obtendo sua localização e buscando pontos de apoio..."}
                </p>
              </div>
            ) : (submittedSearch ? searchError : error) ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-4 py-12 text-center"
              >
                <MapPin className="size-8 text-neutral-400" />

                <p className="max-w-70 text-sm text-neutral-600">
                  {submittedSearch ? searchError : error}
                </p>

                <Button
                  type="button"
                  onClick={submittedSearch ? handleSearch : handleRefresh}
                  className="rounded-full bg-paro-orange text-white hover:bg-paro-orange/90"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : visibleEstablishments.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <MapPin className="size-8 text-neutral-400" />

                <p className="text-sm text-neutral-600">
                  {submittedSearch
                    ? `Nenhum ponto encontrado para "${submittedSearch}".`
                    : `Nenhum ponto de apoio encontrado em um raio de ${SEARCH_RADIUS_KM} km da sua localização.`}
                </p>
              </div>
            ) : (
              visibleEstablishments.map((establishment) => (
                <Link
                  key={establishment.id}
                  href={`/establishments/${establishment.id}`}
                  className="block"
                >
                  <EstablishmentCard
                    establishment={establishment}
                    imageUrl={establishment.imageUrl}
                    isFavorite={favoriteIds.has(establishment.id)}
                    isFavoritePending={
                      isLoadingFavorites || pendingIds.has(establishment.id)
                    }
                    onToggleFavorite={toggleFavorite}
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
