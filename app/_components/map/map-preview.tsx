"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import type { EstablishmentSearchResult } from "@/app/_types/establishment";
import type { MapCoordinates, MapPoint, MapView } from "./support-map";

const SupportMap = dynamic(() => import("./support-map"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center bg-neutral-900 text-sm text-white">
      Carregando mapa...
    </div>
  ),
});

type MapPreviewProps = {
  establishments: EstablishmentSearchResult[];
  center: MapCoordinates;
  userLocation?: MapCoordinates | null;
  zoom?: number;
};

const MapPreview = ({
  establishments,
  center,
  userLocation = null,
  zoom = 14,
}: MapPreviewProps) => {
  const view = useMemo<MapView>(
    () => ({
      center,
      zoom,
    }),
    [center, zoom],
  );

  const points = useMemo<MapPoint[]>(
    () =>
      establishments.map((establishment) => ({
        id: establishment.id.toString(),
        name: establishment.name,
        address: `${establishment.street}, ${establishment.number} - ${establishment.neighborhood}`,
        coordinates: [establishment.latitude, establishment.longitude],
      })),
    [establishments],
  );

  return (
    <div className="h-125 w-full overflow-hidden rounded-xl">
      <SupportMap
        view={view}
        points={points}
        userLocation={userLocation}
        searchCenter={center}
        searchRadius={5}
        focus={null}
      />
    </div>
  );
};

export default MapPreview;
