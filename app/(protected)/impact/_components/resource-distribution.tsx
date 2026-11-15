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
    <Card className="gap-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none lg:gap-6 lg:rounded-[24px] lg:border-neutral-200 lg:p-6">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold lg:text-lg">
          <ChartNoAxesColumnIncreasing
            className="size-5 shrink-0 text-primary"
            aria-hidden="true"
          />
          Recursos oferecidos
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 p-0 lg:space-y-6">
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

            const barWidth = Math.max(0, Math.min(100, percentage));

            return (
              <div key={resource.name} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="min-w-0 text-sm font-medium text-neutral-800 lg:text-base">
                    {resource.name}
                  </span>

                  <span className="shrink-0 text-sm font-bold text-primary">
                    {resource.totalEstablishments.toLocaleString("pt-BR")}
                  </span>
                </div>

                <div
                  role="progressbar"
                  aria-label={resource.name}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={barWidth}
                  className="h-2.5 overflow-hidden rounded-full bg-neutral-100 lg:h-3"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${barWidth}%`,
                    }}
                  />
                </div>

                <p className="text-right text-[11px] text-neutral-500 lg:text-xs">
                  {percentage.toLocaleString("pt-BR", {
                    maximumFractionDigits: 1,
                  })}
                  % dos pontos
                </p>
              </div>
            );
          })
        )}

        <p className="border-t border-neutral-100 pt-4 text-xs leading-relaxed text-neutral-500">
          Um ponto de apoio pode oferecer mais de um recurso. Por isso, os
          percentuais não precisam somar 100%.
        </p>
      </CardContent>
    </Card>
  );
};

export default ResourceDistribution;
