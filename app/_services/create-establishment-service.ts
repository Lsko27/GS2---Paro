import type { EstablishmentFormData } from "@/app/(protected)/establishments/_schemas/establishment-schema";

type EstablishmentResponse = {
  id: number;
};

type ApiError = {
  message?: string;
};

export async function createEstablishment(
  data: EstablishmentFormData,
): Promise<EstablishmentResponse> {
  const csrfResponse = await fetch("/api/auth/csrf", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  if (!csrfResponse.ok) {
    throw new Error("Não foi possível validar a sessão.");
  }

  const csrf = (await csrfResponse.json()) as {
    headerName: string;
    token: string;
  };

  if (!csrf.token || csrf.headerName !== "X-XSRF-TOKEN") {
    throw new Error("Token de segurança inválido.");
  }

  const response = await fetch("/api/establishments", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      [csrf.headerName]: csrf.token,
    },
    body: JSON.stringify({
      nome: data.name.trim(),
      descricao: data.description.trim() || null,
      cep: data.zipCode.replace(/\D/g, ""),
      logradouro: data.street.trim(),
      numero: data.number.trim(),
      bairro: data.neighborhood.trim(),
      cidade: data.city.trim(),
      uf: data.state.trim().toUpperCase(),
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      imagemUrl: data.imageUrl.trim() || null,
    }),
  });

  if (response.status === 401) {
    throw new Error("Sua sessão expirou. Faça login novamente.");
  }

  if (response.status === 403) {
    throw new Error("Você não tem permissão para cadastrar estabelecimentos.");
  }

  if (response.status === 400) {
    throw new Error("Dados inválidos. Verifique o formulário.");
  }

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as ApiError;

    throw new Error(
      errorData.message ?? "Não foi possível cadastrar o estabelecimento.",
    );
  }

  const result = (await response.json()) as EstablishmentResponse;

  if (typeof result.id !== "number") {
    throw new Error(
      "Estabelecimento criado, mas a API não retornou um ID válido.",
    );
  }

  return result;
}
