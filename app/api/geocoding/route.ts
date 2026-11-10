import { NextRequest, NextResponse } from "next/server";

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
};

let lastRequestAt = 0;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const street = params.get("street")?.trim();
  const number = params.get("number")?.trim();
  const neighborhood = params.get("neighborhood")?.trim();
  const city = params.get("city")?.trim();
  const state = params.get("state")?.trim();

  if (!street || !number || !city || !state) {
    return NextResponse.json(
      { message: "Endereço incompleto." },
      { status: 400 },
    );
  }

  if (
    street.length > 150 ||
    number.length > 20 ||
    (neighborhood?.length ?? 0) > 100 ||
    city.length > 100 ||
    !/^[A-Za-z]{2}$/.test(state)
  ) {
    return NextResponse.json(
      { message: "Dados de endereço inválidos." },
      { status: 400 },
    );
  }

  // Limite simples para execução local em um único processo.
  if (Date.now() - lastRequestAt < 1100) {
    return NextResponse.json(
      { message: "Aguarde um instante antes de consultar novamente." },
      { status: 429 },
    );
  }

  lastRequestAt = Date.now();

  const address = [
    `${street}, ${number}`,
    neighborhood,
    city,
    state.toUpperCase(),
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");

  const url = new URL("https://nominatim.openstreetmap.org/search");

  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "br");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Paro-FIAP/1.0 (educational geocoding application)",
        "Accept-Language": "pt-BR",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Nominatim retornou HTTP ${response.status}`);
    }

    const results = (await response.json()) as NominatimResult[];
    const result = results[0];

    if (!result) {
      return NextResponse.json(
        { message: "Localização não encontrada para este endereço." },
        { status: 404 },
      );
    }

    const latitude = Number(result.lat);
    const longitude = Number(result.lon);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      throw new Error("Coordenadas inválidas retornadas pela API.");
    }

    return NextResponse.json(
      {
        latitude,
        longitude,
        displayName: result.display_name,
        resultType: result.type,
      },
      {
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  } catch (error) {
    console.error("Erro na geocodificação:", error);

    return NextResponse.json(
      { message: "Não foi possível consultar as coordenadas." },
      { status: 502 },
    );
  }
}
