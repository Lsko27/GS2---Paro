import type { AuthenticatedUser } from "@/app/_types/auth";

export const getAuthenticatedUser =
  async (): Promise<AuthenticatedUser | null> => {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (response.status === 401) {
      return null;
    }

    if (!response.ok) {
      throw new Error("Não foi possível consultar o usuário autenticado.");
    }

    return (await response.json()) as AuthenticatedUser;
  };
