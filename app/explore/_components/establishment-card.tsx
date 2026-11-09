"use client";

import {
  Check,
  Droplet,
  Heart,
  MapPin,
  Plug,
  Star,
  Store,
  Toilet,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

const servicosExemplo = [
  { rotulo: "Água", Icone: Droplet },
  { rotulo: "Banheiro", Icone: Toilet },
  { rotulo: "Tomada", Icone: Plug },
];

type EstablishmentCardProps = {
  nome?: string;
  endereco?: string;
  foto?: string;
};

const EstablishmentCard = ({
  nome = "Oxxo Vila Madalena",
  endereco = "R. Cerro Corá",
  foto,
}: EstablishmentCardProps) => {
  const [favorito, setFavorito] = useState(false);
  const [fotoComErro, setFotoComErro] = useState<string | null>(null);

  return (
    <Card className="rounded-md border border-neutral-300 bg-white p-2.5 shadow-none ring-0">
      <CardContent className="flex items-center gap-3 p-0">
        <div className="relative grid aspect-square w-[44%] shrink-0 place-items-center overflow-hidden rounded-2xl bg-muted">
          {foto && foto !== fotoComErro ? (
            <Image
              src={foto}
              alt=""
              fill
              sizes="(max-width: 480px) 44vw, 190px"
              className="object-cover"
              onError={() => setFotoComErro(foto)}
            />
          ) : (
            <Store className="size-9 text-slate-500" aria-hidden="true" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <CardHeader className="flex items-center justify-between gap-1 p-0">
            <CardTitle className="text-lg leading-tight font-semibold text-neutral-950">
              {nome}
            </CardTitle>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Favoritar ${nome}`}
              aria-pressed={favorito}
              onClick={() => setFavorito((atual) => !atual)}
              className="size-8 shrink-0 rounded-full text-slate-700"
            >
              <Heart
                className={
                  favorito ? "size-4 fill-primary text-primary" : "size-4"
                }
                aria-hidden="true"
              />
            </Button>
          </CardHeader>

          <p
            className="flex items-center gap-2 text-sm
           text-neutral-800"
          >
            <Star
              className="size-3.5 shrink-0 text-slate-700"
              aria-hidden="true"
            />
            4,8 (126 avaliações)
          </p>

          <p className="flex items-center gap-2 text-sm text-neutral-800">
            <MapPin
              className="size-3.5 shrink-0 text-slate-700"
              aria-hidden="true"
            />
            {endereco}
          </p>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-200 p-2 text-sm font-medium text-green-950">
            <Check className="size-4" aria-hidden="true" />
            Aberto agora
          </span>

          <ul
            aria-label="Serviços disponíveis"
            className="flex flex-wrap gap-2"
          >
            {servicosExemplo.map(({ rotulo, Icone }) => (
              <li
                key={rotulo}
                title={rotulo}
                className="grid h-6 w-9 place-items-center rounded-full border border-neutral-300"
              >
                <Icone className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{rotulo}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstablishmentCard;
