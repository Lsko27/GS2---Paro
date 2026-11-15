"use client";

import { ArrowRight, Heart, Loader2 } from "lucide-react";
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

  // Chave estável para atualizar os detalhes quando
  // a lista de favoritos for modificada.
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
    <div className="mx-auto flex min-h-dvh w-full max-w-120 flex-col bg-white lg:max-w-none lg:bg-neutral-50">
      <Navbar />

      <main className="flex-1 px-3 pt-4 pb-24 lg:mx-auto lg:w-full lg:max-w-360 lg:px-8 lg:py-8">
        <div className="px-2 lg:rounded-[28px] lg:border lg:border-neutral-200 lg:bg-white lg:p-8">
          {/* Cabeçalho */}
          <header className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary lg:flex">
                <Heart className="size-6" aria-hidden="true" />
              </span>

              <div className="min-w-0">
                <h1 className="text-lg font-semibold text-neutral-950 lg:text-3xl lg:font-bold lg:text-primary">
                  Meus Favoritos
                </h1>

                <p className="mt-2 text-xs text-neutral-600 lg:text-base">
                  Seus pontos de apoio favoritos em um só lugar.
                </p>
              </div>
            </div>
          </header>

          {/* Erros de carregamento */}
          {(favoritesError || detailsError) && (
            <p
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {favoritesError ?? detailsError}
            </p>
          )}

          {/* Carregamento */}
          {isLoading ? (
            <div
              role="status"
              className="flex flex-col items-center gap-3 py-16 text-center lg:py-24"
            >
              <Loader2
                className="size-7 animate-spin text-primary"
                aria-hidden="true"
              />

              <p className="text-sm text-neutral-600">
                Carregando favoritos...
              </p>
            </div>
          ) : favoriteIds.size === 0 ? (
            /* Nenhum favorito */
            <section className="mt-5 flex flex-col items-center gap-4 py-16 text-center lg:mt-8 lg:rounded-[24px] lg:border lg:border-dashed lg:border-neutral-200 lg:bg-neutral-50 lg:py-24">
              <span className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary lg:size-20">
                <Heart className="size-9 lg:size-10" aria-hidden="true" />
              </span>

              <div className="max-w-md space-y-2 px-4">
                <h2 className="text-base font-semibold text-neutral-950 lg:text-xl">
                  Nenhum favorito ainda
                </h2>

                <p className="text-sm leading-relaxed text-neutral-600 lg:text-base">
                  Explore os pontos de apoio e salve seus preferidos para
                  encontrá-los facilmente quando precisar.
                </p>
              </div>

              <Link
                href="/explore"
                className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-paro-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-paro-orange/90"
              >
                Explorar pontos
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </section>
          ) : (
            /* Lista de favoritos */
            <section className="mt-5 lg:mt-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p
                  role="status"
                  className="text-sm font-medium text-neutral-700 lg:text-base"
                >
                  {favoriteIds.size}{" "}
                  {favoriteIds.size === 1
                    ? "ponto de apoio salvo"
                    : "pontos de apoio salvos"}
                </p>

                <Link
                  href="/explore"
                  className="hidden items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-70 lg:inline-flex"
                >
                  Explorar mais pontos
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>

              {visibleEstablishments.length === 0 ? (
                <div className="mt-6 rounded-2xl border border-neutral-200 p-6 text-center">
                  <p className="text-sm text-neutral-600">
                    {detailsError
                      ? "Não foi possível exibir os pontos favoritos."
                      : "Nenhum ponto disponível para exibição."}
                  </p>
                </div>
              ) : (
                <div className="mt-4 flex flex-col gap-4 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-5 2xl:grid-cols-3">
                  {visibleEstablishments.map((establishment) => (
                    <Link
                      key={establishment.id}
                      href={`/establishments/${establishment.id}`}
                      className="block h-full"
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
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Footer exclusivo do Mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white lg:hidden">
        <Footer />
      </div>
    </div>
  );
}
