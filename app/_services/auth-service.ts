import type { AuthenticatedUser, UpdateProfileData } from "@/app/_types/auth";

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

export const updateAuthenticatedUser = async (
  data: UpdateProfileData,
): Promise<AuthenticatedUser> => {
  const csrfResponse = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!csrfResponse.ok) {
    throw new Error("Não foi possível obter o token de segurança.");
  }

  const csrf = (await csrfResponse.json()) as {
    headerName: string;
    token: string;
  };

  if (!csrf.token || csrf.headerName !== "X-XSRF-TOKEN") {
    throw new Error("Token de segurança inválido.");
  }

  const response = await fetch("/api/users/me", {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify(data),
  });

  if (response.status === 401) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  if (response.status === 403) {
    throw new Error("Não foi possível autorizar a atualização.");
  }

  if (response.status === 409) {
    throw new Error("Este e-mail já está cadastrado.");
  }

  if (!response.ok) {
    throw new Error("Não foi possível atualizar seu perfil.");
  }

  const updatedUser = await getAuthenticatedUser();

  if (!updatedUser) {
    throw new Error("Não foi possível consultar o perfil atualizado.");
  }

  return updatedUser;
};

export const logout = async (): Promise<void> => {
  const csrfResponse = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!csrfResponse.ok) {
    throw new Error("Não foi possível obter o token de segurança.");
  }

  const csrf = (await csrfResponse.json()) as {
    headerName: string;
    token: string;
  };

  if (!csrf.token || csrf.headerName !== "X-XSRF-TOKEN") {
    throw new Error("Token de segurança inválido.");
  }

  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
    headers: {
      [csrf.headerName]: csrf.token,
    },
  });

  if (!response.ok) {
    throw new Error("Não foi possível encerrar sua sessão.");
  }
};
