"use client";

import { useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import type { EstablishmentSearchResult } from "@/app/_types/establishment";
import type { MapCoordinates } from "./support-map";

import MapPreview from "./map-preview";

type EstablishmentMapSearchProps = {
  initialEstablishments: EstablishmentSearchResult[];
  initialCenter: MapCoordinates;
};

const EstablishmentMapSearch = ({
  initialEstablishments,
  initialCenter,
}: EstablishmentMapSearchProps) => {
  const [establishments, setEstablishments] = useState(initialEstablishments);

  const [center, setCenter] = useState<MapCoordinates>(initialCenter);

  const [userLocation, setUserLocation] = useState<MapCoordinates | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function searchNearbyEstablishments(coordinates: MapCoordinates) {
    const params = new URLSearchParams({
      latitude: coordinates[0].toString(),
      longitude: coordinates[1].toString(),
      radiusKm: "5",
    });

    const response = await fetch(
      `/api/establishments/search?${params.toString()}`,
      { cache: "no-store" },
    );

    if (!response.ok) {
      throw new Error("Não foi possível buscar pontos próximos.");
    }

    return (await response.json()) as EstablishmentSearchResult[];
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Seu navegador não oferece suporte à geolocalização.");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coordinates: MapCoordinates = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setCenter(coordinates);
        setUserLocation(coordinates);

        try {
          const results = await searchNearbyEstablishments(coordinates);

          setEstablishments(results);
        } catch {
          setError(
            "Localização obtida, mas não foi possível carregar os pontos próximos.",
          );
        } finally {
          setIsLoading(false);
        }
      },

      (geolocationError) => {
        switch (geolocationError.code) {
          case 1:
            setError(
              "Permissão de localização negada. Habilite o acesso nas configurações do navegador.",
            );
            break;

          case 2:
            setError("Não foi possível identificar sua localização.");
            break;

          case 3:
            setError("A solicitação de localização demorou demais.");
            break;

          default:
            setError("Ocorreu um erro ao obter sua localização.");
        }

        setIsLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pontos de apoio próximos</h1>

          <p className="text-sm text-muted-foreground">
            {establishments.length} estabelecimento(s) encontrado(s)
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MapPin className="size-4" />
          )}

          {isLoading ? "Obtendo localização..." : "Usar minha localização"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-500">
          {error}
        </p>
      )}

      <MapPreview
        establishments={establishments}
        center={center}
        userLocation={userLocation}
        zoom={14}
      />

      {establishments.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum ponto de apoio encontrado neste raio.
        </p>
      ) : (
        <div className="space-y-3">
          {establishments.map((establishment) => (
            <div key={establishment.id} className="rounded-lg border p-4">
              <h2 className="font-semibold">{establishment.name}</h2>

              <p className="text-sm text-muted-foreground">
                {establishment.street}, {establishment.number} -{" "}
                {establishment.neighborhood}
              </p>

              <p className="mt-2 text-sm font-medium">
                Distância: {establishment.distanceKm.toFixed(2)} km
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default EstablishmentMapSearch;
