"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, ShieldCheck } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Textarea } from "@/app/_components/ui/textarea";

const accessConditionsSchema = z.object({
  conditions: z
    .string()
    .max(1000, "As condições devem ter no máximo 1000 caracteres."),
});

type AccessConditionsFormData = z.infer<typeof accessConditionsSchema>;

interface AccessConditionsDialogProps {
  establishmentId: number;
}

type EstablishmentResponse = {
  condicoesAcesso: string | null;
};

async function getErrorMessage(response: Response) {
  if (response.status === 401) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (response.status === 403) {
    return "Você não tem permissão para alterar este estabelecimento.";
  }

  const data = await response.json().catch(() => null);

  return data?.message ?? "Não foi possível concluir a operação.";
}

export default function AccessConditionsDialog({
  establishmentId,
}: AccessConditionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [conditions, setConditions] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccessConditionsFormData>({
    resolver: zodResolver(accessConditionsSchema),
    defaultValues: {
      conditions: "",
    },
  });

  useEffect(() => {
    const controller = new AbortController();

    const loadConditions = async () => {
      try {
        const response = await fetch(`/api/establishments/${establishmentId}`, {
          credentials: "include",
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const establishment = (await response.json()) as EstablishmentResponse;

        if (controller.signal.aborted) return;

        setConditions(establishment.condicoesAcesso ?? "");
        setError(null);
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error
            ? error.message
            : "Não foi possível carregar as condições.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    void loadConditions();

    return () => controller.abort();
  }, [establishmentId]);

  const handleOpen = () => {
    reset({ conditions });
    setError(null);
    setSuccessMessage(null);
    setOpen(true);
  };

  const onSubmit = async (data: AccessConditionsFormData) => {
    setError(null);

    try {
      const csrfResponse = await fetch("/api/auth/csrf", {
        credentials: "include",
        cache: "no-store",
      });

      if (!csrfResponse.ok) {
        throw new Error("Não foi possível obter o token CSRF.");
      }

      const csrfData = (await csrfResponse.json()) as {
        headerName: string;
        token: string;
      };

      if (csrfData.headerName !== "X-XSRF-TOKEN" || !csrfData.token) {
        throw new Error("Token CSRF inválido.");
      }

      const response = await fetch(
        `/api/establishments/${establishmentId}/access-conditions`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfData.token,
          },
          body: JSON.stringify({
            condicoesAcesso: data.conditions.trim() || null,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const updated = (await response.json()) as EstablishmentResponse;

      setConditions(updated.condicoesAcesso ?? "");
      setSuccessMessage("Condições de acesso atualizadas.");
      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar as condições.",
      );
    }
  };

  return (
    <>
      <Card className="gap-4 rounded-[18px] border border-neutral-300 bg-white p-4 shadow-none ring-0">
        <CardHeader className="p-0">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="size-5 text-primary" />
            Condições de acesso
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 p-0">
          {isLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Carregando condições...
            </p>
          ) : error && !open ? (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          ) : (
            <>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {conditions || "Condições de acesso ainda não informadas."}
              </p>

              {successMessage && (
                <p role="status" className="text-xs text-teal-700">
                  {successMessage}
                </p>
              )}

              <Button
                type="button"
                onClick={handleOpen}
                className="h-11 w-full rounded-full bg-paro-orange font-semibold text-white hover:bg-paro-orange/90"
              >
                <Pencil className="size-4" />
                Editar condições
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!isSubmitting) setOpen(nextOpen);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-[18px]">
          <DialogHeader>
            <DialogTitle>Condições de acesso</DialogTitle>
            <DialogDescription>
              Informe as regras para utilização dos recursos do estabelecimento.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="conditions"
              control={control}
              render={({ field }) => (
                <div className="space-y-2">
                  <label
                    htmlFor="access-conditions"
                    className="text-sm font-medium"
                  >
                    Condições de acesso
                  </label>

                  <Textarea
                    {...field}
                    id="access-conditions"
                    rows={5}
                    maxLength={1000}
                    disabled={isSubmitting}
                    placeholder="Ex.: acesso permitido para entregadores sem necessidade de consumo."
                  />

                  <p className="text-right text-xs text-muted-foreground">
                    {field.value.length}/1000 caracteres
                  </p>
                </div>
              )}
            />

            {errors.conditions && (
              <p className="text-xs text-red-600">
                {errors.conditions.message}
              </p>
            )}

            {error && (
              <p role="alert" className="text-xs text-red-600">
                {error}
              </p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => setOpen(false)}
                className="rounded-full"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-paro-orange text-white hover:bg-paro-orange/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar condições"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
