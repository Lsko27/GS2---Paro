export type GeocodingAddress = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type GeocodingResult = {
  latitude: number;
  longitude: number;
  displayName: string;
  resultType: string;
};

export async function getCoordinatesByAddress(
  address: GeocodingAddress,
): Promise<GeocodingResult> {
  const params = new URLSearchParams(address);

  const response = await fetch(`/api/geocoding?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    throw new Error(error.message ?? "Não foi possível localizar o endereço.");
  }

  return (await response.json()) as GeocodingResult;
}
