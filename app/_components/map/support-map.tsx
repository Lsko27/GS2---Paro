"use client";

// @refresh reset

import "leaflet/dist/leaflet.css";

import type { LatLngTuple } from "leaflet";
import { useEffect } from "react";
import {
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
};

function UpdateMapView({ view }: { view: MapView }) {
  const map = useMap();

  useEffect(() => {
    map.setView(view.center, view.zoom);
  }, [map, view.center, view.zoom]);

  return null;
}

const SupportMap = ({ view, points, userLocation }: SupportMapProps) => {
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

      <UpdateMapView view={view} />

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
};

export default SupportMap;
