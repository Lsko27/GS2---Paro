"use client";

import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import Footer from "@/app/_components/footer";
import Navbar from "@/app/_components/navbar";
import { useFavorites } from "@/app/_hooks/use-favorites";
import EstablishmentCard from "@/app/(protected)/explore/_components/establishment-card";

type EstablishmentResponse = {
  id?: number;
  nome?: string;
  name?: string;
  logradouro?: string;
  street?: string;
  numero?: string | number;
  number?: string | number;
  bairro?: string;
  neighborhood?: string;
  imagemUrl?: string | null;
  imageUrl?: string | null;
  endereco?: {
    logradouro?: string;
    numero?: string | number;
    bairro?: string;
  };
};

type FavoriteEstablishment = {
  id: number;
  name: string;
  street: string;
  number: string;
  neighborhood: string;
  imageUrl: string | null;
};

function mapEstablishment(
  id: number,
  data: EstablishmentResponse,
): FavoriteEstablishment {
  return {
    id,
    name: data.name ?? data.nome ?? `Ponto de apoio #${id}`,
    street: data.street ?? data.logradouro ?? data.endereco?.logradouro ?? "",
    number: String(data.number ?? data.numero ?? data.endereco?.numero ?? ""),
    neighborhood:
      data.neighborhood ?? data.bairro ?? data.endereco?.bairro ?? "",
    imageUrl: data.imageUrl ?? data.imagemUrl ?? null,
  };
}

export default function FavoritesPage() {
  const {
    favoriteIds,
    pendingIds,
    isLoadingFavorites,
    favoritesError,
    toggleFavorite,
  } = useFavorites();

  const [establishments, setEstablishments] = useState<FavoriteEstablishment[]>(
    [],
  );
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Chave estável para carregar novamente quando a lista mudar.
  const favoriteKey = [...favoriteIds].sort((a, b) => a - b).join(",");

  useEffect(() => {
    if (isLoadingFavorites) return;

    const controller = new AbortController();
    const ids = favoriteKey ? favoriteKey.split(",").map(Number) : [];

    if (ids.length === 0) {
      queueMicrotask(() => {
        if (!controller.signal.aborted) {
          setEstablishments([]);
          setIsLoadingDetails(false);
          setDetailsError(null);
        }
      });

      return () => controller.abort();
    }

    async function loadDetails() {
      setIsLoadingDetails(true);
      setDetailsError(null);

      try {
        const results = await Promise.all(
          ids.map(async (id) => {
            const response = await fetch(`/api/establishments/${id}`, {
              credentials: "include",
              cache: "no-store",
              signal: controller.signal,
            });

            if (!response.ok) {
              throw new Error(
                `Não foi possível carregar o estabelecimento ${id}.`,
              );
            }

            const data = (await response.json()) as EstablishmentResponse;

            return mapEstablishment(id, data);
          }),
        );

        if (!controller.signal.aborted) {
          setEstablishments(results);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setDetailsError(
            error instanceof Error
              ? error.message
              : "Erro ao carregar os estabelecimentos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingDetails(false);
        }
      }
    }

    void loadDetails();

    return () => controller.abort();
  }, [favoriteKey, isLoadingFavorites]);

  const visibleEstablishments = establishments.filter((establishment) =>
    favoriteIds.has(establishment.id),
  );

  const isLoading = isLoadingFavorites || isLoadingDetails;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-24">
        <div className="px-2">
          <h1 className="text-lg font-semibold text-neutral-950">
            Meus Favoritos
          </h1>

          <p className="mt-2 text-xs text-neutral-600">
            Seus pontos de apoio favoritos em um só lugar.
          </p>

          {(favoritesError || detailsError) && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {favoritesError ?? detailsError}
            </p>
          )}

          {isLoading ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 py-16"
            >
              <Loader2 className="size-7 animate-spin text-primary" />

              <p className="text-sm text-neutral-600">
                Carregando favoritos...
              </p>
            </div>
          ) : favoriteIds.size === 0 ? (
            <div className="flex flex-col items-center gap-4 py-16 text-center">
              <Heart className="size-10 text-neutral-400" />

              <h2 className="font-semibold text-neutral-950">
                Nenhum favorito ainda
              </h2>

              <p className="text-sm text-neutral-600">
                Explore os pontos de apoio e salve seus preferidos.
              </p>

              <Link
                href="/explore"
                className="inline-flex h-10 items-center justify-center rounded-full bg-paro-orange px-5 text-sm font-medium text-white hover:bg-paro-orange/90"
              >
                Explorar pontos
              </Link>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4">
              <p className="text-xs text-neutral-500">
                {favoriteIds.size}{" "}
                {favoriteIds.size === 1 ? "ponto salvo" : "pontos salvos"}
              </p>

              {visibleEstablishments.length === 0 && detailsError ? (
                <p className="text-sm text-neutral-600">
                  Não foi possível exibir os pontos favoritos.
                </p>
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
          )}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white">
        <Footer />
      </div>
    </div>
  );
}
