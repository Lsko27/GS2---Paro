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
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-neutral-950">
        Nossa rede de apoio
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card
            key={label}
            className="gap-3 rounded-[18px] border border-neutral-200 bg-white p-4 shadow-none"
          >
            <Icon className="size-5 text-primary" aria-hidden="true" />

            <CardContent className="space-y-1 p-0">
              <p className="text-2xl font-bold text-neutral-950">
                {value.toLocaleString("pt-BR")}
              </p>

              <p className="text-xs text-neutral-600">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default ImpactStats;
