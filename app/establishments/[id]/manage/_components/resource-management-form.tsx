"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Droplets, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/app/_components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import { Input } from "@/app/_components/ui/input";

import ScheduleManagementDialog from "./schedule-management-dialog";

type CatalogResource = {
  id: number;
  name: string;
  description: string | null;
};

type ResourceAssociation = {
  id: number;
  estabelecimentoId: number;
  recursoId: number;
  recursoNome: string;
  recursoDescricao: string | null;
  disponivel: boolean;
  gratuito: boolean;
  condicao: string | null;
};

const resourceSchema = z.object({
  resources: z.array(
    z.object({
      resourceId: z.number().int().positive(),
      associationId: z.number().int().positive().nullable(),
      name: z.string(),
      description: z.string().nullable(),
      enabled: z.boolean(),
      available: z.boolean(),
      free: z.boolean(),
      condition: z
        .string()
        .max(500, "A condição deve ter no máximo 500 caracteres."),
    }),
  ),
});

type ResourceFormData = z.infer<typeof resourceSchema>;
type ResourceRow = ResourceFormData["resources"][number];

type ResourceManagementFormProps = {
  establishmentId: number;
};

type ApiError = {
  message?: string;
};

async function readResponseError(response: Response) {
  const error = (await response.json().catch(() => ({}))) as ApiError;

  if (response.status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (response.status === 403) {
    return "Você não tem permissão para gerenciar este estabelecimento.";
  }

  return error.message ?? "Não foi possível concluir a operação.";
}

async function getCsrfToken() {
  const response = await fetch("/api/auth/csrf", {
    credentials: "include",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Não foi possível obter o token CSRF.");
  }

  const data = (await response.json()) as {
    headerName: string;
    token: string;
  };

  if (data.headerName !== "X-XSRF-TOKEN" || !data.token) {
    throw new Error("Token CSRF inválido.");
  }

  return data.token;
}

async function sendResourceRequest(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  csrfToken: string,
  resource?: ResourceRow,
) {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "X-XSRF-TOKEN": csrfToken,
      ...(resource ? { "Content-Type": "application/json" } : {}),
    },
    body: resource
      ? JSON.stringify({
          recursoId: resource.resourceId,
          disponivel: resource.available,
          gratuito: resource.free,
          condicao: resource.condition.trim() || null,
        })
      : undefined,
  });

  if (!response.ok) {
    throw new Error(await readResponseError(response));
  }
}

const ResourceManagementForm = ({
  establishmentId,
}: ResourceManagementFormProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadVersion, setLoadVersion] = useState(0);
  const [initialRows, setInitialRows] = useState<ResourceRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ResourceFormData>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      resources: [],
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    async function loadResources() {
      try {
        const [catalogResponse, associationsResponse] = await Promise.all([
          fetch("/api/resources", {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
          fetch(`/api/establishments/${establishmentId}/resources/manage`, {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }),
        ]);

        if (!catalogResponse.ok) {
          throw new Error("Não foi possível carregar o catálogo de recursos.");
        }

        if (!associationsResponse.ok) {
          throw new Error(await readResponseError(associationsResponse));
        }

        const catalog = (await catalogResponse.json()) as CatalogResource[];

        const associations =
          (await associationsResponse.json()) as ResourceAssociation[];

        if (controller.signal.aborted) return;

        const associationsByResource = new Map(
          associations.map((association) => [
            association.recursoId,
            association,
          ]),
        );

        const rows: ResourceRow[] = catalog.map((resource) => {
          const association = associationsByResource.get(resource.id);

          return {
            resourceId: resource.id,
            associationId: association?.id ?? null,
            name: resource.name,
            description: resource.description,
            enabled: Boolean(association),
            available: association?.disponivel ?? true,
            free: association?.gratuito ?? true,
            condition: association?.condicao ?? "",
          };
        });

        setInitialRows(rows);
        reset({ resources: rows });
        setError(null);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar os recursos.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadResources();

    return () => {
      controller.abort();
    };
  }, [establishmentId, loadVersion, reset]);

  const onSubmit = async (data: ResourceFormData) => {
    setError(null);
    setMessage("");

    const originalById = new Map(
      initialRows.map((row) => [row.resourceId, row]),
    );

    const changes = data.resources.filter((resource) => {
      const original = originalById.get(resource.resourceId);

      if (!original) return false;

      if (original.enabled !== resource.enabled) return true;

      if (!resource.enabled) return false;

      return (
        original.available !== resource.available ||
        original.free !== resource.free ||
        original.condition.trim() !== resource.condition.trim()
      );
    });

    if (changes.length === 0) {
      setMessage("Nenhuma alteração para salvar.");
      return;
    }

    try {
      const csrfToken = await getCsrfToken();

      // Executamos em sequência para facilitar a identificação
      // de falhas e respeitar os endpoints individuais do Java.
      for (const resource of changes) {
        if (resource.enabled && resource.associationId === null) {
          await sendResourceRequest(
            `/api/establishments/${establishmentId}/resources/manage`,
            "POST",
            csrfToken,
            resource,
          );
        } else if (!resource.enabled && resource.associationId !== null) {
          await sendResourceRequest(
            `/api/establishments/resources/${resource.associationId}`,
            "DELETE",
            csrfToken,
          );
        } else if (resource.enabled && resource.associationId !== null) {
          await sendResourceRequest(
            `/api/establishments/resources/${resource.associationId}`,
            "PUT",
            csrfToken,
            resource,
          );
        }
      }

      setMessage("Recursos atualizados com sucesso.");
      setIsLoading(true);
      setLoadVersion((version) => version + 1);
    } catch (error) {
      setError(
        `${
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os recursos."
        } Algumas alterações podem ter sido aplicadas. Recarregue os dados antes de tentar novamente.`,
      );
    }
  };

  return (
    <Card className="gap-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
      <CardHeader className="p-0">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Droplets className="size-5 text-primary" />
          Recursos disponíveis
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <p
            role="status"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="size-4 animate-spin" />
            Carregando recursos...
          </p>
        ) : initialRows.length === 0 && !error ? (
          <p className="text-sm text-muted-foreground">
            Nenhum recurso encontrado no catálogo.
          </p>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {initialRows.map((resource, index) => (
              <Controller
                key={resource.resourceId}
                control={control}
                name={`resources.${index}`}
                render={({ field }) => {
                  const value = field.value;

                  return (
                    <div className="space-y-3 rounded-xl border border-neutral-200 p-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value.enabled}
                          onChange={(event) =>
                            field.onChange({
                              ...value,
                              enabled: event.target.checked,
                            })
                          }
                          disabled={isSubmitting}
                          className="size-4 accent-teal-700"
                        />

                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">
                            {value.name}
                          </span>

                          {value.description && (
                            <span className="block text-xs text-muted-foreground">
                              {value.description}
                            </span>
                          )}
                        </span>
                      </label>

                      {value.enabled && (
                        <div className="space-y-3 border-t border-neutral-200 pt-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={value.available}
                              onChange={(event) =>
                                field.onChange({
                                  ...value,
                                  available: event.target.checked,
                                })
                              }
                              disabled={isSubmitting}
                              className="size-4 accent-teal-700"
                            />
                            Disponível atualmente
                          </label>

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={value.free}
                              onChange={(event) =>
                                field.onChange({
                                  ...value,
                                  free: event.target.checked,
                                })
                              }
                              disabled={isSubmitting}
                              className="size-4 accent-teal-700"
                            />
                            Gratuito
                          </label>

                          <div className="grid gap-1.5">
                            <label
                              htmlFor={`condition-${value.resourceId}`}
                              className="text-xs font-medium"
                            >
                              Condições de acesso
                            </label>

                            <Input
                              id={`condition-${value.resourceId}`}
                              value={value.condition}
                              maxLength={500}
                              onChange={(event) =>
                                field.onChange({
                                  ...value,
                                  condition: event.target.value,
                                })
                              }
                              disabled={isSubmitting}
                              placeholder="Ex.: uso liberado sem consumo"
                            />

                            {errors.resources?.[index]?.condition && (
                              <p className="text-xs text-red-600">
                                {errors.resources[index]?.condition?.message}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            ))}

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            {message && (
              <p role="status" className="text-sm text-teal-700">
                {message}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || Boolean(error)}
              className="h-11 w-full rounded-full bg-paro-orange text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar recursos"
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ResourceManagementForm;
