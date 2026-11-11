"use client";

import { useCallback, useEffect, useState } from "react";

type FavoriteResponse = {
  id: number;
  estabelecimentoId: number;
};

type CsrfResponse = {
  headerName: string;
  token: string;
};

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(() => new Set());
  const [pendingIds, setPendingIds] = useState<Set<number>>(() => new Set());
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);
  const [favoritesError, setFavoritesError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadFavorites() {
      try {
        const response = await fetch("/api/favorites", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          // Visitantes podem explorar os estabelecimentos
          // sem uma lista pessoal de favoritos.
          if (!controller.signal.aborted) {
            setFavoriteIds(new Set());
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Não foi possível carregar os favoritos.");
        }

        const data = (await response.json()) as FavoriteResponse[];

        if (!Array.isArray(data)) {
          throw new Error("Resposta de favoritos inválida.");
        }

        if (!controller.signal.aborted) {
          setFavoriteIds(
            new Set(data.map((favorite) => favorite.estabelecimentoId)),
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setFavoritesError(
            error instanceof Error
              ? error.message
              : "Erro ao carregar favoritos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingFavorites(false);
        }
      }
    }

    void loadFavorites();

    return () => controller.abort();
  }, []);

  const toggleFavorite = useCallback(
    async (establishmentId: number) => {
      if (isLoadingFavorites || pendingIds.has(establishmentId)) {
        return;
      }

      const isFavorite = favoriteIds.has(establishmentId);

      setPendingIds((current) => new Set(current).add(establishmentId));
      setFavoritesError(null);

      try {
        const csrfResponse = await fetch("/api/auth/csrf", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!csrfResponse.ok) {
          throw new Error("Não foi possível obter o token CSRF.");
        }

        const csrf = (await csrfResponse.json()) as CsrfResponse;

        if (csrf.headerName !== "X-XSRF-TOKEN" || !csrf.token) {
          throw new Error("Token CSRF inválido.");
        }

        const response = await fetch(`/api/favorites/${establishmentId}`, {
          method: isFavorite ? "DELETE" : "POST",
          credentials: "include",
          headers: {
            "X-XSRF-TOKEN": csrf.token,
          },
        });

        if (response.status === 401) {
          throw new Error("Faça login para gerenciar seus favoritos.");
        }

        if (!response.ok) {
          throw new Error(
            `Não foi possível atualizar o favorito (${response.status}).`,
          );
        }

        setFavoriteIds((current) => {
          const updated = new Set(current);

          if (isFavorite) {
            updated.delete(establishmentId);
          } else {
            updated.add(establishmentId);
          }

          return updated;
        });
      } catch (error) {
        setFavoritesError(
          error instanceof Error
            ? error.message
            : "Não foi possível atualizar o favorito.",
        );
      } finally {
        setPendingIds((current) => {
          const updated = new Set(current);
          updated.delete(establishmentId);
          return updated;
        });
      }
    },
    [favoriteIds, isLoadingFavorites, pendingIds],
  );

  return {
    favoriteIds,
    pendingIds,
    isLoadingFavorites,
    favoritesError,
    toggleFavorite,
  };
}
