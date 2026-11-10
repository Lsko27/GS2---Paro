import { NextRequest, NextResponse } from "next/server";

import { searchEstablishments } from "@/app/_services/establishment-service";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  const latitudeParam = params.get("latitude");
  const longitudeParam = params.get("longitude");
  const radiusParam = params.get("radiusKm");
  const resourceParam = params.get("resourceId");

  if (!latitudeParam || !longitudeParam) {
    return NextResponse.json(
      { error: "Latitude e longitude são obrigatórias." },
      { status: 400 },
    );
  }

  const latitude = Number(latitudeParam);
  const longitude = Number(longitudeParam);
  const radiusKm = radiusParam === null ? 5 : Number(radiusParam);

  const resourceId = resourceParam === null ? undefined : Number(resourceParam);

  const isInvalid =
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180 ||
    !Number.isFinite(radiusKm) ||
    radiusKm < 0.1 ||
    radiusKm > 50 ||
    (resourceId !== undefined &&
      (!Number.isSafeInteger(resourceId) || resourceId <= 0));

  if (isInvalid) {
    return NextResponse.json(
      { error: "Parâmetros de busca inválidos." },
      { status: 400 },
    );
  }

  try {
    const establishments = await searchEstablishments({
      latitude,
      longitude,
      radiusKm,
      resourceId,
    });

    return NextResponse.json(establishments);
  } catch (error) {
    console.error("Error searching establishments:", error);

    return NextResponse.json(
      { error: "Não foi possível buscar os estabelecimentos." },
      { status: 502 },
    );
  }
}
