import {
  ArrowLeft,
  CarFront,
  Clock3,
  Droplets,
  MapPin,
  Navigation,
  Plug,
  Star,
  Store,
  ThumbsUp,
  Toilet,
  TreePine,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  EstablishmentDetailsData,
  EstablishmentResourceData,
} from "../[id]/page";

type EstablishmentDetailsProps = {
  establishment: EstablishmentDetailsData;
  resources: EstablishmentResourceData[];
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getResourceIcon(name: string) {
  const normalized = normalizeText(name);

  if (normalized.includes("agua")) return Droplets;
  if (normalized.includes("banheiro")) return Toilet;
  if (normalized.includes("descanso")) return TreePine;
  if (normalized.includes("tomada")) return Plug;
  if (normalized.includes("estacionamento")) return CarFront;

  return Store;
}

const EstablishmentDetails = ({
  establishment,
  resources,
}: EstablishmentDetailsProps) => {
  const availableResources = resources.filter((resource) => resource.available);

  const accessConditions = [
    ...new Set(
      availableResources
        .map((resource) => resource.condition?.trim())
        .filter((condition): condition is string => Boolean(condition)),
    ),
  ];

  const address = `${establishment.street}, ${establishment.number} - ${establishment.neighborhood}, ${establishment.city} - ${establishment.state}`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude}%2C${establishment.longitude}`;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-120 bg-white max-[480px]:max-w-none">
      <main className="pb-28">
        {/* Imagem de capa */}
        <div className="relative h-72 w-full overflow-hidden bg-neutral-200">
          {establishment.imageUrl ? (
            <Image
              src={establishment.imageUrl}
              alt={`Fachada de ${establishment.name}`}
              fill
              priority
              sizes="(max-width: 480px) 100vw, 480px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Store className="size-16 text-neutral-400" />
            </div>
          )}

          <Link
            href="/explore"
            aria-label="Voltar para explorar"
            className="absolute top-5 left-4 flex size-10 items-center justify-center rounded-full bg-white/90 shadow-sm"
          >
            <ArrowLeft className="size-5 text-neutral-900" />
          </Link>
        </div>

        {/* Conteúdo principal */}
        <div className="relative -mt-6 min-h-[60vh] rounded-t-[36px] bg-white px-5 pt-6">
          <h1 className="text-2xl font-semibold text-neutral-950">
            {establishment.name}
          </h1>

          {/* Avaliações */}
          <div className="mt-3 flex items-center gap-2">
            <Star className="size-5 text-slate-700" />
            <span className="text-sm text-neutral-600">
              Avaliações ainda não disponíveis
            </span>
          </div>

          {/* Endereço */}
          <div className="mt-5 flex items-start gap-3">
            <MapPin className="mt-0.5 size-6 shrink-0 text-slate-700" />
            <p className="text-sm leading-5 text-neutral-900">{address}</p>
          </div>

          {/* Recursos disponíveis */}
          <section className="mt-6 rounded-2xl border border-neutral-400 p-4">
            <h2 className="text-lg font-medium text-neutral-950">
              Recursos Disponíveis
            </h2>

            {availableResources.length > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {availableResources.map((resource) => {
                  const ResourceIcon = getResourceIcon(resource.name);

                  return (
                    <div
                      key={resource.id}
                      className="flex min-w-0 items-center justify-center gap-1.5 rounded-full border border-neutral-300 px-2 py-2"
                    >
                      <ResourceIcon className="size-4 shrink-0" />
                      <span className="truncate text-xs">{resource.name}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                Nenhum recurso disponível no momento.
              </p>
            )}
          </section>

          {/* Horário de funcionamento */}
          <section className="mt-7 flex items-start gap-3">
            <Clock3 className="mt-0.5 size-5 shrink-0 text-slate-700" />

            <div>
              <h2 className="text-base font-medium text-neutral-950">
                Horário de Funcionamento
              </h2>

              <p className="mt-1 text-xs text-neutral-600">
                Horário ainda não informado
              </p>
            </div>
          </section>

          {/* Condições de acesso */}
          <section className="mt-7 flex items-start gap-3">
            <ThumbsUp className="mt-0.5 size-5 shrink-0 text-slate-700" />

            <div className="min-w-0">
              <h2 className="text-base font-medium text-neutral-950">
                Condições de Acesso
              </h2>

              {accessConditions.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {accessConditions.map((condition) => (
                    <p
                      key={condition}
                      className="text-xs leading-relaxed text-neutral-800"
                    >
                      {condition}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-xs leading-relaxed text-neutral-600">
                  Condições de acesso ainda não informadas.
                </p>
              )}
            </div>
          </section>

          {/* Descrição */}
          {establishment.description && (
            <section className="mt-7">
              <h2 className="text-base font-medium text-neutral-950">
                Sobre o estabelecimento
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-neutral-700">
                {establishment.description}
              </p>
            </section>
          )}
        </div>
      </main>

      {/* Ações inferiores */}
      <footer className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-120 border-t border-neutral-300 bg-white px-5 py-4">
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            disabled
            title="Avaliações estarão disponíveis em breve"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-teal-800 text-sm font-semibold text-teal-900 opacity-60"
          >
            <Star className="size-5" />
            Avaliar ponto
          </button>

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-teal-900 text-sm font-semibold text-white"
          >
            <Navigation className="size-5" />
            Traçar rota
          </a>
        </div>
      </footer>
    </div>
  );
};

export default EstablishmentDetails;
