"use client";

import { Building2, Clock3, Droplets, Loader2, Store } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import type { EstablishmentResource } from "@/app/_types/establishment-resources";
import ResourceManagementForm from "./resource-management-form";
import ScheduleManagementDialog from "./schedule-management-dialog";
import AccessConditionsDialog from "./access-conditions-dialog";

type ManagementPanelProps = {
  establishmentId: number;
};

const ManagementPanel = ({ establishmentId }: ManagementPanelProps) => {
  const [resources, setResources] = useState<EstablishmentResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadResources() {
      try {
        const response = await fetch(
          `/api/establishments/${establishmentId}/resources`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Não foi possível carregar os recursos.");
        }

        const data = (await response.json()) as EstablishmentResource[];

        if (!controller.signal.aborted) {
          setResources(data);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setError(
            error instanceof Error
              ? error.message
              : "Erro ao consultar recursos.",
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadResources();

    return () => controller.abort();
  }, [establishmentId]);

  return (
    <div className="grid gap-3">
      <Card className="gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-5 text-primary" />
            Estabelecimento #{establishmentId}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <Link
            href={`/establishments/${establishmentId}`}
            className="text-sm font-medium text-primary underline"
          >
            Visualizar página pública
          </Link>
        </CardContent>
      </Card>

      <ResourceManagementForm establishmentId={establishmentId} />

      <ScheduleManagementDialog establishmentId={establishmentId} />

      <AccessConditionsDialog establishmentId={establishmentId} />
    </div>
  );
};

export default ManagementPanel;
