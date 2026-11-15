"use client";

import { ArrowUpRight, Store } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";

import ResourceManagementForm from "./resource-management-form";
import ScheduleManagementDialog from "./schedule-management-dialog";
import AccessConditionsDialog from "./access-conditions-dialog";
import EstablishmentEditDialog from "./establishment-edit-dialog";

type ManagementPanelProps = {
  establishmentId: number;
};

const ManagementPanel = ({ establishmentId }: ManagementPanelProps) => {
  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Identificação e acesso à página pública */}
      <Card className="gap-3 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none lg:rounded-[24px] lg:border-neutral-200 lg:p-6">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-3 text-base lg:text-xl">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary lg:size-12">
              <Store className="size-5 lg:size-6" aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block">Estabelecimento #{establishmentId}</span>
              <span className="mt-1 hidden text-sm font-normal text-muted-foreground lg:block">
                Gerencie as informações que aparecem para os trabalhadores.
              </span>
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0 lg:pl-[60px]">
          <Link
            href={`/establishments/${establishmentId}`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
          >
            Visualizar página pública
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </CardContent>
      </Card>

      {/* Uma coluna no Mobile; duas áreas independentes no Desktop */}
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.9fr)] lg:gap-6">
        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <ResourceManagementForm establishmentId={establishmentId} />
          <ScheduleManagementDialog establishmentId={establishmentId} />
        </div>

        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <AccessConditionsDialog establishmentId={establishmentId} />
          <EstablishmentEditDialog establishmentId={establishmentId} />
        </div>
      </div>
    </div>
  );
};

export default ManagementPanel;
