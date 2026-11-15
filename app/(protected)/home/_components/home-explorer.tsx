"use client";

import {
  Armchair,
  CircleParking,
  Droplet,
  LayoutGrid,
  Plug,
  Toilet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import type { EstablishmentSearchResult } from "@/app/_types/establishment";
import type {
  MapCoordinates,
  MapFocus,
  MapPoint,
  MapView,
} from "@/app/_components/map/support-map";
import SearchBar from "@/app/_components/search-bar";

const SupportMap = dynamic(() => import("@/app/_components/map/support-map"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="grid h-full place-items-center text-sm text-white"
    >
      Carregando mapa...
    </div>
  ),
});

const FALLBACK_CENTER: MapCoordinates = [-23.5631, -46.6544];
const INITIAL_MAP_VIEW: MapView = {
  center: FALLBACK_CENTER,
  zoom: 14,
};
const RADIUS_OPTIONS = [1, 3, 5, 10, 20] as const;

const filters = [
  {
    value: "water",
    label: "Água",
    resourceName: "agua potavel",
    Icon: Droplet,
  },
  {
    value: "bathroom",
    label: "Banheiro",
    resourceName: "banheiro",
    Icon: Toilet,
  },
  {
    value: "rest",
    label: "Descanso",
    resourceName: "area de descanso",
    Icon: Armchair,
  },
  { value: "outlet", label: "Tomada", resourceName: "tomada", Icon: Plug },
  {
    value: "parking",
    label: "Estacionamento",
    resourceName: "estacionamento",
    Icon: CircleParking,
  },
  { value: "all", label: "Todos", resourceName: null, Icon: LayoutGrid },
] as const;

type ResourceFilter = (typeof filters)[number]["value"];
type Resource = {
  id: number;
  name: string;
  description: string | null;
};

function normalizeText(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function matchesSearch(establishment: EstablishmentSearchResult, term: string) {
  return normalizeText(
    [
      establishment.name,
      establishment.street,
      establishment.neighborhood,
      establishment.city,
    ].join(" "),
  ).includes(term);
}

function toMapPoint(establishment: EstablishmentSearchResult): MapPoint {
  return {
    id: establishment.id.toString(),
    name: establishment.name,
    address: `${establishment.street}, ${establishment.number} - ${establishment.neighborhood}`,
    coordinates: [establishment.latitude, establishment.longitude],
    distanceKm: establishment.distanceKm,
  };
}

const HomeExplorer = () => {
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [mapFocus, setMapFocus] = useState<MapFocus | null>(null);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<ResourceFilter>("all");
  const [resources, setResources] = useState<Resource[] | null>(null);
  const [establishments, setEstablishments] = useState<
    EstablishmentSearchResult[]
  >([]);
  const [searchCenter, setSearchCenter] =
    useState<MapCoordinates>(FALLBACK_CENTER);
  const [userLocation, setUserLocation] = useState<MapCoordinates | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation || !window.isSecureContext) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates: MapCoordinates = [coords.latitude, coords.longitude];

        setUserLocation(coordinates);
        setSearchCenter(coordinates);
        setMapFocus(null);
      },
      () => {
        // Mantém a região de referência caso a localização
        // não esteja disponível ou a permissão seja negada.
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
    );
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResources() {
      try {
        const response = await fetch("/api/resources", {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load resources");
        }

        const data = (await response.json()) as Resource[];
        if (!controller.signal.aborted) setResources(data);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error("Error loading resources:", fetchError);
        setError("Não foi possível carregar os recursos.");
        setIsLoading(false);
      }
    }

    void loadResources();
    return () => controller.abort();
  }, []);

  const resourceId = useMemo(() => {
    if (selectedFilter === "all") return undefined;

    const selected = filters.find((filter) => filter.value === selectedFilter);
    const resource = resources?.find(
      (item) => normalizeText(item.name) === selected?.resourceName,
    );

    return resource?.id;
  }, [resources, selectedFilter]);

  const isResourceUnavailable =
    resources !== null && selectedFilter !== "all" && resourceId === undefined;

  useEffect(() => {
    if (!resources || isResourceUnavailable) return;

    const controller = new AbortController();

    async function loadEstablishments() {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams({
        latitude: searchCenter[0].toString(),
        longitude: searchCenter[1].toString(),
        radiusKm: searchRadius.toString(),
      });

      if (resourceId !== undefined) {
        params.set("resourceId", resourceId.toString());
      }

      try {
        const response = await fetch(
          `/api/establishments/search?${params.toString()}`,
          { signal: controller.signal, cache: "no-store" },
        );

        if (!response.ok) {
          throw new Error("Failed to search establishments");
        }

        const data = (await response.json()) as EstablishmentSearchResult[];
        if (!controller.signal.aborted) setEstablishments(data);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error("Error searching establishments:", fetchError);
        setError("Não foi possível buscar os pontos de apoio.");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadEstablishments();
    return () => controller.abort();
  }, [
    resources,
    resourceId,
    searchCenter,
    searchRadius,
    isResourceUnavailable,
  ]);

  const visibleEstablishments = useMemo(() => {
    const term = normalizeText(submittedSearch);
    if (!term) return establishments;
    return establishments.filter((establishment) =>
      matchesSearch(establishment, term),
    );
  }, [establishments, submittedSearch]);

  const points = useMemo(
    () => (isResourceUnavailable ? [] : visibleEstablishments.map(toMapPoint)),
    [visibleEstablishments, isResourceUnavailable],
  );

  function handleSearch() {
    const term = normalizeText(search);

    setSubmittedSearch(search);

    if (!term) {
      setMapFocus(null);
      return;
    }

    const firstMatch = establishments.find((establishment) =>
      matchesSearch(establishment, term),
    );

    if (firstMatch) {
      setMapFocus((previous) => ({
        center: [firstMatch.latitude, firstMatch.longitude],
        zoom: 16,
        requestId: (previous?.requestId ?? 0) + 1,
      }));
    }
  }

  function handleRadiusChange(radius: number) {
    setMapFocus(null);
    setSearchRadius(radius);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      setError("Localização indisponível neste navegador.");
      return;
    }

    if (!window.isSecureContext) {
      setError("A localização exige HTTPS ou acesso pelo localhost.");
      return;
    }

    setIsLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordinates: MapCoordinates = [coords.latitude, coords.longitude];
        setUserLocation(coordinates);
        setMapFocus(null);
        setSearchCenter(coordinates);
        setIsLocating(false);
      },
      (geolocationError) => {
        switch (geolocationError.code) {
          case 1:
            setError("Permissão de localização negada.");
            break;
          case 2:
            setError("Não foi possível obter sua localização.");
            break;
          case 3:
            setError("Tempo limite para obter a localização.");
            break;
          default:
            setError("Ocorreu um erro ao obter a localização.");
        }
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  const statusMessage = isResourceUnavailable
    ? "O recurso selecionado não foi encontrado."
    : error ||
      (isLoading
        ? "Buscando pontos de apoio..."
        : points.length === 0
          ? "Nenhum ponto encontrado."
          : "");

  return (
    <div className="lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start lg:gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">
      {/* Painel de busca e filtros */}
      <aside className="lg:rounded-[24px] lg:border lg:border-neutral-200 lg:bg-white lg:p-5 lg:shadow-sm">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-primary">
            Encontre pontos de apoio
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-neutral-600">
            Localize estabelecimentos com recursos essenciais perto de você.
          </p>
        </div>

        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          onUseMyLocation={handleUseMyLocation}
          isLocating={isLocating}
          className="lg:mx-0 lg:mt-5"
        />

        {/* Filtros por recurso */}
        <div
          role="group"
          aria-label="Filtrar pontos de apoio"
          className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 px-2 lg:mt-6 lg:grid-cols-2 lg:gap-2 lg:px-0"
        >
          {filters.map(({ value, label, Icon }) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              aria-pressed={selectedFilter === value}
              disabled={resources === null}
              onClick={() => setSelectedFilter(value)}
              className="h-10 min-w-0 gap-1.5 rounded-full px-1 text-xs aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary lg:h-11 lg:text-sm"
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </Button>
          ))}
        </div>

        {/* Raio de busca */}
        <div className="mt-4 space-y-2 px-2 lg:mt-6 lg:px-0">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Raio de busca</p>

            <span className="text-xs text-muted-foreground">
              {searchRadius} km
            </span>
          </div>

          <div
            role="group"
            aria-label="Selecionar raio de busca"
            className="grid grid-cols-5 gap-2"
          >
            {RADIUS_OPTIONS.map((radius) => (
              <Button
                key={radius}
                type="button"
                variant="outline"
                aria-pressed={searchRadius === radius}
                onClick={() => handleRadiusChange(radius)}
                className="h-9 min-w-0 rounded-full px-1 text-xs aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
              >
                {radius} km
              </Button>
            ))}
          </div>
        </div>

        {/* Resumo exclusivo do Desktop */}
        <div className="mt-6 hidden border-t border-neutral-200 pt-5 lg:block">
          <p className="text-sm font-semibold text-neutral-900">
            Resultados da busca
          </p>

          <p className="mt-2 text-sm text-neutral-600">
            {isLoading
              ? "Buscando pontos de apoio..."
              : error || isResourceUnavailable
                ? "Resultados indisponíveis."
                : `${points.length} ${
                    points.length === 1
                      ? "ponto encontrado"
                      : "pontos encontrados"
                  }`}
          </p>

          <p className="mt-2 text-xs text-neutral-500">
            Os resultados respeitam os filtros e o raio de busca selecionados.
          </p>
        </div>
      </aside>

      {/* Mapa */}
      <section
        id="mapa"
        aria-label="Mapa de pontos de apoio"
        className="relative isolate mt-4 h-82 scroll-mt-4 overflow-hidden rounded-[18px] border border-neutral-500 bg-neutral-950 lg:mt-0 lg:h-155 lg:rounded-[24px]"
      >
        <div className="absolute inset-2 overflow-hidden rounded-xl lg:inset-3 lg:rounded-[18px]">
          <SupportMap
            view={INITIAL_MAP_VIEW}
            points={points}
            userLocation={userLocation}
            searchRadius={searchRadius}
            searchCenter={searchCenter}
            focus={mapFocus}
          />
        </div>
      </section>

      {/* Mensagens de carregamento e erro */}
      {statusMessage && (
        <p
          role={error || isResourceUnavailable ? "alert" : "status"}
          className="mt-2 px-2 text-sm text-muted-foreground lg:col-start-2 lg:px-0"
        >
          {statusMessage}
        </p>
      )}
    </div>
  );
};

export default HomeExplorer;
