"use client";

import {
  Armchair,
  CircleParking,
  Droplet,
  LayoutGrid,
  LocateFixed,
  Plug,
  Search,
  Toilet,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useState, type FormEvent } from "react";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";

import type { Coordenadas, PontoMapa, VisaoMapa } from "./mapa-apoio";

const MapaApoio = dynamic(() => import("./mapa-apoio"), {
  ssr: false,
  loading: () => (
    <div
      role="status"
      className="grid h-full place-items-center text-sm text-white"
    >
      Carregando mapa…
    </div>
  ),
});

const filtros = [
  { valor: "agua", rotulo: "Água", Icone: Droplet },
  { valor: "banheiro", rotulo: "Banheiro", Icone: Toilet },
  { valor: "descanso", rotulo: "Descanso", Icone: Armchair },
  { valor: "tomada", rotulo: "Tomada", Icone: Plug },
  { valor: "parada", rotulo: "Parada", Icone: CircleParking },
  { valor: "todos", rotulo: "Todos", Icone: LayoutGrid },
] as const;

type Filtro = (typeof filtros)[number]["valor"];
type PontoExemplo = PontoMapa & { categorias: Exclude<Filtro, "todos">[] };

const visaoInicial: VisaoMapa = {
  centro: [-23.5631, -46.6544],
  zoom: 14,
};

const pontosExemplo: PontoExemplo[] = [
  {
    id: "paulista",
    nome: "Ponto de exemplo · Paulista",
    endereco: "Avenida Paulista, Bela Vista",
    coordenadas: [-23.5614, -46.6562],
    categorias: ["agua", "banheiro", "tomada"],
  },
  {
    id: "consolacao",
    nome: "Ponto de exemplo · Consolação",
    endereco: "Rua da Consolação, Consolação",
    coordenadas: [-23.5567, -46.6609],
    categorias: ["agua", "descanso"],
  },
  {
    id: "paraiso",
    nome: "Ponto de exemplo · Paraíso",
    endereco: "Bairro Paraíso, São Paulo",
    coordenadas: [-23.5707, -46.65],
    categorias: ["banheiro", "parada"],
  },
];

function normalizar(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const HomeExplorer = () => {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [visao, setVisao] = useState(visaoInicial);
  const [localizacao, setLocalizacao] = useState<Coordenadas | null>(null);
  const [localizando, setLocalizando] = useState(false);
  const [avisoLocalizacao, setAvisoLocalizacao] = useState("");

  const termo = normalizar(busca);
  const pontos = pontosExemplo.filter((ponto) => {
    const correspondeAoFiltro =
      filtro === "todos" || ponto.categorias.includes(filtro);

    return (
      correspondeAoFiltro &&
      normalizar(`${ponto.nome} ${ponto.endereco}`).includes(termo)
    );
  });

  function buscarPontos(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const primeiroPonto = pontos[0];

    if (primeiroPonto) {
      setVisao({ centro: primeiroPonto.coordenadas, zoom: 16 });
    }
  }

  function usarLocalizacao() {
    if (!navigator.geolocation) {
      setAvisoLocalizacao("Localização indisponível neste navegador.");
      return;
    }

    setAvisoLocalizacao("");
    setLocalizando(true);

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordenadas: Coordenadas = [coords.latitude, coords.longitude];

        setLocalizacao(coordenadas);
        setVisao({ centro: coordenadas, zoom: 16 });
        setLocalizando(false);
      },
      () => {
        setAvisoLocalizacao("Localização indisponível. Tente novamente.");
        setLocalizando(false);
      },
      { timeout: 8000 },
    );
  }

  const aviso =
    avisoLocalizacao || (pontos.length === 0 ? "Nenhum ponto encontrado." : "");

  return (
    <>
      <form
        role="search"
        onSubmit={buscarPontos}
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
          value={busca}
          onChange={(evento) => setBusca(evento.target.value)}
          className="h-full min-w-0 border-0 bg-transparent px-1 text-xs shadow-none focus-visible:ring-0 md:text-xs"
        />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Usar minha localização"
          disabled={localizando}
          onClick={usarLocalizacao}
          className="size-8 shrink-0 rounded-full text-slate-700"
        >
          <LocateFixed className="size-4" aria-hidden="true" />
        </Button>
      </form>

      <div
        role="group"
        aria-label="Filtrar pontos de apoio"
        className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2 px-2"
      >
        {filtros.map(({ valor, rotulo, Icone }) => (
          <Button
            key={valor}
            type="button"
            variant="outline"
            aria-pressed={filtro === valor}
            onClick={() => setFiltro(valor)}
            className="h-8 min-w-0 gap-1.5 rounded-full px-1 text-xs aria-pressed:border-primary aria-pressed:bg-primary/10 aria-pressed:text-primary"
          >
            <Icone className="size-4 shrink-0" aria-hidden="true" />
            {rotulo}
          </Button>
        ))}
      </div>

      <section
        id="mapa"
        aria-label="Mapa de pontos de apoio"
        className="relative isolate mt-4 h-93 scroll-mt-4 overflow-hidden rounded-[18px] border border-neutral-500 bg-neutral-950"
      >
        <div className="absolute inset-2 overflow-hidden rounded-xl">
          <MapaApoio visao={visao} pontos={pontos} localizacao={localizacao} />
        </div>
      </section>

      {aviso && (
        <p role="status" className="mt-2 px-2 text-sm text-muted-foreground">
          {aviso}
        </p>
      )}
    </>
  );
};

export default HomeExplorer;
