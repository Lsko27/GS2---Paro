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

export type Coordenadas = LatLngTuple;

export type VisaoMapa = {
  centro: Coordenadas;
  zoom: number;
};

export type PontoMapa = {
  id: string;
  nome: string;
  endereco: string;
  coordenadas: Coordenadas;
};

type SupportMapProps = {
  visao: VisaoMapa;
  pontos: PontoMapa[];
  localizacao: Coordenadas | null;
};

function AtualizarVisao({ visao }: { visao: VisaoMapa }) {
  const mapa = useMap();

  useEffect(() => {
    mapa.setView(visao.centro, visao.zoom);
  }, [mapa, visao]);

  return null;
}

const SupportMap = ({ visao, pontos, localizacao }: SupportMapProps) => {
  const chaveCarto = process.env.NEXT_PUBLIC_CARTO_BASEMAP_KEY?.trim();

  if (!chaveCarto) {
    return (
      <p
        role="status"
        className="grid h-full place-items-center p-4 text-center text-sm text-white"
      >
        Configure a chave da CARTO para carregar o mapa.
      </p>
    );
  }
  return (
    <MapContainer
      center={visao.centro}
      zoom={visao.zoom}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ backgroundColor: "#171717" }}
    >
      <TileLayer
        url={`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(chaveCarto)}`}
        subdomains="abcd"
        maxZoom={20}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      <AtualizarVisao visao={visao} />

      {pontos.map((ponto) => (
        <CircleMarker
          key={ponto.id}
          center={ponto.coordenadas}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#37a698",
            fillOpacity: 1,
          }}
        >
          <Popup>
            <strong>{ponto.nome}</strong>
            <br />
            {ponto.endereco}
          </Popup>
        </CircleMarker>
      ))}

      {localizacao && (
        <CircleMarker
          center={localizacao}
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
