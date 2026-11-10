"use client";

// @refresh reset

import "leaflet/dist/leaflet.css";

import type { LatLngTuple } from "leaflet";
import { useEffect } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

export type MapCoordinates = LatLngTuple;

export type MapView = {
  center: MapCoordinates;
  zoom: number;
};

export type MapPoint = {
  id: string;
  name: string;
  address: string;
  coordinates: MapCoordinates;
};

type SupportMapProps = {
  view: MapView;
  points: MapPoint[];
  userLocation: MapCoordinates | null;
  searchCenter: MapCoordinates;
  searchRadius: number;
};

function FitSearchRadius({
  searchCenter,
  searchRadius,
}: {
  searchCenter: MapCoordinates;
  searchRadius: number;
}) {
  const map = useMap();

  const latitude = searchCenter[0];
  const longitude = searchCenter[1];

  useEffect(() => {
    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(searchRadius) ||
      searchRadius <= 0
    ) {
      return;
    }

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

    const bounds: LatLngTuple[] = [
      [Math.max(-90, latitude - latitudeOffset), longitude - longitudeOffset],
      [Math.min(90, latitude + latitudeOffset), longitude + longitudeOffset],
    ];

    map.fitBounds(bounds, {
      padding: [20, 20],
      animate: false,
    });
  }, [map, latitude, longitude, searchRadius]);

  return null;
}

export default function SupportMap({
  view,
  points,
  userLocation,
  searchCenter,
  searchRadius,
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

      <FitSearchRadius
        searchCenter={searchCenter}
        searchRadius={searchRadius}
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
            <strong>{point.name}</strong>
            <br />
            {point.address}
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
          <Popup>Você está aqui</Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
