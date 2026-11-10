import { ChartNoAxesColumnIncreasing } from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import type { ImpactSummary } from "@/app/_types/impact";

interface ResourceDistributionProps {
  summary: ImpactSummary;
}

const ResourceDistribution = ({ summary }: ResourceDistributionProps) => {
  const resources = [...summary.resources].sort(
    (a, b) => b.totalEstablishments - a.totalEstablishments,
  );

  return (
    <Card className="gap-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ChartNoAxesColumnIncreasing className="size-5 text-primary" />
          Recursos oferecidos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 p-0">
        {resources.length === 0 ? (
          <p className="text-sm text-neutral-600">
            Ainda não existem recursos cadastrados na rede.
          </p>
        ) : (
          resources.map((resource) => {
            const percentage =
              summary.totalEstablishments > 0
                ? (resource.totalEstablishments / summary.totalEstablishments) *
                  100
                : 0;

            return (
              <div key={resource.name} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-neutral-800">
                    {resource.name}
                  </span>

                  <span className="text-xs font-semibold text-neutral-700">
                    {resource.totalEstablishments}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label={resource.name}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, percentage)}
                  className="h-2 overflow-hidden rounded-full bg-neutral-100"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                    }}
                  />
                </div>

                <p className="text-right text-[11px] text-neutral-500">
                  {percentage.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
                  % dos pontos
                </p>
              </div>
            );
          })
        )}

        <p className="text-xs text-neutral-500">
          Um ponto de apoio pode oferecer mais de um recurso. Por isso, os
          percentuais não precisam somar 100%.
        </p>
      </CardContent>
    </Card>
  );
};

export default ResourceDistribution;
