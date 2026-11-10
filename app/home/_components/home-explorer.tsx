"use client";

import {
  Armchair,
  CircleParking,
  Droplet,
  LayoutGrid,
  Loader2,
  LocateFixed,
  Plug,
  Search,
  Toilet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import type { EstablishmentSearchResult } from "@/app/_types/establishment";
import {
  MapCoordinates,
  MapPoint,
  MapView,
} from "@/app/_components/map/support-map";

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

const INITIAL_CENTER: MapCoordinates = [-23.5631, -46.6544];

const radiusOptions = [1, 3, 5, 10, 20] as const;

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
  {
    value: "outlet",
    label: "Tomada",
    resourceName: "tomada",
    Icon: Plug,
  },
  {
    value: "parking",
    label: "Estacionamento",
    resourceName: "estacionamento",
    Icon: CircleParking,
  },
  {
    value: "all",
    label: "Todos",
    resourceName: null,
    Icon: LayoutGrid,
  },
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

function toMapPoint(establishment: EstablishmentSearchResult): MapPoint {
  return {
    id: establishment.id.toString(),
    name: establishment.name,
    address: `${establishment.street}, ${establishment.number} - ${establishment.neighborhood}`,
    coordinates: [establishment.latitude, establishment.longitude],
  };
}

const HomeExplorer = () => {
  const [searchRadius, setSearchRadius] = useState<number>(5);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const [selectedFilter, setSelectedFilter] = useState<ResourceFilter>("all");

  const [resources, setResources] = useState<Resource[] | null>(null);

  const [establishments, setEstablishments] = useState<
    EstablishmentSearchResult[]
  >([]);

  const [searchCenter, setSearchCenter] =
    useState<MapCoordinates>(INITIAL_CENTER);

  const [mapView, setMapView] = useState<MapView>({
    center: INITIAL_CENTER,
    zoom: 14,
  });

  const [userLocation, setUserLocation] = useState<MapCoordinates | null>(null);

  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the resource catalog from the Next.js API.
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

        setResources(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Error loading resources:", error);

        setError("Não foi possível carregar os recursos.");
        setIsLoading(false);
      }
    }

    void loadResources();

    return () => controller.abort();
  }, []);

  // Find the real resource ID registered in Oracle.
  const resourceId = useMemo(() => {
    if (selectedFilter === "all") {
      return undefined;
    }

    const selected = filters.find((filter) => filter.value === selectedFilter);

    const resource = resources?.find(
      (item) => normalizeText(item.name) === selected?.resourceName,
    );

    return resource?.id;
  }, [resources, selectedFilter]);

  const isResourceUnavailable =
    resources !== null && selectedFilter !== "all" && resourceId === undefined;

  // Search the Spring Boot API whenever location or resource changes.
  useEffect(() => {
    if (!resources) return;

    if (isResourceUnavailable) return;

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
          {
            signal: controller.signal,
            cache: "no-store",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to search establishments");
        }

        const data = (await response.json()) as EstablishmentSearchResult[];

        if (controller.signal.aborted) return;

        setEstablishments(data);
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Error searching establishments:", error);

        setError("Não foi possível buscar os pontos de apoio.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
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

  // Text search applies to the establishments returned by the API.
  const visibleEstablishments = useMemo(() => {
    const term = normalizeText(submittedSearch);

    if (!term) {
      return establishments;
    }

    return establishments.filter((establishment) =>
      normalizeText(
        [
          establishment.name,
          establishment.street,
          establishment.neighborhood,
          establishment.city,
        ].join(" "),
      ).includes(term),
    );
  }, [establishments, submittedSearch]);

  const points = useMemo(
    () => (isResourceUnavailable ? [] : visibleEstablishments.map(toMapPoint)),
    [visibleEstablishments, isResourceUnavailable],
  );

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const term = normalizeText(search);

    setSubmittedSearch(search);

    const firstMatch = establishments.find((establishment) =>
      normalizeText(
        [
          establishment.name,
          establishment.street,
          establishment.neighborhood,
          establishment.city,
        ].join(" "),
      ).includes(term),
    );

    if (firstMatch) {
      setMapView({
        center: [firstMatch.latitude, firstMatch.longitude],
        zoom: 16,
      });
    }
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
        setSearchCenter(coordinates);

        setMapView({
          center: coordinates,
          zoom: 16,
        });

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
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      },
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
    <>
      <form
        role="search"
        onSubmit={handleSearch}
        className="relative z-10 mx-3 -mt-3 flex h-12 items-center rounded-full border bg-white px-1 shadow-sm focus-within:ring-2 focus-within:ring-primary/30"
      >
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label="Buscar pontos"
          className="size-8 shrink-0 rounded-full text-slate-700"
        >
          <Search className="size-4" aria-hidden="true" />
        </Button>

        <Input
          type="search"
          aria-label="Buscar endereço, bairro ou local"
          placeholder="Buscar endereço, bairro ou local"
          enterKeyHint="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-full min-w-0 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0 md:text-xs"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Usar minha localização"
          disabled={isLocating}
          onClick={handleUseMyLocation}
          className="size-8 shrink-0 rounded-full text-slate-700"
        >
          {isLocating ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <LocateFixed className="size-4" aria-hidden="true" />
          )}
        </Button>
      </form>

      <div
        role="group"
        aria-label="Filtrar pontos de apoio"
        className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 px-2"
      >
        {filters.map(({ value, label, Icon }) => (
          <Button
            key={value}
            type="button"
            variant="outline"
            aria-pressed={selectedFilter === value}
            disabled={resources === null}
            onClick={() => setSelectedFilter(value)}
            className="h-10 min-w-0 gap-1.5 rounded-full px-1 text-xs aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            {label}
          </Button>
        ))}
      </div>

      {/* Radius filter */}
      <div className="mt-4 space-y-2 px-2">
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
          {radiusOptions.map((radius) => (
            <Button
              key={radius}
              type="button"
              variant="outline"
              aria-pressed={searchRadius === radius}
              onClick={() => setSearchRadius(radius)}
              className="h-9 min-w-0 rounded-full px-1 text-xs aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
            >
              {radius} km
            </Button>
          ))}
        </div>
      </div>

      <section
        id="mapa"
        aria-label="Mapa de pontos de apoio"
        className="relative isolate mt-4 h-82 scroll-mt-4 overflow-hidden rounded-[18px] border border-neutral-500 bg-neutral-950"
      >
        <div className="absolute inset-2 overflow-hidden rounded-xl">
          <SupportMap
            view={mapView}
            points={points}
            userLocation={userLocation}
            searchRadius={searchRadius}
            searchCenter={searchCenter}
          />
        </div>
      </section>

      {statusMessage && (
        <p
          role={error ? "alert" : "status"}
          className="mt-2 px-2 text-sm text-muted-foreground"
        >
          {statusMessage}
        </p>
      )}
    </>
  );
};
export default HomeExplorer;
