export type ViaCepAddress = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean | "true";
};

export async function getAddressByCep(
  cep: string,
  signal?: AbortSignal,
): Promise<ViaCepAddress> {
  const cleanedCep = cep.replace(/\D/g, "");

  if (!/^\d{8}$/.test(cleanedCep)) {
    throw new Error("O CEP deve conter 8 dígitos.");
  }

  const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`, {
    signal,
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP.");
  }

  const address = (await response.json()) as ViaCepAddress;

  if (address.erro) {
    throw new Error("CEP não encontrado.");
  }

  return address;
}
