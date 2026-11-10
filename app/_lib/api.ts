const API_URL = process.env.BACKEND_API_URL;

if (!API_URL) {
  throw new Error("BACKEND_API_URL não configurada");
}

export async function api<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}
