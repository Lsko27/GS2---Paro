"use client";

// @refresh reset

import "leaflet/dist/leaflet.css";

import type { LatLngTuple } from "leaflet";
import { useEffect, useRef } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

export type MapCoordinates = LatLngTuple;

export type MapView = {
  center: MapCoordinates;
  zoom: number;
};

export type MapFocus = {
  center: MapCoordinates;
  zoom: number;
  requestId: number;
};

export type MapPoint = {
  id: string;
  name: string;
  address: string;
  coordinates: MapCoordinates;
  distanceKm: number;
};

type SupportMapProps = {
  view: MapView;
  points: MapPoint[];
  userLocation: MapCoordinates | null;
  searchCenter: MapCoordinates;
  searchRadius: number;
  focus: MapFocus | null;
};

function MapViewController({
  searchCenter,
  searchRadius,
  focus,
}: {
  searchCenter: MapCoordinates;
  searchRadius: number;
  focus: MapFocus | null;
}) {
  const map = useMap();
  const lastAreaKey = useRef<string | null>(null);
  const lastFocus = useRef<MapFocus | null>(null);

  const latitude = searchCenter[0];
  const longitude = searchCenter[1];
  const focusLatitude = focus?.center[0];
  const focusLongitude = focus?.center[1];
  const focusZoom = focus?.zoom;
  const focusRequestId = focus?.requestId;

  useEffect(() => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(searchRadius) ||
      searchRadius <= 0
    ) {
      return;
    }

    const areaKey = `${latitude}:${longitude}:${searchRadius}`;
    if (lastAreaKey.current !== areaKey) {
      lastAreaKey.current = areaKey;
      lastFocus.current = null;

      const earthRadiusKm = 6371.0088;
      const angularDistance = searchRadius / earthRadiusKm;
      const latitudeRadians = (latitude * Math.PI) / 180;
      const latitudeOffset = (angularDistance * 180) / Math.PI;
      const longitudeOffset =
        (Math.asin(
          Math.min(
            1,
            Math.sin(angularDistance) /
              Math.max(Math.abs(Math.cos(latitudeRadians)), 1e-12),
          ),
        ) *
          180) /
        Math.PI;

      map.fitBounds(
        [
          [
            Math.max(-90, latitude - latitudeOffset),
            longitude - longitudeOffset,
          ],
          [
            Math.min(90, latitude + latitudeOffset),
            longitude + longitudeOffset,
          ],
        ],
        { padding: [20, 20], animate: false },
      );
      return;
    }

    if (
      focusLatitude === undefined ||
      focusLongitude === undefined ||
      focusZoom === undefined ||
      focusRequestId === undefined
    ) {
      lastFocus.current = null;
      return;
    }

    if (
      lastFocus.current?.requestId !== focusRequestId ||
      lastFocus.current?.center[0] !== focusLatitude ||
      lastFocus.current?.center[1] !== focusLongitude ||
      lastFocus.current?.zoom !== focusZoom
    ) {
      lastFocus.current = {
        center: [focusLatitude, focusLongitude],
        zoom: focusZoom,
        requestId: focusRequestId,
      };
      map.setView([focusLatitude, focusLongitude], focusZoom, {
        animate: true,
      });
    }
  }, [
    map,
    latitude,
    longitude,
    searchRadius,
    focusLatitude,
    focusLongitude,
    focusZoom,
    focusRequestId,
  ]);

  return null;
}

export default function SupportMap({
  view,
  points,
  userLocation,
  searchCenter,
  searchRadius,
  focus,
}: SupportMapProps) {
  const cartoKey = process.env.NEXT_PUBLIC_CARTO_BASEMAP_KEY?.trim();

  if (!cartoKey) {
    return (
      <p
        role="status"
        className="grid h-full place-items-center p-4 text-center text-sm text-white"
      >
        Configure a chave da CARTO para carregar o mapa.
      </p>
    );
  }

  const tileUrl =
    "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

  return (
    <MapContainer
      center={view.center}
      zoom={view.zoom}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ backgroundColor: "#171717" }}
    >
      <TileLayer
        url={`${tileUrl}?key=${encodeURIComponent(cartoKey)}`}
        subdomains="abcd"
        maxZoom={20}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <MapViewController
        searchCenter={searchCenter}
        searchRadius={searchRadius}
        focus={focus}
      />

      <Circle
        center={searchCenter}
        radius={searchRadius * 1000}
        pathOptions={{
          color: "#37a698",
          weight: 2,
          opacity: 1,
          fillColor: "#37a698",
          fillOpacity: 0.2,
          dashArray: "6 6",
          interactive: false,
        }}
      />

      {points.map((point) => (
        <CircleMarker
          key={point.id}
          center={point.coordinates}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#37a698",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <div className="min-w-40 space-y-2">
              <h3 className="text-sm font-semibold">{point.name}</h3>

              <p className="text-xs text-neutral-600">{point.address}</p>

              <p className="text-xs font-medium text-teal-700">
                {point.distanceKm.toFixed(2)} km de distância
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}

      {userLocation && (
        <CircleMarker
          center={userLocation}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#2583eb",
            fillOpacity: 1,
          }}
        >
          <Tooltip direction="top">Você está aqui</Tooltip>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
