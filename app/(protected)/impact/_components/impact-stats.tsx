import { Armchair, Bath, MapPin, Store } from "lucide-react";

import { Card, CardContent } from "@/app/_components/ui/card";
import type { ImpactSummary } from "@/app/_types/impact";

interface ImpactStatsProps {
  summary: ImpactSummary;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const ImpactStats = ({ summary }: ImpactStatsProps) => {
  const getResourceTotal = (name: string) => {
    return (
      summary.resources.find(
        (resource) => normalizeText(resource.name) === name,
      )?.totalEstablishments ?? 0
    );
  };

  const stats = [
    {
      label: "Pontos cadastrados",
      value: summary.totalEstablishments,
      icon: Store,
    },
    {
      label: "Bairros atendidos",
      value: summary.totalNeighborhoods,
      icon: MapPin,
    },
    {
      label: "Com banheiro",
      value: getResourceTotal("banheiro"),
      icon: Bath,
    },
    {
      label: "Com descanso",
      value: getResourceTotal("area de descanso"),
      icon: Armchair,
    },
  ];

  return (
    <section className="space-y-3 lg:space-y-4">
      <h2 className="text-base font-semibold text-neutral-950 lg:text-xl">
        Nossa rede de apoio
      </h2>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="flex min-h-32 flex-col gap-3 rounded-[18px] border border-neutral-200 bg-white p-4 shadow-none lg:min-h-36 lg:rounded-[24px] lg:p-5"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </span>

            <CardContent className="mt-auto space-y-1 p-0">
              <p className="text-2xl font-bold text-neutral-950 lg:text-3xl">
                {value.toLocaleString("pt-BR")}
              </p>

              <p className="text-xs leading-relaxed text-neutral-600 lg:text-sm">
                {label}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ImpactStats;
